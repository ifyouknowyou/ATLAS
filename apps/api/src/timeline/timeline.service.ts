import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { TimelineEventItem } from '@atlas/shared';
import { ListTimelineQueryDto } from './timeline.dto';

/**
 * Timeline intelligence (Phase 3).
 *
 * Read-only chronological projection over TimelineEvent. Every query is
 * org-scoped and, when an investigation is targeted, membership-scoped.
 */
@Injectable()
export class TimelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
  ) {}

  private async assertRead(principal: AuthenticatedPrincipal, investigationId?: string) {
    if (investigationId) {
      await this.access.requireCapability(principal, investigationId, 'read');
    }
  }

  async list(
    principal: AuthenticatedPrincipal,
    query: ListTimelineQueryDto,
  ): Promise<{ items: TimelineEventItem[]; total: number }> {
    await this.assertRead(principal, query.investigationId);

    // An entity-scoped query must also resolve that entity even without an
    // investigation filter (it is org-scoped, so this is a membership check).
    if (query.entityId && !query.investigationId) {
      const entity = await this.prisma.entity.findFirst({
        where: { id: query.entityId, organizationId: principal.organizationId },
      });
      requireFound(entity, 'Entity');
    }

    const where: Prisma.TimelineEventWhereInput = {
      organizationId: principal.organizationId,
      ...(query.investigationId ? { investigationId: query.investigationId } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.from || query.to
        ? {
            occurredAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(this.access.listAccessWhere(principal) ?? {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: query.offset,
        take: query.limit,
        select: {
          id: true,
          title: true,
          description: true,
          kind: true,
          occurredAt: true,
          investigationId: true,
          entityId: true,
          createdById: true,
          createdBy: { select: { displayName: true } },
        },
      }),
      this.prisma.timelineEvent.count({ where }),
    ]);

    const items: TimelineEventItem[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      kind: r.kind,
      occurredAt: r.occurredAt.toISOString(),
      investigationId: r.investigationId,
      entityId: r.entityId,
      createdById: r.createdById,
      createdByDisplayName: r.createdBy.displayName,
    }));

    return { items, total };
  }
}