import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportAccessService } from './report-access.service';
import { ReportBuilderService } from './report-builder.service';
import { ReportVersionService } from './report-version.service';
import { ReportCitationService } from './report-citation.service';
import { ReportQualityService } from './report-quality.service';
import { ReportReviewService } from './report-review.service';
import { ReportPublishService } from './report-publish.service';
import { ReportTemplateService } from './report-template.service';
import { ReportExportService } from './report-export.service';
import { AiReportService } from './ai-report.service';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';
import { AiModule } from '../ai/ai.module';

/**
 * Reports (Phase 5). Imports InvestigationsModule + AiModule; no import of
 * CollaborationModule (comments query reports via Prisma — avoids cycles).
 */
@Module({
  imports: [InvestigationsModule, ActivityModule, AiModule],
  controllers: [ReportController],
  providers: [
    ReportService,
    ReportAccessService,
    ReportBuilderService,
    ReportVersionService,
    ReportCitationService,
    ReportQualityService,
    ReportReviewService,
    ReportPublishService,
    ReportTemplateService,
    ReportExportService,
    AiReportService,
  ],
})
export class ReportsModule {}