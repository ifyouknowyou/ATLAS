import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';
import { ReportQualityService } from './report-quality.service';
import { ReportVersionService } from './report-version.service';
import { ActivityService } from '../common/activity.service';

/**
 * Publishing gate (§48, §49). Publishing is server-enforced: the report must
 * be APPROVED, pass the quality check, and the caller must hold report.publish.
 * AI-generated content that is still REVIEW_REQUIRED blocks publishing.
 */
@Injectable()
export class ReportPublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly quality: ReportQualityService,
    private readonly versions: ReportVersionService,
    private readonly activity: ActivityService,
  ) {}

  async publish(principal: AuthenticatedPrincipal, reportId: string) {
    const report = await this.access.requireReport(principal, reportId, 'manage');
    if (!principal.permissions.includes('report.publish')) {
      throw new ForbiddenException('Missing required permission: report.publish');
    }
    if (report.status !== 'APPROVED') {
      throw new ConflictException('Report must be APPROVED before publishing');
    }

    const quality = await this.quality.check(principal, reportId);
    if (!quality.valid) {
      throw new ConflictException(
        `Report quality check failed: ${quality.issues.map((i) => i.message).join('; ')}`,
      );
    }

    // Never silently publish AI content that is still under review.
    const hasUnverifiedAi = await this.hasUnverifiedAi(reportId);
    if (hasUnverifiedAi) {
      throw new ConflictException(
        'Report contains AI-generated content that has not been verified',
      );
    }

    await this.versions.createVersion(principal, reportId, 'Publish');
    const published = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    await this.activity.record(principal, {
      type: 'REPORT_PUBLISHED',
      message: `Report "${report.title}" published`,
      investigationId: report.investigationId,
      metadata: { reportId },
    });
    return published;
  }

  async archive(principal: AuthenticatedPrincipal, reportId: string) {
    const report = await this.access.requireReport(principal, reportId, 'manage');
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'ARCHIVED' },
    });
    await this.activity.record(principal, {
      type: 'REPORT_UPDATED',
      message: `Report "${report.title}" archived`,
      investigationId: report.investigationId,
      metadata: { reportId },
    });
    return updated;
  }

  private async hasUnverifiedAi(reportId: string): Promise<boolean> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { sections: { include: { blocks: true } } },
    });
    if (!report || !report.aiGenerated) return false;
    const blocks = report.sections.flatMap((s) => s.blocks);
    return blocks.some(
      (b) => b.aiGenerated && (b.aiStatus === 'REVIEW_REQUIRED' || b.aiStatus == null),
    );
  }
}