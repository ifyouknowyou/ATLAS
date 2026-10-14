import { Global, Injectable, Module } from '@nestjs/common';
import type { GraphDelta } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeModule } from '../realtime/realtime.module';

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
  | 'MEMBER_ROLE_CHANGED'
  | 'AI_CHAT_CREATED'
  | 'AI_SUMMARY_CREATED'
  | 'EVIDENCE_REMOVED'
  | 'EVIDENCE_UPLOADED'
  | 'EVIDENCE_ANNOTATED'
  | 'EVIDENCE_CLASSIFIED'
  | 'EVIDENCE_PROCESSED'
  | 'REPORT_CREATED'
  | 'REPORT_UPDATED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_REVIEWED'
  | 'REPORT_APPROVED'
  | 'REPORT_REJECTED'
  | 'REPORT_PUBLISHED'
  | 'REPORT_EXPORTED'
  | 'COMMENT_ADDED'
  | 'MENTION_ADDED'
  | 'PRESENCE_UPDATED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'TASK_CREATED_FROM_AI'
  | 'COLLABORATION_ACTIVITY';

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

  private streamType(
    type: ActivityType,
  ): 'graph' | 'timeline' | 'activity' | 'evidence' | 'report' | 'comment' | 'presence' {
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
    if (
      type === 'EVIDENCE_ADDED' ||
      type === 'EVIDENCE_REMOVED' ||
      type === 'EVIDENCE_UPLOADED' ||
      type === 'EVIDENCE_ANNOTATED' ||
      type === 'EVIDENCE_CLASSIFIED' ||
      type === 'EVIDENCE_PROCESSED'
    ) {
      return 'evidence';
    }
    if (
      type === 'REPORT_CREATED' ||
      type === 'REPORT_UPDATED' ||
      type === 'REPORT_SUBMITTED' ||
      type === 'REPORT_REVIEWED' ||
      type === 'REPORT_APPROVED' ||
      type === 'REPORT_REJECTED' ||
      type === 'REPORT_PUBLISHED' ||
      type === 'REPORT_EXPORTED'
    ) {
      return 'report';
    }
    if (
      type === 'COMMENT_ADDED' ||
      type === 'MENTION_ADDED'
    ) {
      return 'comment';
    }
    if (type === 'PRESENCE_UPDATED') {
      return 'presence';
    }
    return 'activity';
  }
}

@Global()
@Module({
  imports: [RealtimeModule],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}