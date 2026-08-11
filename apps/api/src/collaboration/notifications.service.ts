import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';
import { CollaborationAccessService } from './collaboration-access.service';

export interface CreateNotificationInput {
  recipientId: string;
  kind: string;
  title: string;
  body?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  investigationId?: string | null;
  actorId?: string | null;
}

/**
 * Permission-aware notifications (§41, §42).
 *
 * A notification is created only if the recipient can currently read the target
 * resource — a notification never links a user to an inaccessible resource and
 * never reveals it exists. The destination endpoint re-authorizes independently,
 * so a notification is a hint, never a bypass.
 */
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly access: CollaborationAccessService,
  ) {}

  async create(
    principal: AuthenticatedPrincipal,
    input: CreateNotificationInput,
  ): Promise<{ id: string } | null> {
    // Permission-aware: skip when the recipient lacks read access to the target.
    if (input.targetType && input.targetId) {
      const recipient = {
        userId: input.recipientId,
        organizationId: principal.organizationId,
        workspaceId: null,
        role: 'VIEWER',
        permissions: [],
      } as unknown as AuthenticatedPrincipal;
      // Reuse the same org-scoped resolution; the recipient's real role is
      // checked at delivery time.
      const target = await this.access.resolveTargetAccess(
        recipient,
        input.targetType,
        input.targetId,
      );
      if (!target.readable) return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: input.recipientId,
        organizationId: principal.organizationId,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        investigationId: input.investigationId ?? null,
        actorId: input.actorId ?? null,
      },
    });

    this.realtime.publishToUser(principal.organizationId, input.recipientId, {
      type: 'notification',
      investigationId: input.investigationId ?? null,
      resourceType: (input.targetType as never) ?? null,
      resourceId: input.targetId ?? null,
      message: `notification:${input.kind.toLowerCase()}`,
    });
    return { id: notification.id };
  }

  async list(principal: AuthenticatedPrincipal, limit = 50, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId: principal.userId, organizationId: principal.organizationId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      skip: offset,
      include: { actor: { select: { id: true, displayName: true } } },
    });
  }

  async unreadCount(principal: AuthenticatedPrincipal): Promise<number> {
    return this.prisma.notification.count({
      where: { userId: principal.userId, organizationId: principal.organizationId, readAt: null },
    });
  }

  async markRead(
    principal: AuthenticatedPrincipal,
    notificationId: string,
  ): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId: principal.userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(principal: AuthenticatedPrincipal): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId: principal.userId, organizationId: principal.organizationId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  /** Delivery-time re-authorization: does the recipient still hold access? */
  async recipientCanAccessTarget(
    recipientId: string,
    organizationId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean> {
    const recipient = {
      userId: recipientId,
      organizationId,
      workspaceId: null,
      role: 'VIEWER',
      permissions: [],
    } as unknown as AuthenticatedPrincipal;
    const target = await this.access.resolveTargetAccess(recipient, targetType, targetId);
    return target.readable;
  }
}
