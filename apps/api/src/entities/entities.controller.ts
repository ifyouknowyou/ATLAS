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
import { EntitiesService } from './entities.service';
import {
  CreateEntityDto,
  ListEntitiesQueryDto,
  UpdateEntityDto,
} from './dto/entity.dto';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get()
  @RequirePermission('entity.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListEntitiesQueryDto,
  ) {
    return this.entities.list(request.principal, query);
  }

  /**
   * Mutations are authorized inside the service: investigation-scoped records
   * are gated by investigation capability, org-level records by org permission
   * (assertOrgPermission). No frontend-hidden-button shortcuts.
   */
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateEntityDto) {
    return this.entities.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('entity.read')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.entities.get(request.principal, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEntityDto,
  ) {
    return this.entities.update(request.principal, id, dto);
  }

  @Post(':id/archive')
  archive(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.entities.archive(request.principal, id);
  }

  @Post(':id/restore')
  restore(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.entities.restore(request.principal, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.entities.remove(request.principal, id);
  }
}