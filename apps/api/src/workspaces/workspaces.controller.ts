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
  Req,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { AuthenticatedRequest } from '../auth/principal';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.workspaces.list(request.principal.organizationId);
  }

  @Post()
  @RequirePermission('workspace.manage')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaces.create(
      request.principal.organizationId,
      request.principal.userId,
      dto,
    );
  }

  @Patch(':id')
  @RequirePermission('workspace.manage')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaces.update(request.principal.organizationId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('workspace.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.workspaces.remove(request.principal.organizationId, id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.workspaces.activate(
      request.principal.organizationId,
      request.principal.userId,
      id,
    );
  }
}