import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import {
  AdminGuard,
  RequireSystemAdmin,
} from '../rbac/admin.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard, AdminGuard)
@ApiSecurity('bearer')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('operations')
  @RequireSystemAdmin
  @ApiOperation({ summary: 'Admin operations dashboard' })
  async operations() {
    return this.admin.systemHealth();
  }

  @Get('audit')
  @RequireSystemAdmin
  @ApiOperation({ summary: 'Admin audit log viewer' })
  async audit() {
    return this.admin.auditLogs();
  }
}