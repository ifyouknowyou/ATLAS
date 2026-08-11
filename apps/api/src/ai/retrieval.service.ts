import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { AiSourceRef } from '@atlas/shared';

const TOP_N = 20;
const RECENT_N = 10;
const SNIPPET_MAX = 600;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'what', 'who', 'how', 'why',
  'does', 'do', 'did', 'can', 'could', 'would', 'should', 'have', 'has',
  'had', 'about', 'at', 'by', 'from', 'into', 'over', 'under', 'this',
  'that', 'these', 'those', 'it', 'its', 'their', 'them', 'tell', 'me',
]);

/** Minimal text reference to a tenant-scoped record. */
interface RetrievalRow {
  kind: AiSourceRef['kind'];
  id: string;
  investigationId: string | null;
  label: string;
  snippet?: string | null;
}

interface RetrievalPlan {
  sources: AiSourceRef[];
  contextText: string;
}

/**
 * Tenant-isolated context retrieval for the AI engine (Phase 4).
 *
 * Always scoped by organizationId + investigation membership. For an explicit
 * investigation the caller has already been vetted upstream (Investigation
 * AccessService.resolve) so the strict `{ organizationId, investigationId }`
 * filter is safe; org-wide retrieval reuses listAccessWhere so only org-level
 * records and records in investigations the user belongs to are returned.
 */
@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
  ) {}

  /** Split a free-text query into meaningful keyword terms. */
  tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length >= 3 && !STOPWORDS.has(term));
  }

  async retrieve(
    principal: AuthenticatedPrincipal,
    options: { investigationId?: string; terms?: string[] },
  ): Promise<RetrievalPlan> {
    const terms = (options.terms ?? []).slice(0, 6);
    const scoped =
      options.investigationId !== undefined
        ? { organizationId: principal.organizationId, investigationId: options.investigationId }
        : { organizationId: principal.organizationId, ...(this.access.listAccessWhere(principal) ?? {}) };

    const rows = await this.queryRows(scoped, terms);
    const sources = rows.map(toSource);
    return { sources, contextText: buildContextText(sources) };
  }

  private async queryRows(
    scoped: Record<string, unknown>,
    terms: string[],
  ): Promise<RetrievalRow[]> {
    const keyword = terms.length > 0;
    const entityWhere = {
      ...scoped,
      ...(keyword
        ? {
            OR: terms.map((t) => ({
              OR: [
                { name: { contains: t, mode: 'insensitive' as const } },
                { summary: { contains: t, mode: 'insensitive' as const } },
              ],
            })),
          }
        : {}),
    };
    const evidenceWhere = {
      ...scoped,
      ...(keyword
        ? {
            OR: terms.map((t) => ({
              OR: [
                { name: { contains: t, mode: 'insensitive' as const } },
                { title: { contains: t, mode: 'insensitive' as const } },
                { content: { contains: t, mode: 'insensitive' as const } },
              ],
            })),
          }
        : {}),
    };
    const noteWhere = {
      ...scoped,
      ...(keyword
        ? {
            OR: terms.map((t) => ({
              OR: [
                { title: { contains: t, mode: 'insensitive' as const } },
                { body: { contains: t, mode: 'insensitive' as const } },
              ],
            })),
          }
        : {}),
    };

    const [entities, evidence, notes] = await Promise.all([
      this.prisma.entity.findMany({
        where: entityWhere,
        select: { id: true, name: true, summary: true, investigationId: true },
        orderBy: { updatedAt: 'desc' },
        take: keyword ? TOP_N : RECENT_N,
      }),
      this.prisma.evidence.findMany({
        where: evidenceWhere,
        select: { id: true, name: true, title: true, content: true, investigationId: true },
        orderBy: { updatedAt: 'desc' },
        take: keyword ? TOP_N : RECENT_N,
      }),
      this.prisma.note.findMany({
        where: noteWhere,
        select: { id: true, title: true, body: true, investigationId: true },
        orderBy: { updatedAt: 'desc' },
        take: keyword ? TOP_N : RECENT_N,
      }),
    ]);

    const rows: RetrievalRow[] = [];
    for (const e of entities) {
      rows.push({
        kind: 'ENTITY',
        id: e.id,
        investigationId: e.investigationId,
        label: e.name,
        snippet: e.summary,
      });
    }
    for (const ev of evidence) {
      rows.push({
        kind: 'EVIDENCE',
        id: ev.id,
        investigationId: ev.investigationId,
        label: ev.title ?? ev.name,
        snippet: ev.content,
      });
    }
    for (const n of notes) {
      rows.push({
        kind: 'NOTE',
        id: n.id,
        investigationId: n.investigationId,
        label: n.title,
        snippet: n.body,
      });
    }
    return rows;
  }
}

function toSource(row: RetrievalRow): AiSourceRef {
  return {
    kind: row.kind,
    id: row.id,
    title: row.label,
    snippet: truncate(row.snippet),
    investigationId: row.investigationId,
  };
}

function truncate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.length > SNIPPET_MAX
    ? `${value.slice(0, SNIPPET_MAX)}…`
    : value;
}

function buildContextText(sources: AiSourceRef[]): string {
  if (sources.length === 0) return '(No relevant records found in scope.)';
  return sources
    .map((s) => `- [${s.kind}] ${s.title}${s.snippet ? `: ${s.snippet}` : ''}`)
    .join('\n');
}
