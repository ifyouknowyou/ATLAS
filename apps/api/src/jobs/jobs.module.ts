import { Global, Module } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';
import { JobRunnerService } from './job-runner.service';
import { AppConfigModule } from '../config/app-config.module';

/**
 * Background processing (Phase 5 §60). @Global so feature modules (evidence
 * processing, report generation, PDF generation) can enqueue jobs and register
 * handlers without an import cycle. The runner polls the DB-backed queue.
 */
@Global()
@Module({
  imports: [AppConfigModule],
  providers: [JobQueueService, JobRunnerService],
  exports: [JobQueueService, JobRunnerService],
})
export class JobsModule {}
