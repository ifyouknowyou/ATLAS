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
import { PageQueryDto } from '../common/pagination.dto';
import { InvestigationsService } from './investigations.service';
import {
  CreateInvestigationDto,
  ListInvestigationsQueryDto,
  UpdateInvestigationDto,
} from './dto/investigation.dto';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/member.dto';

@Controller('investigations')
export class InvestigationsController {
  constructor(private readonly investigations: InvestigationsService) {}

  @Get()
  @RequirePermission('investigation.read')
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListInvestigationsQueryDto,
  ) {
    return this.investigations.list(request.principal, query);
  }

  @Post()
  @RequirePermission('investigation.create')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateInvestigationDto,
  ) {
    return this.investigations.create(request.principal, dto);
  }

  @Get(':id')
  @RequirePermission('investigation.read')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.investigations.get(request.principal, id);
  }

  @Get(':id/dashboard')
  @RequirePermission('investigation.read')
  dashboard(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.investigations.dashboard(request.principal, id);
  }

  @Patch(':id')
  @RequirePermission('investigation.update')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvestigationDto,
  ) {
    return this.investigations.update(request.principal, id, dto);
  }

  @Post(':id/archive')
  @RequirePermission('investigation.update')
  archive(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.investigations.archive(request.principal, id);
  }

  @Post(':id/restore')
  @RequirePermission('investigation.update')
  restore(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.investigations.restore(request.principal, id);
  }

  @Delete(':id')
  @RequirePermission('investigation.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.investigations.remove(request.principal, id);
  }

  @Get(':id/members')
  @RequirePermission('investigation.read')
  listMembers(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.investigations.listMembers(request.principal, id);
  }

  @Post(':id/members')
  @RequirePermission('investigation.update')
  addMember(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.investigations.addMember(request.principal, id, dto);
  }

  @Patch(':id/members/:userId/role')
  @RequirePermission('investigation.update')
  updateMemberRole(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.investigations.updateMemberRole(request.principal, id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @RequirePermission('investigation.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<void> {
    await this.investigations.removeMember(request.principal, id, userId);
  }

  @Get(':id/activity')
  @RequirePermission('investigation.read')
  activity(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: PageQueryDto,
  ) {
    return this.investigations.listActivity(request.principal, id, query);
  }
}