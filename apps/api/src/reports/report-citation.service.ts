import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';

/** Validated at citation creation: target must exist + be readable. */
const TARGET_TABLES: Record<string, string> = {
  EVIDENCE: 'evidence',
  ENTITY: 'entity',
  RELATIONSHIP: 'relationship',
  TIMELINE_EVENT: 'timelineEvent',
  NOTE: 'note',
  REPORT: 'report',
  INVESTIGATION: 'investigation',
};

/**
 * Report citations (§28, §29). Every citation validates the target exists AND
 * the caller can read it (403 otherwise) — no dangling or unauthorized
 * citations. Sources resolve to display references used by exports.
 */
@Injectable()
export class ReportCitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
  ) {}

  async list(reportId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.reportCitation.findMany({
      where: { reportId, organizationId },
      orderBy: { order: 'asc' },
      include: { createdBy: { select: { id: true, displayName: true } } },
    });
  }

  async create(
    principal: AuthenticatedPrincipal,
    reportId: string,
    input: {
      targetType: string;
      targetId: string;
      blockId?: string;
      snippet?: string;
      sourceRef?: string;
    },
  ) {
    await this.access.requireReport(principal, reportId, 'edit');
    const table = TARGET_TABLES[input.targetType];
    if (!table) throw new NotFoundException('Unsupported citation target');

    // Validate target exists + readable by the caller.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as Record<string, any>)[table];
    const target = await delegate.findFirst({
      where: { id: input.targetId, organizationId: principal.organizationId },
      select: { id: true },
    });
    if (!target) {
      throw new ForbiddenException('Citation target not found or not accessible');
    }
    // The citation target must itself be readable.
    await this.assertTargetReadable(principal, input.targetType, input.targetId);

    const count = await this.prisma.reportCitation.count({ where: { reportId } });
    return this.prisma.reportCitation.create({
      data: {
        reportId,
        sectionId: input.blockId ? null : null,
        blockId: input.blockId ?? null,
        targetType: input.targetType,
        targetId: input.targetId,
        snippet: input.snippet ?? null,
        sourceRef: input.sourceRef ?? null,
        order: count,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });
  }

  async remove(
    principal: AuthenticatedPrincipal,
    citationId: string,
    organizationId: string,
  ): Promise<void> {
    const citation = await this.prisma.reportCitation.findFirst({
      where: { id: citationId, organizationId },
    });
    if (!citation) throw new NotFoundException('Citation not found');
    await this.access.requireReport(principal, citation.reportId, 'edit');
    await this.prisma.reportCitation.delete({ where: { id: citationId } });
  }

  /** Resolve source display refs for export (§29). */
  async resolveSourceRefs(
    organizationId: string,
    citations: Array<{ id: string; targetType: string; targetId: string }>,
  ): Promise<Array<{ id: string; title: string }>> {
    const out: Array<{ id: string; title: string }> = [];
    for (const c of citations) {
      const table = TARGET_TABLES[c.targetType];
      if (!table) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegate = (this.prisma as Record<string, any>)[table];
      const row = await delegate.findFirst({
        where: { id: c.targetId, organizationId },
        select: { id: true, name: true, title: true },
      });
      if (row) out.push({ id: row.id, title: row.name ?? row.title ?? '(unnamed)' });
    }
    return out;
  }

  /** Citation targets must be readable by whoever attaches them. */
  private async assertTargetReadable(
    principal: AuthenticatedPrincipal,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    if (targetType === 'INVESTIGATION') {
      // A report attached to an investigation is its own read gate; skip.
      return;
    }
    const table = TARGET_TABLES[targetType];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as Record<string, any>)[table];
    const row = await delegate.findFirst({
      where: { id: targetId, organizationId: principal.organizationId },
      select: { investigationId: true },
    });
    if (row?.investigationId) {
      await this.assertCapability(principal, row.investigationId);
    }
  }

  private async assertCapability(
    principal: AuthenticatedPrincipal,
    investigationId: string,
  ): Promise<void> {
    // Org admins pass; otherwise the caller must be an investigation member.
    // Mirrors InvestigationAccessService without a module import cycle.
    const admin = principal.role === 'OWNER' || principal.role === 'ADMIN';
    if (admin) return;
    const member = await this.prisma.investigationMember.findUnique({
      where: { investigationId_userId: { investigationId, userId: principal.userId } },
      select: { role: true },
    });
    if (!member) throw new ForbiddenException('Citation target not accessible');
  }
}