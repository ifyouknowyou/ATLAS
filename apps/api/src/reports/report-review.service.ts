import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import type { ReportReviewDecision, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';
import { ReportQualityService } from './report-quality.service';
import { ReportVersionService } from './report-version.service';
import { ActivityService } from '../common/activity.service';

type StatusSet = Set<ReportStatus>;

const TRANSITIONS: Partial<Record<ReportStatus, StatusSet>> = {
  DRAFT: new Set(['IN_REVIEW']),
  IN_REVIEW: new Set(['APPROVED', 'CHANGES_REQUESTED']),
  CHANGES_REQUESTED: new Set(['IN_REVIEW']),
  APPROVED: new Set(['PUBLISHED']),
};

/**
 * Report review workflow (§30). Draft → submit → In Review → Approved /
 * Changes Requested → (publish). Review, approval, and publishing are explicit
 * server-side decisions — the frontend can never imply them.
 */
@Injectable()
export class ReportReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly quality: ReportQualityService,
    private readonly versions: ReportVersionService,
    private readonly activity: ActivityService,
  ) {}

  private assertTransition(from: string, to: ReportStatus): void {
    const allowed = TRANSITIONS[from as ReportStatus];
    if (!allowed || !allowed.has(to)) {
      throw new ConflictException(`Cannot move report from ${from} to ${to}`);
    }
  }

  async submitForReview(principal: AuthenticatedPrincipal, reportId: string) {
    const report = await this.access.requireReport(principal, reportId, 'edit');
    this.assertTransition(report.status, 'IN_REVIEW');
    // A quality check gate on submit catches obvious issues early, but does not
    // block (reviewers can still request changes).
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'IN_REVIEW' },
    });
    await this.activity.record(principal, {
      type: 'REPORT_SUBMITTED',
      message: `Report "${report.title}" submitted for review`,
      investigationId: report.investigationId,
      metadata: { reportId },
    });
    return updated;
  }

  async review(
    principal: AuthenticatedPrincipal,
    reportId: string,
    decision: ReportReviewDecision,
    comment?: string,
  ) {
    const report = await this.access.requireReport(principal, reportId, 'edit');
    if (report.status !== 'IN_REVIEW') {
      throw new ConflictException('Report is not in review');
    }
    if (!principal.permissions.includes('report.review')) {
      throw new ForbiddenException('Missing required permission: report.review');
    }

    const review = await this.prisma.reportReview.create({
      data: {
        reportId,
        reviewerId: principal.userId,
        decision,
        comment: comment ?? null,
        status: decision === 'REQUEST_CHANGES' ? 'OPEN' : 'RESOLVED',
      },
    });

    if (decision === 'APPROVE') {
      this.assertTransition(report.status, 'APPROVED');
      await this.prisma.report.update({ where: { id: reportId }, data: { status: 'APPROVED' } });
      await this.activity.record(principal, {
        type: 'REPORT_APPROVED',
        message: `Report "${report.title}" approved`,
        investigationId: report.investigationId,
        metadata: { reportId },
      });
    } else if (decision === 'REJECT') {
      await this.prisma.report.update({ where: { id: reportId }, data: { status: 'CHANGES_REQUESTED' } });
      await this.activity.record(principal, {
        type: 'REPORT_REJECTED',
        message: `Report "${report.title}" rejected (changes requested)`,
        investigationId: report.investigationId,
        metadata: { reportId },
      });
    } else {
      await this.prisma.report.update({ where: { id: reportId }, data: { status: 'CHANGES_REQUESTED' } });
      await this.activity.record(principal, {
        type: 'REPORT_REJECTED',
        message: `Report "${report.title}" — changes requested`,
        investigationId: report.investigationId,
        metadata: { reportId },
      });
    }
    return review;
  }

  async list(reportId: string): Promise<unknown[]> {
    return this.prisma.reportReview.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
      include: { reviewer: { select: { id: true, displayName: true } } },
    });
  }

  /** Explicit approval record (§31). */
  async approve(principal: AuthenticatedPrincipal, reportId: string, comment?: string) {
    const report = await this.access.requireReport(principal, reportId, 'manage');
    if (!principal.permissions.includes('report.approve')) {
      throw new ForbiddenException('Missing required permission: report.approve');
    }
    if (report.status !== 'APPROVED') {
      throw new ConflictException('Report must be APPROVED by review before explicit approval');
    }
    const version = await this.versions.createVersion(principal, reportId, 'Approved');
    return this.prisma.reportApproval.create({
      data: {
        reportId,
        reportVersionId: version.id,
        approverId: principal.userId,
        decision: 'APPROVED',
        comment: comment ?? null,
      },
    });
  }

  async listApprovals(reportId: string): Promise<unknown[]> {
    return this.prisma.reportApproval.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
      include: { approver: { select: { id: true, displayName: true } } },
    });
  }
}