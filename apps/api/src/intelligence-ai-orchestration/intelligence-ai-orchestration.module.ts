import { Module } from '@nestjs/common';
import { IntelligenceAIOrchestrationService } from './intelligence-ai-orchestration.service';
import { IntelligenceAnalyticsModule } from '../intelligence-analytics/intelligence-analytics.module';
import { JobsModule } from '../jobs/jobs.module';
import { RulesModule } from '../rules/rules.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    IntelligenceAnalyticsModule,
    JobsModule,
    RulesModule,
    WorkflowsModule,
  ],
  providers: [IntelligenceAIOrchestrationService],
  exports: [IntelligenceAIOrchestrationService],
})
export class IntelligenceAIOrchestrationModule {}