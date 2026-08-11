import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { ReportService } from './report.service';
import { ReportBuilderService } from './report-builder.service';
import { ReportVersionService } from './report-version.service';
import { ReportCitationService } from './report-citation.service';
import { ReportQualityService } from './report-quality.service';
import { ReportReviewService } from './report-review.service';
import { ReportPublishService } from './report-publish.service';
import { ReportTemplateService } from './report-template.service';
import { ReportExportService } from './report-export.service';
import { AiReportService } from './ai-report.service';
import {
  AddBlockDto,
  AddSectionDto,
  ApproveReportDto,
  CreateFromTemplateDto,
  CreateReportDto,
  CreateReportVersionDto,
  ExportQueryDto,
  ListReportsQueryDto,
  MoveBlockDto,
  MoveSectionDto,
  ReviewReportDto,
  UpdateBlockDto,
  UpdateReportDto,
  UpdateSectionDto,
} from './dto/report.dto';

@Controller('reports')
@RequirePermission('report.read')
export class ReportController {
  constructor(
    private readonly reports: ReportService,
    private readonly builder: ReportBuilderService,
    private readonly versionService: ReportVersionService,
    private readonly citationService: ReportCitationService,
    private readonly qualityService: ReportQualityService,
    private readonly reviewService: ReportReviewService,
    private readonly publishService: ReportPublishService,
    private readonly templateService: ReportTemplateService,
    private readonly exportService: ReportExportService,
    private readonly ai: AiReportService,
  ) {}

  // -- Templates (registered before :id so /reports/templates is not a UUID) --

  @Get('templates')
  templates(@Req() request: AuthenticatedRequest) {
    return this.templateService.list(request.principal.organizationId);
  }

  @Post('from-template')
  @RequirePermission('report.create')
  async createFromTemplate(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateFromTemplateDto,
  ) {
    const report = await this.reports.create(request.principal, {
      title: dto.title,
      investigationId: dto.investigationId,
      workspaceId: dto.workspaceId,
      templateId: dto.templateId,
    });
    await this.templateService.hydrateReport(
      request.principal,
      report.id,
      dto.templateId ?? '',
    );
    return this.reports.get(request.principal, report.id);
  }

