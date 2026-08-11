import { Global, Injectable, Module } from '@nestjs/common';
import type { GraphDelta } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';

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
  /** Optional graph delta to broadcast alongside the activity event. */
  delta?: GraphDelta;
  /** Backwards-compatible free-form metadata persisted on the event row. */
  metadata?: Record<string, unknown>;
}

/**
 * Records audit/activity events for the investigation activity stream and
 * broadcasts realtime deltas to authorized clients (Phase 3 §41).
 *
 * Delivering is best-effort and authorization-filtered inside RealtimeService;
 * the durable ActivityEvent row is the source of truth.
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  record(
    principal: AuthenticatedPrincipal,
    input: ActivityInput,
  ): Promise<unknown> {
    const promise = this.prisma.activityEvent.create({
      data: {
        type: input.type,
        message: input.message,
        investigationId: input.investigationId ?? null,
        workspaceId: input.workspaceId ?? principal.workspaceId,
        metadata: (input.delta ?? input.metadata ?? undefined) as never,
        organizationId: principal.organizationId,
        userId: principal.userId,
      },
      select: { id: true, type: true, message: true, createdAt: true },
    });

    // Fire-and-forget broadcast; never couples the mutation to the stream.
    void promise.then(() => {
      try {
        this.realtime.emitDelta(principal, {
          type: this.streamType(input.type),
          investigationId: input.investigationId ?? null,
          delta: input.delta,
          message: input.message,
        });
      } catch {
        // Broadcast failures must not fail the originating request.
      }
    });

    return promise;
  }

  private streamType(type: ActivityType): 'graph' | 'timeline' | 'activity' {
    if (
      type === 'ENTITY_CREATED' ||
      type === 'ENTITY_UPDATED' ||
      type === 'ENTITY_ARCHIVED' ||
      type === 'RELATIONSHIP_CREATED' ||
      type === 'RELATIONSHIP_UPDATED' ||
      type === 'RELATIONSHIP_REMOVED'
    ) {
      return 'graph';
    }
    return 'activity';
  }
}

@Global()
@Module({
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}