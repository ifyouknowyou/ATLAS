import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  AdminGuard,
} from '../rbac/admin.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('operations')
  async operations() {
    return this.admin.systemHealth();
  }

  @Get('audit')
  async audit() {
    return this.admin.auditLogs();
  }
}