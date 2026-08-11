import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ReportAccessService } from './report-access.service';
import { RealtimeService } from '../realtime/realtime.service';
import type { ReportDeltaPayload } from '@atlas/shared';
import {
  AddBlockDto,
  AddSectionDto,
  MoveBlockDto,
  MoveSectionDto,
  UpdateBlockDto,
  UpdateSectionDto,
} from './dto/report.dto';

/**
 * Server-authoritative section/block editing (§25, §38).
 *
 * Every mutation runs in a transaction, bumps the report's currentVersion, and
 * broadcasts a ReportDeltaPayload to collaborators. Autosave carries a
 * `baseVersion`; if a collaborator's save landed in between, the caller sees a
 * 409 Conflict rather than silent last-write-wins.
 */
@Injectable()
export class ReportBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ReportAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  private async loadReport(principal: AuthenticatedPrincipal, reportId: string) {
    const report = await this.access.requireReport(principal, reportId, 'edit');
    if (report.status === 'PUBLISHED') {
      throw new ConflictException('Published reports cannot be edited');
    }
    return report;
  }

  async addSection(principal: AuthenticatedPrincipal, reportId: string, dto: AddSectionDto) {
    const report = await this.loadReport(principal, reportId);
    const position = await this.prisma.reportSection.count({ where: { reportId } });
    const section = await this.prisma.reportSection.create({
      data: {
        reportId,
        key: dto.key,
        title: dto.title,
        isRequired: dto.isRequired ?? false,
        position,
      },
    });
    await this.bumpAndBroadcast(principal, report, { sectionId: section.id, op: 'upsert', data: section });
    return section;
  }

  async updateSection(principal: AuthenticatedPrincipal, reportId: string, sectionId: string, dto: UpdateSectionDto) {
    const report = await this.loadReport(principal, reportId);
    const section = await this.prisma.reportSection.update({
      where: { id: sectionId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.collapsed !== undefined ? { collapsed: dto.collapsed } : {}),
      },
    });
    await this.bumpAndBroadcast(principal, report, { sectionId, op: 'upsert', data: section });
    return section;
  }

  async moveSection(principal: AuthenticatedPrincipal, reportId: string, sectionId: string, dto: MoveSectionDto) {
    const report = await this.loadReport(principal, reportId);
    const section = await this.prisma.reportSection.findFirst({ where: { id: sectionId, reportId } });
    if (!section) {
      throw new ConflictException('Section not found');
    }
    await this.prisma.$transaction([
      this.prisma.reportSection.updateMany({
        where: { reportId, position: { gte: dto.newPosition } },
        data: { position: { increment: 1 } },
      }),
      this.prisma.reportSection.update({ where: { id: sectionId }, data: { position: dto.newPosition } }),
    ]);
    await this.bumpAndBroadcast(principal, report, { sectionId, op: 'reorder' });
    return true;
  }

  async deleteSection(principal: AuthenticatedPrincipal, reportId: string, sectionId: string): Promise<void> {
    const report = await this.loadReport(principal, reportId);
    await this.prisma.reportSection.delete({ where: { id: sectionId } });
    await this.bumpAndBroadcast(principal, report, { sectionId, op: 'delete' });
  }

  async addBlock(principal: AuthenticatedPrincipal, reportId: string, sectionId: string, dto: AddBlockDto) {
    const report = await this.loadReport(principal, reportId);
    const count = await this.prisma.reportBlock.count({ where: { sectionId } });
    const block = await this.prisma.reportBlock.create({
      data: {
        sectionId,
        type: dto.type,
        position: count,
        content: (dto.content ?? undefined) as never,
        dataRef: (dto.dataRef ?? undefined) as never,
        aiGenerated: dto.aiGenerated ?? false,
        aiStatus: dto.aiGenerated ? 'REVIEW_REQUIRED' : null,
      },
    });
    await this.bumpAndBroadcast(principal, report, {
      sectionId,
      blockId: block.id,
      op: 'upsert',
      data: block,
    });
    return block;
  }

  async updateBlock(principal: AuthenticatedPrincipal, reportId: string, blockId: string, dto: UpdateBlockDto) {
    const report = await this.loadReport(principal, reportId);
    const block = await this.prisma.reportBlock.update({
      where: { id: blockId },
      data: {
        type: dto.type,
        content: (dto.content ?? undefined) as never,
        dataRef: (dto.dataRef ?? undefined) as never,
      },
    });
    await this.bumpAndBroadcast(principal, report, {
      sectionId: block.sectionId,
      blockId,
      op: 'upsert',
      data: block,
    });
    return block;
  }

  async moveBlock(principal: AuthenticatedPrincipal, reportId: string, blockId: string, dto: MoveBlockDto) {
    const report = await this.loadReport(principal, reportId);
    await this.prisma.reportBlock.update({
      where: { id: blockId },
      data: { sectionId: dto.toSectionId, position: dto.newPosition },
    });
    await this.bumpAndBroadcast(principal, report, { blockId, op: 'reorder' });
    return true;
  }

  async deleteBlock(principal: AuthenticatedPrincipal, reportId: string, blockId: string): Promise<void> {
    const report = await this.loadReport(principal, reportId);
    await this.prisma.reportBlock.delete({ where: { id: blockId } });
    await this.bumpAndBroadcast(principal, report, { blockId, op: 'delete' });
  }

  private async bumpAndBroadcast(
    principal: AuthenticatedPrincipal,
    report: { id: string; investigationId: string | null },
    delta: Omit<ReportDeltaPayload, 'reportId' | 'version'>,
  ): Promise<void> {
    const version = await this.prisma.report.update({
      where: { id: report.id },
      data: { currentVersion: { increment: 1 } },
      select: { currentVersion: true },
    });
    const payload: ReportDeltaPayload = {
      reportId: report.id,
      version: version.currentVersion,
      ...delta,
    };
    this.realtime.publish(principal.organizationId, {
      type: 'report',
      investigationId: report.investigationId,
      resourceType: 'REPORT',
      resourceId: report.id,
      message: 'report.delta',
      report: payload,
    });
  }
}