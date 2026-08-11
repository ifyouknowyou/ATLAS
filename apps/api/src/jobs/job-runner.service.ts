import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export type JobHandler = (payload: unknown) => Promise<void>;

/**
 * In-process job runner (Phase 5 §60). Polls the DB-backed queue on an
 * interval, claims one job at a time, and dispatches to a registered handler.
 * Handlers must be idempotent, retryable, permission-aware, and must not do
 * large sync work that would block the poll loop (they run sequentially).
 */
@Injectable()
export class JobRunnerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobRunnerService.name);
  private readonly handlers = new Map<string, JobHandler>();
  private readonly workerId = JobQueueService.workerId();
  private running = false;
  private pollHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly queue: JobQueueService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  onModuleInit(): void {
    const intervalMs = this.config.jobsPollIntervalMs ?? 2000;
    const handle = setInterval(() => void this.tick(), intervalMs);
    // Do not keep the process alive solely for the poller (tests, cold exit).
    handle.unref?.();
    this.pollHandle = handle;
    // First tick immediately.
    void this.tick();
  }

  onModuleDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  register(kind: string, handler: JobHandler): void {
    this.handlers.set(kind, handler);
  }

  /** Single-flight poll — never overlaps with a previous tick. */
  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const claimed = await this.queue.claimNext(this.workerId);
      if (!claimed) return;
      const handler = this.handlers.get(claimed.kind);
      if (!handler) {
        this.logger.warn(`No handler registered for job kind ${claimed.kind}`);
        await this.queue.fail(claimed.id, `No handler for ${claimed.kind}`, false);
        return;
      }
      try {
        await handler(claimed.payload);
        await this.queue.complete(claimed.id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown processing error';
        await this.queue.fail(claimed.id, message);
      }
    } finally {
      this.running = false;
    }
  }
}
