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
import { RelationshipsService } from './relationships.service';
import {
  CreateRelationshipDto,
  ListRelationshipsQueryDto,
  UpdateRelationshipDto,
} from './dto/relationship.dto';

@Controller('relationships')
export class RelationshipsController {
  constructor(private readonly relationships: RelationshipsService) {}

  @Get()
  @RequirePermission('entity.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListRelationshipsQueryDto,
  ) {
    return this.relationships.list(request.principal, query);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateRelationshipDto,
  ) {
    return this.relationships.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('entity.read')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.relationships.get(request.principal, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRelationshipDto,
  ) {
    return this.relationships.update(request.principal, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.relationships.remove(request.principal, id);
  }
}