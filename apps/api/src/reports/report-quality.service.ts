import { Injectable } from '@nestjs/common';
import type { ReportQualityResult } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';

/**
 * Server-enforced report validation (§48). The UI never decides validity — a
 * report passes only when these checks pass server-side.
 */
@Injectable()
export class ReportQualityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
  ) {}

  async check(
    principal: AuthenticatedPrincipal,
    reportId: string,
  ): Promise<ReportQualityResult> {
    await this.access.requireReport(principal, reportId, 'read');
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        sections: { include: { blocks: true } },
        citations: true,
        reviews: { where: { status: 'OPEN' } },
      },
    });
    if (!report) return { valid: false, issues: [{ code: 'NOT_FOUND', message: 'Report does not exist', severity: 'error' }] };

    const issues: ReportQualityResult['issues'] = [];

    // Required sections (from templates) must have content; otherwise the
    // report must contain at least one section with content.
    const required = report.sections.filter((s) => s.isRequired);
    if (required.length > 0) {
      for (const s of required) {
        if (s.blocks.length === 0) {
          issues.push({
            code: 'MISSING_CONTENT',
            message: `Required section "${s.title}" is empty`,
            severity: 'error',
            sectionKey: s.key,
          });
        }
      }
    } else if (!report.sections.some((s) => s.blocks.length > 0)) {
      issues.push({
        code: 'MISSING_CONTENT',
        message: 'Report has no content',
        severity: 'error',
      });
    }

    // Citations valid — no dangling references.
    for (const c of report.citations) {
      const ok = await this.targetExists(c.targetType, c.targetId, principal.organizationId);
      if (!ok) {
        issues.push({
          code: 'BROKEN_CITATION',
          message: `Citation to ${c.targetType} is invalid or inaccessible`,
          severity: 'error',
          blockId: c.blockId ?? undefined,
        });
      }
    }

    // No unresolved review comments.
    if (report.reviews.length > 0) {
      issues.push({
        code: 'UNRESOLVED_REVIEW',
        message: `${report.reviews.length} open review item(s)`,
        severity: 'error',
      });
    }

    // Classification set (always true — defaulted), but validate explicitly.
    if (!report.classification) {
      issues.push({ code: 'MISSING_CLASSIFICATION', message: 'No classification set', severity: 'error' });
    }

    // No unverified AI content in a publishable draft.
    const aiGenerated = report.sections.flatMap((s) => s.blocks).filter((b) => b.aiGenerated);
    if (aiGenerated.some((b) => b.aiStatus === 'REVIEW_REQUIRED')) {
      issues.push({
        code: 'UNVERIFIED_AI',
        message: 'Reports contain AI-generated content that is still under review',
        severity: 'error',
      });
    }

    return { valid: issues.length === 0, issues };
  }

  private async targetExists(
    targetType: string,
    targetId: string,
    organizationId: string,
  ): Promise<boolean> {
    const table =
      targetType === 'ENTITY'
        ? 'entity'
        : targetType === 'RELATIONSHIP'
          ? 'relationship'
          : targetType === 'TIMELINE_EVENT'
            ? 'timelineEvent'
            : targetType === 'NOTE'
              ? 'note'
              : targetType === 'EVIDENCE'
                ? 'evidence'
                : targetType === 'INVESTIGATION'
                  ? 'investigation'
                  : targetType === 'REPORT'
                    ? 'report'
                    : null;
    if (!table) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as Record<string, any>)[table];
    const row = await delegate.findFirst({
      where: { id: targetId, organizationId },
      select: { id: true },
    });
    return Boolean(row);
  }
}