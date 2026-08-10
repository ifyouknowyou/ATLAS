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
import {
  CreateEvidenceDto,
  ListEvidenceQueryDto,
  UpdateEvidenceDto,
} from './dto/evidence.dto';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}

  @Get()
  @RequirePermission('evidence.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListEvidenceQueryDto,
  ) {
    return this.evidence.list(request.principal, query);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateEvidenceDto) {
    return this.evidence.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('evidence.read')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.evidence.get(request.principal, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEvidenceDto,
  ) {
    return this.evidence.update(request.principal, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.evidence.remove(request.principal, id);
  }
}