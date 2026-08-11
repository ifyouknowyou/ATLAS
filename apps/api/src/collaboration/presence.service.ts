import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';
import { CollaborationAccessService } from './collaboration-access.service';

const ACTIVE_WINDOW_MS = 30_000;

export type PresenceResourceType = 'INVESTIGATION' | 'EVIDENCE' | 'REPORT';

/**
 * Real-time presence (§36). Heartbeats are plain REST POSTs that upsert a
 * PresenceSession; only presence deltas are broadcast over SSE. The active-now
 * list is access-filtered and never exposes more than a name + status.
 */
@Injectable()
export class PresenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly access: CollaborationAccessService,
  ) {}

  async heartbeat(
    principal: AuthenticatedPrincipal,
    resourceType: PresenceResourceType,
    resourceId: string,
    sessionKey?: string,
  ): Promise<{ active: boolean }> {
    // Presence only within resources the user can read.
    await this.access.requireTarget(principal, resourceType, resourceId);
    const key = sessionKey ?? 'default';

    const session = await this.prisma.presenceSession.upsert({
      where: {
        resourceType_resourceId_sessionKey: { resourceType, resourceId, sessionKey: key },
      },
      update: { userId: principal.userId, lastSeenAt: new Date(), status: 'ACTIVE' },
      create: {
        userId: principal.userId,
        organizationId: principal.organizationId,
        resourceType,
        resourceId,
        sessionKey: key,
        status: 'ACTIVE',
        lastSeenAt: new Date(),
      },
    });

    this.realtime.publish(principal.organizationId, {
      type: 'presence',
      investigationId: resourceType === 'INVESTIGATION' ? resourceId : null,
      resourceType: resourceType as never,
      resourceId,
      presence: {
        userId: principal.userId,
        displayName: principal.userId.slice(0, 8),
        resourceType: resourceType as never,
        resourceId,
        status: 'ACTIVE',
        lastSeenAt: new Date().toISOString(),
      },
      message: 'presence.heartbeat',
    });
    return { active: true };
  }

  /** Users active on a resource within the last 30s. */
  async activeNow(
    principal: AuthenticatedPrincipal,
    resourceType: string,
    resourceId: string,
  ): Promise<unknown[]> {
    await this.access.requireTarget(principal, resourceType, resourceId);
    const since = new Date(Date.now() - ACTIVE_WINDOW_MS);
    const sessions = await this.prisma.presenceSession.findMany({
      where: {
        resourceType,
        resourceId,
        organizationId: principal.organizationId,
        lastSeenAt: { gte: since },
        status: { not: 'OFFLINE' },
      },
      include: { user: { select: { id: true, displayName: true } } },
      orderBy: { lastSeenAt: 'desc' },
      distinct: ['userId'],
    });
    return sessions.map((s) => ({
      userId: s.userId,
      displayName: s.user.displayName,
      resourceType,
      resourceId,
      status: s.status,
      lastSeenAt: s.lastSeenAt.toISOString(),
    }));
  }

  async leave(
    principal: AuthenticatedPrincipal,
    resourceType: string,
    resourceId: string,
    sessionKey?: string,
  ): Promise<void> {
    await this.prisma.presenceSession.updateMany({
      where: {
        resourceType,
        resourceId,
        userId: principal.userId,
        sessionKey: sessionKey ?? 'default',
      },
      data: { status: 'OFFLINE', lastSeenAt: new Date(Date.now() - 60_000) },
    });
    this.realtime.publish(principal.organizationId, {
      type: 'presence',
      investigationId: resourceType === 'INVESTIGATION' ? resourceId : null,
      resourceType: resourceType as never,
      resourceId,
      message: 'presence.leave',
    });
  }

  static sessionKey(): string {
    return randomUUID();
  }
}
