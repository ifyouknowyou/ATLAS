import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { CollaborationAccessService } from './collaboration-access.service';
import { NotificationsService } from './notifications.service';
import { RealtimeService } from '../realtime/realtime.service';

export interface CreateCommentInput {
  targetType: string;
  targetId: string;
  body: string;
}

const MENTION_RE = /@([A-Za-z0-9._-]+)/g;

/**
 * Contextual comments (§39, §40).
 *
 * Comments attach to any CommentTargetType. @mention resolution only ever
 * considers users who can read the target — mentioning a user without access
 * silently drops them (never reveals inaccessible users). Mentions create
 * permission-aware notifications and broadcasts.
 */
@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CollaborationAccessService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeService,
  ) {}

  async list(
    principal: AuthenticatedPrincipal,
    targetType: string,
    targetId: string,
    limit = 100,
  ) {
    await this.access.requireTarget(principal, targetType, targetId);
    return this.prisma.comment.findMany({
      where: { targetType: targetType as never, targetId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: {
        author: { select: { id: true, displayName: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, displayName: true } } },
        },
        _count: { select: { replies: true } },
      },
    });
  }

  async create(principal: AuthenticatedPrincipal, input: CreateCommentInput) {
    const target = await this.access.requireTarget(principal, input.targetType, input.targetId);
    const mentionedUsers = await this.resolveMentions(principal, target, input.body);

    const comment = await this.prisma.comment.create({
      data: {
        authorId: principal.userId,
        organizationId: principal.organizationId,
        investigationId: target.investigationId,
        targetType: input.targetType as never,
        targetId: input.targetId,
        body: input.body,
      },
      include: {
        author: { select: { id: true, displayName: true } },
        replies: { include: { author: { select: { id: true, displayName: true } } } },
        _count: { select: { replies: true } },
      },
    });

    // Persist mentions + permission-aware notifications.
    const actorName = await this.actorName(principal);
    for (const userId of mentionedUsers) {
      if (userId === principal.userId) continue;
      await this.prisma.mention.create({
        data: {
          userId,
          mentionedById: principal.userId,
          organizationId: principal.organizationId,
          investigationId: target.investigationId,
          commentId: comment.id,
        },
      });
      await this.notifications.create(principal, {
        recipientId: userId,
        kind: 'MENTION',
        title: `${actorName} mentioned you`,
        body: input.body.slice(0, 200),
        targetType: input.targetType,
        targetId: input.targetId,
        investigationId: target.investigationId,
        actorId: principal.userId,
      });
    }

    this.realtime.publish(principal.organizationId, {
      type: 'comment',
      investigationId: target.investigationId,
      resourceType: (input.targetType as never) ?? null,
      resourceId: input.targetId,
      message: 'comment.added',
    });
    return comment;
  }

  async reply(
    principal: AuthenticatedPrincipal,
    commentId: string,
    body: string,
  ) {
    const parent = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: { id: true, displayName: true } } },
    });
    if (!parent || parent.organizationId !== principal.organizationId) {
      throw new ForbiddenException('Comment not accessible');
    }
    const target = await this.access.requireTarget(
      principal,
      parent.targetType,
      parent.targetId,
    );
    const mentionedUsers = await this.resolveMentions(principal, target, body);

    const reply = await this.prisma.commentReply.create({
      data: {
        commentId,
        authorId: principal.userId,
        body,
        organizationId: principal.organizationId,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });

    const actorName = await this.actorName(principal);
    for (const userId of mentionedUsers) {
      if (userId === principal.userId) continue;
      await this.prisma.mention.create({
        data: {
          userId,
          mentionedById: principal.userId,
          organizationId: principal.organizationId,
          investigationId: target.investigationId,
          replyId: reply.id,
        },
      });
      await this.notifications.create(principal, {
        recipientId: userId,
        kind: 'MENTION',
        title: `${actorName} mentioned you in a reply`,
        body: body.slice(0, 200),
        targetType: parent.targetType,
        targetId: parent.targetId,
        investigationId: target.investigationId,
        actorId: principal.userId,
      });
    }

    // Notify the original author of a reply they didn't write.
    if (parent.authorId !== principal.userId) {
      await this.notifications.create(principal, {
        recipientId: parent.authorId,
        kind: 'COMMENT_REPLY',
        title: `${actorName} replied to your comment`,
        body: body.slice(0, 200),
        targetType: parent.targetType,
        targetId: parent.targetId,
        investigationId: target.investigationId,
        actorId: principal.userId,
      });
    }

    this.realtime.publish(principal.organizationId, {
      type: 'comment',
      investigationId: target.investigationId,
      resourceType: (parent.targetType as never) ?? null,
      resourceId: parent.targetId,
      message: 'comment.reply',
    });
    return reply;
  }

  async edit(principal: AuthenticatedPrincipal, commentId: string, body: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, organizationId: principal.organizationId },
    });
    if (!comment) throw new ForbiddenException('Comment not accessible');
    if (comment.authorId !== principal.userId && !principal.permissions.includes('comment.delete')) {
      throw new ForbiddenException('Only the author can edit this comment');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { body },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  async remove(principal: AuthenticatedPrincipal, commentId: string): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, organizationId: principal.organizationId },
    });
    if (!comment) throw new ForbiddenException('Comment not accessible');
    if (comment.authorId !== principal.userId && !principal.permissions.includes('comment.delete')) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async resolve(
    principal: AuthenticatedPrincipal,
    commentId: string,
    resolved: boolean,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, organizationId: principal.organizationId },
    });
    if (!comment) throw new ForbiddenException('Comment not accessible');
    // Resolving requires the comment permission or author.
    if (comment.authorId !== principal.userId && !principal.permissions.includes('comment.resolve')) {
      throw new ForbiddenException('Not authorized to resolve this comment');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { resolvedAt: resolved ? new Date() : null },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  private async actorName(principal: AuthenticatedPrincipal): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: principal.userId },
      select: { displayName: true },
    });
    return user?.displayName ?? 'Someone';
  }

  /** Resolve @mentions only over users who can read the target. */
  private async resolveMentions(
    principal: AuthenticatedPrincipal,
    target: { investigationId: string | null },
    body: string,
  ): Promise<string[]> {
    const usernames = [...body.matchAll(MENTION_RE)].map((m) => m[1].toLowerCase());
    if (usernames.length === 0) return [];
    // Resolve against displayName (the @handle users type) in this org.
    const users = await this.prisma.user.findMany({
      where: {
        displayName: { in: usernames, mode: 'insensitive' },
        memberships: { some: { organizationId: principal.organizationId } },
      },
      select: { id: true, displayName: true, memberships: { select: { role: true } } },
      take: 20,
    });
    const result: string[] = [];
    for (const user of users) {
      const membership = user.memberships[0];
      if (!membership) continue; // not in this org — silently dropped
      if (target.investigationId) {
        const member = await this.prisma.investigationMember.findUnique({
          where: {
            investigationId_userId: {
              investigationId: target.investigationId,
              userId: user.id,
            },
          },
        });
        if (!member && !['OWNER', 'ADMIN'].includes(membership.role)) continue;
      }
      result.push(user.id);
    }
    return result;
  }
}
