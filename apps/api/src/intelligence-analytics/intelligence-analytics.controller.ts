import { Controller, Get, Param, UseGuards, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { IntelligenceAnalyticsService } from './intelligence-analytics.service';
import { TriggerAnalysisDto } from './dto/trigger-analysis.dto';

@ApiTags('intelligence')
@Controller('intelligence')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class IntelligenceAnalyticsController {
  constructor(
    private readonly service: IntelligenceAnalyticsService,
  ) {}

  @Get('analyses')
  @RequirePermission('analytics.read')
  listAnalyses(@Query('investigationId') investigationId?: string) {
    return this.service.listAnalyses(investigationId);
  }

  @Post('analyses')
  @RequirePermission('analytics.create')
  triggerAnalysis(@Body() dto: TriggerAnalysisDto) {
    return this.service.triggerAnalysis(dto);
  }

  @Get('anomalies')
  @RequirePermission('alert.read')
  listAnomalies(@Query('investigationId') investigationId?: string, @Query('status') status?: string) {
    return this.service.listAnomalies({ investigationId, status });
  }

  @Post('anomalies/:id/review')
  @RequirePermission('alert.update')
  reviewAnomaly(@Param('id') id: string, @Body('status') status: string) {
    return this.service.reviewAnomaly(id, status);
  }

  @Get('matches')
  @RequirePermission('entity.read')
  listMatches(@Query('status') status?: string) {
    return this.service.listMatches(status);
  }
}