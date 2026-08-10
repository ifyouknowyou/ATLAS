import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';

export interface SearchResultItem {
  kind:
    | 'INVESTIGATION'
    | 'ENTITY'
    | 'RELATIONSHIP'
    | 'EVIDENCE'
    | 'NOTE'
    | 'TASK';
  id: string;
  label: string;
  detail?: string;
  /** Frontend route to the resource. */
  href: string;
}

const PER_KIND_LIMIT = 5;

/**
 * Unified, debounced-server-side search across investigations, entities,
 * relationships, evidence, notes and tasks. Queries are org-scoped and respect
 * investigation membership (non-admins only see accessible data). Bounded
 * per-kind limits keep each keystroke cheap.
 */
@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
  ) {}

  async search(
    principal: AuthenticatedPrincipal,
    q: string,
    limit = PER_KIND_LIMIT,
  ): Promise<SearchResultItem[]> {
    const term = q.trim();
    if (term.length < 2) {
      return [];
    }
    const perKind = Math.min(limit, PER_KIND_LIMIT);
    const contains = {
      contains: term,
      mode: 'insensitive' as const,
    };
    const org = principal.organizationId;
    const invAccess = this.access.investigationListWhere(principal);

    const results = await Promise.all([
      this.prisma.investigation.findMany({
        where: {
          organizationId: org,
          archivedAt: null,
          title: contains,
          ...(invAccess ?? {}),
        },
        select: { id: true, title: true, status: true },
        take: perKind,
      }),
      this.prisma.entity.findMany({
        where: {
          organizationId: org,
          ...(this.access.listAccessWhere(principal) ?? {}),
          OR: [
            { name: contains },
            { displayName: contains },
            { summary: contains },
          ],
        },
        select: { id: true, name: true, type: true, investigationId: true },
        take: perKind,
      }),
      this.prisma.evidence.findMany({
        where: {
          organizationId: org,
          ...(this.access.listAccessWhere(principal) ?? {}),
          name: contains,
        },
        select: { id: true, name: true, kind: true, investigationId: true },
        take: perKind,
      }),
      this.prisma.note.findMany({
        where: {
          organizationId: org,
          ...(this.access.listAccessWhere(principal) ?? {}),
          OR: [{ title: contains }, { body: contains }],
        },
        select: { id: true, title: true, investigationId: true },
        take: perKind,
      }),
      this.prisma.task.findMany({
        where: {
          investigation: {
            organizationId: org,
            ...(invAccess ?? {}),
          },
          title: contains,
        },
        select: { id: true, title: true, investigationId: true },
        take: perKind,
      }),
      this.prisma.relationship.findMany({
        where: {
          organizationId: org,
          ...(this.access.listAccessWhere(principal) ?? {}),
          description: contains,
        },
        select: {
          id: true,
          kind: true,
          investigationId: true,
          source: { select: { name: true } },
          target: { select: { name: true } },
        },
        take: perKind,
      }),
    ]);

    const items: SearchResultItem[] = [];

    for (const inv of results[0]) {
      items.push({
        kind: 'INVESTIGATION',
        id: inv.id,
        label: inv.title,
        detail: inv.status,
        href: `/investigations/${inv.id}`,
      });
    }
    for (const entity of results[1]) {
      items.push({
        kind: 'ENTITY',
        id: entity.id,
        label: entity.name,
        detail: entity.type,
        href: `/entities/${entity.id}`,
      });
    }
    for (const evidence of results[2]) {
      items.push({
        kind: 'EVIDENCE',
        id: evidence.id,
        label: evidence.name,
        detail: evidence.kind,
        href: evidence.investigationId
          ? `/investigations/${evidence.investigationId}?tab=EVIDENCE`
          : '/evidence',
      });
    }
    for (const note of results[3]) {
      items.push({
        kind: 'NOTE',
        id: note.id,
        label: note.title,
        href: note.investigationId
          ? `/investigations/${note.investigationId}?tab=NOTES`
          : '/notes',
      });
    }
    for (const task of results[4]) {
      items.push({
        kind: 'TASK',
        id: task.id,
        label: task.title,
        href: task.investigationId
          ? `/investigations/${task.investigationId}?tab=TASKS`
          : '/investigations',
      });
    }
    for (const rel of results[5]) {
      items.push({
        kind: 'RELATIONSHIP',
        id: rel.id,
        label: `${rel.source.name} ↔ ${rel.target.name}`,
        detail: rel.kind,
        href: rel.investigationId
          ? `/investigations/${rel.investigationId}?tab=RELATIONSHIPS`
          : '/relationships',
      });
    }

    return items;
  }
}