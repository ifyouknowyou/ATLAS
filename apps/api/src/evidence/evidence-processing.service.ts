import { Injectable } from '@nestjs/common';
import type { EvidenceProcessingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { EvidenceAccessService } from './evidence-access.service';
import { JobQueueService, type BackgroundJobKind } from '../jobs/job-queue.service';

export type EvidenceProcessingKind =
  | 'TEXT_EXTRACTION'
  | 'METADATA_EXTRACTION'
  | 'OCR'
  | 'DOCUMENT_PARSING'
  | 'EMBEDDING';

/** Maps a processing kind to its background job kind. */
const JOB_KIND: Record<EvidenceProcessingKind, BackgroundJobKind> = {
  TEXT_EXTRACTION: 'EVIDENCE_TEXT_EXTRACTION',
  METADATA_EXTRACTION: 'EVIDENCE_METADATA_EXTRACTION',
  OCR: 'EVIDENCE_OCR',
  DOCUMENT_PARSING: 'EVIDENCE_TEXT_EXTRACTION',
  EMBEDDING: 'EVIDENCE_EMBEDDING',
};

/**
 * Evidence processing orchestration (§18–20).
 *
 * Enqueueing is idempotent (per evidence+kind) and asynchronous — the upload
 * request never blocks on extraction. Status transitions QUEUED → PROCESSING →
 * COMPLETED/PARTIAL/FAILED are driven by the job runner handlers.
 */
@Injectable()
export class EvidenceProcessingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EvidenceAccessService,
    private readonly queue: JobQueueService,
  ) {}

  async enqueue(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    kind: EvidenceProcessingKind,
  ): Promise<{ id: string; status: EvidenceProcessingStatus }> {
    await this.access.requireEvidence(principal, evidenceId, 'contribute');

    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: principal.organizationId },
      select: { id: true },
    });
    if (!evidence) {
      // requireEvidence already 404'd for inaccessible rows.
    }

    // Idempotent job row per evidence+kind.
    const job = await this.prisma.evidenceProcessingJob.upsert({
      where: { evidenceId_kind: { evidenceId, kind } },
      update: {
        status: 'QUEUED',
        attempts: 0,
        errorCode: null,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      },
      create: {
        evidenceId,
        kind,
        status: 'QUEUED',
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });

    await this.queue.enqueue({
      kind: JOB_KIND[kind],
      payload: { evidenceId, kind },
      organizationId: principal.organizationId,
      investigationId: null,
      createdById: principal.userId,
      dedupeKey: JobQueueService.dedupe(evidenceId, kind),
    });

    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { processingStatus: 'QUEUED' },
    });

    return { id: job.id, status: 'QUEUED' };
  }

  async status(evidenceId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.evidenceProcessingJob.findMany({
      where: { evidenceId, organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async retry(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    kind: EvidenceProcessingKind,
  ): Promise<void> {
    await this.access.requireEvidence(principal, evidenceId, 'contribute');
    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId, kind } },
      data: { status: 'QUEUED', attempts: 0, errorMessage: null },
    });
  }

  async cancel(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    kind: EvidenceProcessingKind,
  ): Promise<void> {
    await this.access.requireEvidence(principal, evidenceId, 'contribute');
    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId, kind } },
      data: { status: 'FAILED', errorMessage: 'Cancelled by user', completedAt: new Date() },
    });
  }
}