  // -- CRUD ---------------------------------------------------------------

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query() query: ListReportsQueryDto) {
    return this.reports.list(request.principal, query);
  }

  @Post()
  @RequirePermission('report.create')
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateReportDto) {
    return this.reports.create(request.principal, dto);
  }

  @Get(':id')
  get(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.reports.get(request.principal, id);
  }

  @Patch(':id')
  @RequirePermission('report.update')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reports.update(request.principal, id, dto);
  }

  @Delete(':id')
  @RequirePermission('report.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.reports.remove(request.principal, id);
  }

  // -- Sections -----------------------------------------------------------

  @Post(':id/sections')
  @RequirePermission('report.update')
  addSection(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddSectionDto,
  ) {
    return this.builder.addSection(request.principal, id, dto);
  }

  @Patch(':id/sections/:sectionId')
  @RequirePermission('report.update')
  updateSection(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.builder.updateSection(request.principal, id, sectionId, dto);
  }

  @Post(':id/sections/:sectionId/move')
  @RequirePermission('report.update')
  moveSection(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: MoveSectionDto,
  ) {
    return this.builder.moveSection(request.principal, id, sectionId, dto);
  }

  @Delete(':id/sections/:sectionId')
  @RequirePermission('report.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSection(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
  ): Promise<void> {
    await this.builder.deleteSection(request.principal, id, sectionId);
  }

  // -- Blocks -------------------------------------------------------------

  @Post(':id/sections/:sectionId/blocks')
  @RequirePermission('report.update')
  addBlock(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: AddBlockDto,
  ) {
    return this.builder.addBlock(request.principal, id, sectionId, dto);
  }

  @Patch(':id/blocks/:blockId')
  @RequirePermission('report.update')
  updateBlock(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('blockId', new ParseUUIDPipe()) blockId: string,
    @Body() dto: UpdateBlockDto,
  ) {
    return this.builder.updateBlock(request.principal, id, blockId, dto);
  }

  @Post(':id/blocks/:blockId/move')
  @RequirePermission('report.update')
  moveBlock(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('blockId', new ParseUUIDPipe()) blockId: string,
    @Body() dto: MoveBlockDto,
  ) {
    return this.builder.moveBlock(request.principal, id, blockId, dto);
  }

  @Delete(':id/blocks/:blockId')
  @RequirePermission('report.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlock(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('blockId', new ParseUUIDPipe()) blockId: string,
  ): Promise<void> {
    await this.builder.deleteBlock(request.principal, id, blockId);
  }

  // -- Versions -----------------------------------------------------------

  @Get(':id/versions')
  versions(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.versionService.list(id, request.principal.organizationId);
  }

  @Post(':id/versions')
  @RequirePermission('report.update')
  createVersion(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateReportVersionDto,
  ) {
    return this.versionService.createVersion(request.principal, id, dto.changeSummary);
  }

  @Get(':id/versions/:versionNumber')
  getVersion(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    return this.versionService.get(id, Number(versionNumber), request.principal.organizationId);
  }

  // -- Citations ----------------------------------------------------------

  @Get(':id/citations')
  citations(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.citationService.list(id, request.principal.organizationId);
  }

  @Post(':id/citations')
  @RequirePermission('report.update')
  addCitation(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { targetType: string; targetId: string; blockId?: string; snippet?: string; sourceRef?: string },
  ) {
    return this.citationService.create(request.principal, id, body);
  }

  @Delete(':id/citations/:citationId')
  @RequirePermission('report.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCitation(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('citationId', new ParseUUIDPipe()) citationId: string,
  ): Promise<void> {
    await this.citationService.remove(request.principal, citationId, request.principal.organizationId);
  }

  // -- Workflow -----------------------------------------------------------

  @Get(':id/quality')
  quality(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.qualityService.check(request.principal, id);
  }

  @Post(':id/submit')
  @RequirePermission('report.update')
  submit(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.reviewService.submitForReview(request.principal, id);
  }

  @Post(':id/review')
  @RequirePermission('report.review')
  review(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.reviewService.review(request.principal, id, dto.decision, dto.comment);
  }

  @Get(':id/reviews')
  reviews(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.reviewService.list(id);
  }

  @Post(':id/approve')
  @RequirePermission('report.approve')
  approve(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ApproveReportDto,
  ) {
    return this.reviewService.approve(request.principal, id, dto.comment);
  }

  @Get(':id/approvals')
  approvals(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.reviewService.listApprovals(id);
  }

  @Post(':id/publish')
  @RequirePermission('report.publish')
  publish(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.publishService.publish(request.principal, id);
  }

  @Post(':id/archive')
  @RequirePermission('report.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.publishService.archive(request.principal, id);
  }

  // -- Export -------------------------------------------------------------

  @Get(':id/export')
  @RequirePermission('report.export')
  @RateLimit({ limit: 5, windowMs: 60_000 })
  async export(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const result = await this.exportService.exportInline(
      request.principal,
      id,
      query.format,
    );
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${id.slice(0, 8)}.${result.extension}"`,
    );
    return new StreamableFile(result.buffer, { type: result.mimeType });
  }

  // -- AI -----------------------------------------------------------------

  @Post(':id/ai/generate')
  @RequirePermission('report.update')
  @RateLimit({ limit: 10, windowMs: 60_000 })
  aiGenerate(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { sectionKey?: string; prompt?: string },
  ) {
    return this.ai.generate(request.principal, id, body.sectionKey, body.prompt);
  }

  @Post(':id/ai/review')
  @RequirePermission('report.review')
  @RateLimit({ limit: 10, windowMs: 60_000 })
  aiReview(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.ai.reviewReport(request.principal, id);
  }
}
