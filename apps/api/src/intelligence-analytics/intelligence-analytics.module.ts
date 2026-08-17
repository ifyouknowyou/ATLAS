import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { JobsModule } from '../jobs/jobs.module';
import { IntelligenceAnalyticsService } from './intelligence-analytics.service';
import { IntelligenceAnalyticsController } from './intelligence-analytics.controller';
import { GraphAnalyticsService } from './graph-analytics.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { EntityResolutionService } from './entity-resolution.service';
import { IntelligenceScoringService } from './scoring.service';

@Module({
  imports: [PrismaModule, AiModule, JobsModule],
  providers: [
    IntelligenceAnalyticsService,
    GraphAnalyticsService,
    AnomalyDetectionService,
    EntityResolutionService,
    IntelligenceScoringService,
  ],
  exports: [IntelligenceAnalyticsService, GraphAnalyticsService, AnomalyDetectionService],
  controllers: [IntelligenceAnalyticsController],
})
export class IntelligenceAnalyticsModule {}