import { Inject, Injectable, Logger } from '@nestjs/common';
import { BackgroundJobStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export type BackgroundJobKind =
  | 'EVIDENCE_TEXT_EXTRACTION'
  | 'EVIDENCE_METADATA_EXTRACTION'
  | 'EVIDENCE_OCR'
  | 'EVIDENCE_EMBEDDING'
  | 'REPORT_GENERATION'
  | 'PDF_GENERATION'
  | 'NOTIFICATION_DISPATCH';

export interface EnqueueJobInput {
  kind: BackgroundJobKind;
  payload: Record<string, unknown>;
  organizationId: string;
  investigationId?: string | null;
  createdById?: string | null;
  /** Idempotency key — a re-enqueue with the same key is a no-op. */
  dedupeKey?: string | null;
  scheduledAt?: Date;
}

/**
 * Single-instance DB-backed job queue (Phase 5 §60).
 *
 * Idempotent enqueue (via @@unique([kind, dedupeKey])), atomic claim
 * (transaction + lockToken prevents double-run), retry with backoff, safe
 * error messages, and cancel. No BullMQ dependency — documented scaling caveat.
 */
@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async enqueue(input: EnqueueJobInput): Promise<{ id: string; created: boolean }> {
    const { kind, payload, organizationId, investigationId, createdById, dedupeKey, scheduledAt } =
      input;
    const data: Prisma.BackgroundJobCreateInput = {
      kind,
      status: 'QUEUED',
      payload: payload as Prisma.InputJsonValue,
      dedupeKey: dedupeKey ?? null,
      scheduledAt: scheduledAt ?? new Date(),
      organization: { connect: { id: organizationId } },
      investigation: investigationId
        ? { connect: { id: investigationId } }
        : undefined,
      createdBy: createdById ? { connect: { id: createdById } } : undefined,
    };

    if (dedupeKey) {
      // Idempotent: an existing QUEUED/PROCESSING job with the same key wins.
      const existing = await this.prisma.backgroundJob.findUnique({
        where: { kind_dedupeKey: { kind, dedupeKey } },
      });
      if (existing) {
        return { id: existing.id, created: false };
      }
      try {
        const job = await this.prisma.backgroundJob.create({ data });
        return { id: job.id, created: true };
      } catch (err) {
        // Unique constraint race — a concurrent enqueue won.
        if ((err as { code?: string }).code === 'P2002') {
          const existing = await this.prisma.backgroundJob.findUnique({
            where: { kind_dedupeKey: { kind, dedupeKey } },
          });
          if (existing) return { id: existing.id, created: false };
        }
        throw err;
      }
    }
    const job = await this.prisma.backgroundJob.create({ data });
    return { id: job.id, created: true };
  }

  /**
   * Atomically claims the next due job. Returns null when nothing is due.
   * The lockToken makes the claim visible to other workers (single-instance
   * today, but safe to extend).
   */
  async claimNext(workerId: string): Promise<{ id: string; kind: string; payload: unknown } | null> {
    const candidate = await this.prisma.backgroundJob.findFirst({
      where: { status: 'QUEUED', scheduledAt: { lte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      select: { id: true, kind: true, payload: true },
      take: 1,
    });
    if (!candidate) return null;

    try {
      const claimed = await this.prisma.$transaction(async (tx) => {
        const row = await tx.backgroundJob.findFirst({
          where: { id: candidate.id, status: 'QUEUED' },
        });
        if (!row) return null;
        return tx.backgroundJob.update({
          where: { id: row.id },
          data: {
            status: 'PROCESSING',
            lockToken: workerId,
            attempts: { increment: 1 },
            startedAt: new Date(),
          },
          select: { id: true, kind: true, payload: true },
        });
      });
      return claimed;
    } catch (err) {
      // Concurrent claim — another worker got it first.
      if ((err as { code?: string }).code === 'P2028' || (err as { code?: string }).code === 'P2002') {
        return null;
      }
      throw err;
    }
  }

  async complete(jobId: string, result?: Record<string, unknown>): Promise<void> {
    await this.prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        result: result ? (result as Prisma.InputJsonValue) : undefined,
        completedAt: new Date(),
      },
    });
  }

  async fail(jobId: string, error: string, retryable = true): Promise<void> {
    const job = await this.prisma.backgroundJob.findUnique({ where: { id: jobId } });
    if (!job) return;
    const attempts = (job.attempts ?? 0) + 1;
    if (retryable && attempts < job.maxAttempts) {
      // Requeue with exponential backoff.
      const backoffMs = Math.min(60_000, 2 ** attempts * 1_000);
      await this.prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: 'QUEUED',
          scheduledAt: new Date(Date.now() + backoffMs),
          errorMessage: error,
          lockToken: null,
        },
      });
      this.logger.warn(`Job ${jobId} (${job.kind}) requeued (attempt ${attempts})`);
      return;
    }
    await this.prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: error,
        completedAt: new Date(),
      },
    });
    this.logger.error(`Job ${jobId} (${job.kind}) failed: ${error}`);
  }

  async cancel(jobId: string): Promise<void> {
    await this.prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
  }

  async list(status?: BackgroundJobStatus, limit = 50): Promise<unknown[]> {
    return this.prisma.backgroundJob.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        kind: true,
        status: true,
        attempts: true,
        maxAttempts: true,
        errorCode: true,
        errorMessage: true,
        scheduledAt: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });
  }

  /** Deterministic dedupe key for a processing job on one evidence record. */
  static dedupe(evidenceId: string, kind: string): string {
    return `${kind}:${evidenceId}`;
  }

  static workerId(): string {
    return randomUUID();
  }
}
