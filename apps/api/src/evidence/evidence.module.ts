import { Module, OnModuleInit } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { EvidenceUploadController } from './evidence-upload.controller';
import { EvidenceDownloadController } from './evidence-download.controller';
import { EvidenceProcessingController } from './evidence-processing.controller';
import { EvidenceAccessService } from './evidence-access.service';
import { EvidenceAccessEventService } from './evidence-access-event.service';
import { EvidenceVersionService } from './evidence-version.service';
import { EvidenceAnnotationService } from './evidence-annotation.service';
import { EvidenceLinkingService } from './evidence-linking.service';
import { EvidenceSearchService } from './evidence-search.service';
import { EvidenceProcessingService } from './evidence-processing.service';
import { EvidenceSignedUrlService } from './evidence-signed-url.service';
import { EvidenceProcessingHandler } from './processing/evidence-processing.handler';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';
import { JobRunnerService } from '../jobs/job-runner.service';

@Module({
  imports: [InvestigationsModule, ActivityModule],
  controllers: [
    EvidenceController,
    EvidenceUploadController,
    EvidenceDownloadController,
    EvidenceProcessingController,
  ],
  providers: [
    EvidenceService,
    EvidenceAccessService,
    EvidenceAccessEventService,
    EvidenceVersionService,
    EvidenceAnnotationService,
    EvidenceLinkingService,
    EvidenceSearchService,
    EvidenceProcessingService,
    EvidenceSignedUrlService,
    EvidenceProcessingHandler,
  ],
  exports: [EvidenceAccessService, EvidenceAccessEventService],
})
export class EvidenceModule implements OnModuleInit {
  constructor(
    private readonly runner: JobRunnerService,
    private readonly handler: EvidenceProcessingHandler,
  ) {}

  onModuleInit(): void {
    for (const kind of [
      'EVIDENCE_TEXT_EXTRACTION',
      'EVIDENCE_METADATA_EXTRACTION',
      'EVIDENCE_OCR',
      'EVIDENCE_EMBEDDING',
    ]) {
      this.runner.register(kind, (payload) => this.handler.handle(payload));
    }
  }
}
