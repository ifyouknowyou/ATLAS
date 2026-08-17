import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  @RequirePermission('alert.read')
  list(@Query('severity') severity?: string, @Query('status') status?: string) {
    return this.service.list({ severity, status });
  }

  @Post(':id/acknowledge')
  @RequirePermission('alert.update')
  acknowledge(@Param('id') id: string) {
    return this.service.acknowledge(id);
  }

  @Post(':id/dismiss')
  @RequirePermission('alert.update')
  dismiss(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.dismiss(id, reason);
  }
}