import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ConnectorsService } from './connectors.service';

@ApiTags('connectors')
@Controller('connectors')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class ConnectorsController {
  constructor(private readonly service: ConnectorsService) {}

  @Get('data-sources')
  @RequirePermission('connector.read')
  sources(@Query('organizationId') organizationId?: string) {
    return this.service.sources(organizationId);
  }

  @Post('data-sources')
  @RequirePermission('connector.create')
  createSource(@Body() dto: { name: string; connectorType: string; config: Record<string, unknown>; scheduleCron?: string }) {
    return this.service.createSource(dto);
  }

  @Post('data-sources/:id/syncs')
  @RequirePermission('connector.sync')
  startSync(@Param('id') id: string) {
    return this.service.startSync(id);
  }
}