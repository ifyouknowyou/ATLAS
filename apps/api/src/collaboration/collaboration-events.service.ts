import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';
import { ActivityService } from '../common/activity.service';

export interface CollaborationEventInput {
  type: string;
  resourceType?: string | null;
  resourceId?: string | null;
  investigationId?: string | null;
  payload?: Record<string, unknown> | null;
}

/**
 * Single source for collaboration activity (§37, §45): persists a
 * CollaborationEvent row, records an ActivityEvent, and broadcasts to
 * authorized clients over SSE.
 */
@Injectable()
export class CollaborationEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly activity: ActivityService,
  ) {}

  async emit(
    principal: AuthenticatedPrincipal,
    input: CollaborationEventInput,
  ): Promise<{ id: string }> {
    const event = await this.prisma.collaborationEvent.create({
      data: {
        organizationId: principal.organizationId,
        investigationId: input.investigationId ?? null,
        type: input.type,
        resourceType: input.resourceType ?? null,
        resourceId: input.resourceId ?? null,
        actorId: principal.userId,
        payload: (input.payload ?? null) as never,
      },
    });

    await this.activity.record(principal, {
      type: this.mapToActivityType(input.type) as never,
      message: input.type,
      investigationId: input.investigationId,
      metadata: { resourceType: input.resourceType, resourceId: input.resourceId },
    });

    this.realtime.publish(principal.organizationId, {
      type: 'activity',
      investigationId: input.investigationId ?? null,
      resourceType: (input.resourceType as never) ?? null,
      resourceId: input.resourceId ?? null,
      message: input.type,
    });
    return { id: event.id };
  }

  private mapToActivityType(type: string): string {
    // Safe mapping: unknown types fall back to a generic activity record.
    const known = new Set([
      'ENTITY_CREATED',
      'RELATIONSHIP_UPDATED',
      'EVIDENCE_UPLOADED',
      'TASK_COMPLETED',
      'NOTE_EDITED',
      'REPORT_UPDATED',
      'COMMENT_ADDED',
      'MENTION_ADDED',
      'MEMBER_ADDED',
      'AI_ANALYSIS_COMPLETED',
    ]);
    return known.has(type) ? (type as never) : 'COLLABORATION_ACTIVITY';
  }
}
