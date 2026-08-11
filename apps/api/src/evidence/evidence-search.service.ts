import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { EvidenceAccessService } from './evidence-access.service';

export interface EvidenceSearchQuery {
  q?: string;
  type?: string;
  status?: string;
  classification?: string;
  investigationId?: string;
  uploaderId?: string;
  from?: string;
  to?: string;
  hash?: string;
  limit?: number;
  offset?: number;
}

/**
 * Advanced evidence search (§17): title/description/content full-text-ish
 * search plus kind/status/classification/investigation/uploader/date/hash
 * filters, all scoped to the caller's org + investigation membership +
 * classification visibility.
 */
@Injectable()
export class EvidenceSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EvidenceAccessService,
  ) {}

  async search(principal: AuthenticatedPrincipal, query: EvidenceSearchQuery) {
    const limit = Math.min(query.limit ?? 50, 200);
    const offset = Math.min(query.offset ?? 0, 10_000);

    const where = this.access.listEvidenceWhere(principal) as Prisma.EvidenceWhereInput;
    if (query.type) where.kind = query.type as never;
    if (query.status) where.status = query.status as never;
    if (query.classification) where.classification = query.classification as never;
    if (query.investigationId) where.investigationId = query.investigationId;
    if (query.uploaderId) where.createdById = query.uploaderId;
    if (query.hash) where.hash = query.hash.toLowerCase();
    if (query.q) {
      const contains = { contains: query.q, mode: 'insensitive' as const };
      where.OR = [{ name: contains }, { title: contains }, { description: contains }, { content: contains }];
    }
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.evidence.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          kind: true,
          title: true,
          description: true,
          classification: true,
          hash: true,
          mimeType: true,
          size: true,
          status: true,
          processingStatus: true,
          investigationId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, displayName: true } },
          _count: { select: { versions: true, annotations: true, accessEvents: true, links: true } },
        },
      }),
      this.prisma.evidence.count({ where }),
    ]);

    return { items, total, limit, offset };
  }
}
