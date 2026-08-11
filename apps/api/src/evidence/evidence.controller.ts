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
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto, ListEvidenceQueryDto } from './dto/evidence.dto';
import { EvidenceVersionService } from './evidence-version.service';
import { EvidenceAccessEventService } from './evidence-access-event.service';
import { EvidenceAnnotationService } from './evidence-annotation.service';
import { EvidenceLinkingService } from './evidence-linking.service';
import { EvidenceAccessService } from './evidence-access.service';
import { EvidenceSearchService } from './evidence-search.service';
import { SearchEvidenceQueryDto, CreateAnnotationDto, CreateEvidenceLinkDto, UpdateEvidenceExtendedDto } from './dto/evidence-upload.dto';

@Controller('evidence')
export class EvidenceController {
  constructor(
    private readonly evidence: EvidenceService,
    private readonly versionService: EvidenceVersionService,
    private readonly eventService: EvidenceAccessEventService,
    private readonly annotationService: EvidenceAnnotationService,
    private readonly linkService: EvidenceLinkingService,
    private readonly accessService: EvidenceAccessService,
    private readonly searchService: EvidenceSearchService,
  ) {}

  @Get()
  @RequirePermission('evidence.read')
  list(@Req() request: AuthenticatedRequest, @Query() query: ListEvidenceQueryDto) {
    return this.evidence.list(request.principal, query);
  }

  @Get('search')
  @RequirePermission('evidence.read')
  searchEvidence(@Req() request: AuthenticatedRequest, @Query() query: SearchEvidenceQueryDto) {
    return this.searchService.search(request.principal, query);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateEvidenceDto) {
    return this.evidence.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('evidence.read')
  async get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const evidence = await this.evidence.get(request.principal, id);
    return evidence;
  }

  @Patch(':id')
  @RequirePermission('evidence.update')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEvidenceExtendedDto,
  ) {
    return this.evidence.updateExtended(request.principal, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.evidence.remove(request.principal, id);
  }

  @Post(':id/archive')
  @RequirePermission('evidence.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.evidence.setArchived(request.principal, id, true);
  }

  @Post(':id/restore')
  @RequirePermission('evidence.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async restore(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.evidence.setArchived(request.principal, id, false);
  }

  // -- Versions ----------------------------------------------------------

  @Get(':id/versions')
  @RequirePermission('evidence.read')
  versions(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.versionService.list(id, request.principal.organizationId);
  }

  @Post(':id/versions/:versionNumber/restore')
  @RequirePermission('evidence.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async restoreVersion(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('versionNumber', new ParseUUIDPipe()) versionNumber: number,
  ): Promise<void> {
    await this.versionService.restore(request.principal, id, Number(versionNumber), request.principal.organizationId);
  }

  // -- Chain of custody --------------------------------------------------

  @Get(':id/access-history')
  @RequirePermission('evidence.read')
  accessHistory(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.evidence.accessHistory(request.principal, id);
  }

  // -- Annotations -------------------------------------------------------

  @Get(':id/annotations')
  @RequirePermission('evidence.read')
  annotations(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.annotationService.list(id, request.principal.organizationId);
  }

  @Post(':id/annotations')
  @RequirePermission('evidence.annotate')
  addAnnotation(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateAnnotationDto,
  ) {
    return this.annotationService.create(request.principal, {
      evidenceId: id,
      versionId: dto.versionId ?? null,
      type: dto.type,
      target: dto.target ? dto.target : undefined,
      content: dto.content ?? null,
      tags: dto.tags ?? [],
    });
  }

  @Patch('annotations/:annotationId')
  @RequirePermission('evidence.annotate')
  updateAnnotation(
    @Req() request: AuthenticatedRequest,
    @Param('annotationId', new ParseUUIDPipe()) annotationId: string,
    @Body() dto: { content?: string | null; target?: unknown; tags?: string[] },
  ) {
    return this.annotationService.update(request.principal, annotationId, dto);
  }

  @Post('annotations/:annotationId/resolve')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('evidence.annotate')
  resolveAnnotation(
    @Req() request: AuthenticatedRequest,
    @Param('annotationId', new ParseUUIDPipe()) annotationId: string,
    @Body() body: { resolved: boolean },
  ) {
    return this.annotationService.resolve(request.principal, annotationId, body.resolved ?? true);
  }

  @Delete('annotations/:annotationId')
  @RequirePermission('evidence.annotate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAnnotation(
    @Req() request: AuthenticatedRequest,
    @Param('annotationId', new ParseUUIDPipe()) annotationId: string,
  ): Promise<void> {
    await this.annotationService.remove(request.principal, annotationId);
  }

  // -- Links -------------------------------------------------------------

  @Get(':id/links')
  @RequirePermission('evidence.read')
  links(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.linkService.list(id, request.principal.organizationId);
  }

  @Post(':id/links')
  @RequirePermission('evidence.update')
  addLink(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateEvidenceLinkDto,
  ) {
    return this.linkService.create(request.principal, id, dto.targetType, dto.targetId, dto.linkType);
  }

  @Delete(':id/links/:targetType/:targetId')
  @RequirePermission('evidence.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLink(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ): Promise<void> {
    await this.linkService.remove(request.principal, id, targetType as never, targetId);
  }
}
