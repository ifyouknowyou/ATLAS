import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';

/**
 * Report versioning (§22, §31). A version is a full immutable snapshot of the
 * report's sections+blocks JSON. Versions are created on submit/approve/
 * publish and on explicit "save version". Published reports can only change by
 * creating a new version — never by silent in-place mutation.
 */
@Injectable()
export class ReportVersionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
  ) {}

  async createVersion(
    principal: AuthenticatedPrincipal,
    reportId: string,
    changeSummary?: string,
  ): Promise<{ id: string; versionNumber: number }> {
    await this.access.requireReport(principal, reportId, 'edit');
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        sections: { orderBy: { position: 'asc' }, include: { blocks: { orderBy: { position: 'asc' } } } },
      },
    });
    if (!report) throw new Error('Report not found');

    const snapshot = report.sections.map((s) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      position: s.position,
      isRequired: s.isRequired,
      aiGenerated: s.aiGenerated,
      blocks: s.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        position: b.position,
        content: b.content,
        dataRef: b.dataRef,
        aiGenerated: b.aiGenerated,
        aiStatus: b.aiStatus,
      })),
    }));

    const latest = await this.prisma.reportVersion.findFirst({
      where: { reportId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (latest?.versionNumber ?? 0) + 1;
    return this.prisma.reportVersion.create({
      data: {
        reportId,
        versionNumber,
        title: report.title,
        summary: report.summary,
        sections: snapshot as never,
        changeSummary: changeSummary ?? null,
        organizationId: report.organizationId,
        createdById: principal.userId,
      },
    });
  }

  async list(reportId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.reportVersion.findMany({
      where: { reportId, organizationId },
      orderBy: { versionNumber: 'desc' },
      include: { createdBy: { select: { id: true, displayName: true } } },
    });
  }

  async get(reportId: string, versionNumber: number, organizationId: string): Promise<unknown> {
    return this.prisma.reportVersion.findFirst({
      where: { reportId, versionNumber, organizationId },
    });
  }
}
