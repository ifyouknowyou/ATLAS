import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { WorkflowsService } from './workflows.service';

@ApiTags('workflows')
@Controller('workflows')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get()
  @RequirePermission('workflow.read')
  list(@Query('organizationId') organizationId?: string) {
    return this.service.list(organizationId);
  }

  @Post()
  @RequirePermission('workflow.create')
  create(@Body() dto: { name: string; description?: string; kind: string; steps: unknown }) {
    return this.service.create(dto);
  }

  @Post(':id/trigger')
  @RequirePermission('workflow.execute')
  trigger(@Param('id') id: string, @Body('context') context: unknown) {
    return this.service.trigger(id, context);
  }

  @Get(':id/runs')
  @RequirePermission('workflow.read')
  runs(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.service.getRuns(id, limit);
  }

  @Post('runs/:runId/approve/:stepIndex')
  @RequirePermission('workflow.approve')
  approve(@Param('runId') runId: string, @Param('stepIndex') stepIndex: number, @Body('comment') comment?: string) {
    return this.service.approveStep(runId, stepIndex, comment);
  }

  @Post('runs/:runId/reject/:stepIndex')
  @RequirePermission('workflow.approve')
  reject(@Param('runId') runId: string, @Param('stepIndex') stepIndex: number, @Body('comment') comment?: string) {
    return this.service.rejectStep(runId, stepIndex, comment);
  }
}