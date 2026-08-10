import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

export type ActivityType =
  | 'INVESTIGATION_CREATED'
  | 'INVESTIGATION_UPDATED'
  | 'INVESTIGATION_ARCHIVED'
  | 'ENTITY_CREATED'
  | 'ENTITY_UPDATED'
  | 'ENTITY_ARCHIVED'
  | 'RELATIONSHIP_CREATED'
  | 'RELATIONSHIP_UPDATED'
  | 'RELATIONSHIP_REMOVED'
  | 'EVIDENCE_ADDED'
  | 'EVIDENCE_UPDATED'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_ROLE_CHANGED';

export interface ActivityInput {
  type: ActivityType;
  message: string;
  investigationId?: string | null;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Records audit/activity events for the investigation activity stream.
 * Phase 5 turns this feed into realtime broadcast; the durable record exists
 * now so the stream is immediate and complete.
 */
@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  record(
    principal: AuthenticatedPrincipal,
    input: ActivityInput,
  ): Promise<unknown> {
    return this.prisma.activityEvent.create({
      data: {
        type: input.type,
        message: input.message,
        investigationId: input.investigationId ?? null,
        workspaceId: input.workspaceId ?? principal.workspaceId,
        metadata: (input.metadata ?? undefined) as never,
        organizationId: principal.organizationId,
        userId: principal.userId,
      },
      select: { id: true, type: true, message: true, createdAt: true },
    });
  }
}

@Global()
@Module({
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}