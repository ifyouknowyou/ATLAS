import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { EvidenceProcessingService, EvidenceProcessingKind } from './evidence-processing.service';

class ProcessEvidenceDto {
  @IsEnum(['TEXT_EXTRACTION', 'METADATA_EXTRACTION', 'OCR', 'DOCUMENT_PARSING', 'EMBEDDING'])
  kind!: EvidenceProcessingKind;
}

/**
 * Evidence processing endpoints (§19–20). All asynchronous — the background
 * queue does the work; these routes only enqueue and report status.
 */
@Controller('evidence')
export class EvidenceProcessingController {
  constructor(private readonly processing: EvidenceProcessingService) {}

  @Post(':id/process')
  @RequirePermission('evidence.process')
  @RateLimit({ limit: 10, windowMs: 60_000 })
  process(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ProcessEvidenceDto,
  ) {
    return this.processing.enqueue(request.principal, id, dto.kind);
  }

  @Get(':id/processing')
  @RequirePermission('evidence.read')
  status(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.processing.status(id, request.principal.organizationId);
  }

  @Post(':id/process/:kind/retry')
  @RequirePermission('evidence.process')
  retry(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('kind') kind: EvidenceProcessingKind,
  ) {
    return this.processing.retry(request.principal, id, kind);
  }

  @Post(':id/process/:kind/cancel')
  @RequirePermission('evidence.process')
  cancel(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('kind') kind: EvidenceProcessingKind,
  ) {
    return this.processing.cancel(request.principal, id, kind);
  }
}