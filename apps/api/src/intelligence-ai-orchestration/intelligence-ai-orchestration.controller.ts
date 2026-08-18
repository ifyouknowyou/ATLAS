import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { IntelligenceAIOrchestrationService } from './intelligence-ai-orchestration.service';
import { InputJsonValue } from '@prisma/client/runtime/library';

export type OrchestrationTaskType =
  | 'THREAT_ANALYSIS'
  | 'NETWORK_INVESTIGATION'
  | 'ENTITY_PROFILING'
  | 'ANOMALY_HUNTING'
  | 'PREDICTIVE_ANALYTICS'
  | 'INCIDENT_RESPONSE'
  | 'COMPLIANCE_CHECK';

export interface OrchestrationContext {
  investigationId?: string;
  entityIds?: string[];
  timeRange?: { start: Date; end: Date };
  parameters?: InputJsonValue;
}

@ApiTags('intelligence-ai-orchestration')
@Controller('intelligence-ai-orchestration')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class IntelligenceAIOrchestrationController {
  constructor(private readonly service: IntelligenceAIOrchestrationService) {}

  @Post()
  @RequirePermission('intelligence.orchestrate')
  async orchestrate(
    @Body()
    dto: {
      taskType: OrchestrationTaskType;
      context: OrchestrationContext;
    },
  ) {
    return this.service.orchestrate(dto.taskType, dto.context);
  }

  @Get(':taskId/status')
  @RequirePermission('intelligence.orchestration.read')
  async getStatus(@Param('taskId') taskId: string) {
    return this.service.getOrchestrationStatus(taskId);
  }

  @Get()
  @RequirePermission('intelligence.orchestration.read')
  async list(
    @Query('organizationId') organizationId?: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.service.listOrchestrations(organizationId, limit);
  }
}