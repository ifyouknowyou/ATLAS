import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPage } from '../common/pagination.dto';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { ReportAccessService } from './report-access.service';
import { CreateReportDto, ListReportsQueryDto, UpdateReportDto } from './dto/report.dto';

const REPORT_SELECT = {
  id: true,
  title: true,
  description: true,
  summary: true,
  status: true,
  classification: true,
  aiGenerated: true,
  aiStatus: true,
  currentVersion: true,
  templateKind: true,
  investigationId: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, displayName: true } },
  _count: { select: { sections: true, versions: true, citations: true } },
} as const;

/** Report CRUD (Phase 5 §21–§22). */
@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListReportsQueryDto) {
    const where = this.access.listReportsWhere(principal) as Record<string, unknown>;
    if (query.status) where.status = query.status;
    if (query.investigationId) where.investigationId = query.investigationId;
    if (query.q) where.title = { contains: query.q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        select: REPORT_SELECT,
      }),
      this.prisma.report.count({ where }),
    ]);
    return toPage(items, total, query);
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateReportDto) {
    if (dto.investigationId) {
      await this.access.requireReportForCreate(principal, dto.investigationId, 'contribute');
    } else {
      // Org-level report creation uses the org permission + workspace optionality.
      await this.access.requireOrgCreate(principal);
    }

    const report = await this.prisma.report.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        classification: dto.classification ?? 'INTERNAL',
        investigationId: dto.investigationId ?? null,
        workspaceId: dto.workspaceId ?? null,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
      select: REPORT_SELECT,
    });

    await this.activity.record(principal, {
      type: 'REPORT_CREATED',
      message: `Report "${report.title}" created`,
      investigationId: report.investigationId,
      metadata: { reportId: report.id },
    });
    return report;
  }

  async get(principal: AuthenticatedPrincipal, reportId: string) {
    await this.access.requireReport(principal, reportId, 'read');
    return this.prisma.report.findUnique({
      where: { id: reportId },
      select: {
        ...REPORT_SELECT,
        sections: {
          orderBy: { position: 'asc' },
          include: {
            blocks: { orderBy: { position: 'asc' } },
          },
        },
        citations: { orderBy: { order: 'asc' } },
      },
    });
  }

  async update(principal: AuthenticatedPrincipal, reportId: string, dto: UpdateReportDto) {
    await this.access.requireReport(principal, reportId, 'edit');
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        // Classification changes require the classify-style manage permission via the
        // edit path (updates to classification are audited by the builder path).
        ...(dto.classification ? { classification: dto.classification } : {}),
      },
      select: REPORT_SELECT,
    });
    await this.activity.record(principal, {
      type: 'REPORT_UPDATED',
      message: `Report "${updated.title}" updated`,
      investigationId: updated.investigationId,
      metadata: { reportId: updated.id },
    });
    return updated;
  }

  async remove(principal: AuthenticatedPrincipal, reportId: string): Promise<void> {
    const report = await this.access.requireReport(principal, reportId, 'manage');
    await this.prisma.report.delete({ where: { id: reportId } });
    await this.activity.record(principal, {
      type: 'REPORT_UPDATED',
      message: `Report "${report.title}" removed`,
      investigationId: report.investigationId,
    });
  }
}