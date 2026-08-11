import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceStorageService } from '../storage/evidence-storage.service';

export interface EvidenceProcessingPayload {
  evidenceId: string;
  kind: string;
}

/**
 * Evidence extraction handlers (§18–20).
 *
 * Runs inside the job runner (never in a request handler). Text extraction
 * for text/* and JSON reads the stored bytes and writes extracted text into
 * `Evidence.content`. OCR/embedding/parsing are adapter seams: when no
 * external extractor is configured they complete as PARTIAL with a safe
 * message rather than failing the evidence. All errors are surfaced as safe,
 * user-presentable messages.
 */
@Injectable()
export class EvidenceProcessingHandler {
  private readonly logger = new Logger(EvidenceProcessingHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: EvidenceStorageService,
  ) {}

  async handle(payload: unknown): Promise<void> {
    const p = payload as EvidenceProcessingPayload;
    if (!p?.evidenceId || !p.kind) {
      throw new Error('Invalid processing payload');
    }
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: p.evidenceId },
    });
    if (!evidence || !evidence.storageKey) {
      throw new Error('Evidence no longer available for processing');
    }

    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId: p.evidenceId, kind: p.kind } },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });
    await this.prisma.evidence.update({
      where: { id: p.evidenceId },
      data: { processingStatus: 'PROCESSING' },
    });

    try {
      switch (p.kind) {
        case 'TEXT_EXTRACTION':
        case 'DOCUMENT_PARSING':
          await this.extractText(evidence.id, evidence.mimeType);
          break;
        case 'METADATA_EXTRACTION':
          await this.extractMetadata(evidence.id);
          break;
        case 'OCR':
        case 'EMBEDDING':
          // Adapter seam — mark partial with a safe message when unconfigured.
          await this.completePartial(evidence.id, p.kind, 'Extractor not configured for this kind');
          break;
        default:
          throw new Error('Unsupported processing kind');
      }
      await this.prisma.evidence.update({
        where: { id: evidence.id },
        data: { processingStatus: 'COMPLETED' },
      });
    } catch (err) {
      const safeMessage = err instanceof Error ? this.safeMessage(err.message) : 'Processing failed';
      await this.prisma.evidenceProcessingJob.update({
        where: { evidenceId_kind: { evidenceId: p.evidenceId, kind: p.kind } },
        data: {
          status: 'FAILED',
          errorMessage: safeMessage,
          completedAt: new Date(),
        },
      });
      await this.prisma.evidence.update({
        where: { id: evidence.id },
        data: { processingStatus: 'FAILED' },
      });
      throw new Error(safeMessage); // let the queue retry with backoff
    }
  }

  private async extractText(evidenceId: string, mimeType: string | null): Promise<void> {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: { storageKey: true },
    });
    if (!evidence?.storageKey) throw new Error('No stored file');
    const { stream } = await this.storage.open(evidence.storageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const text = Buffer.concat(chunks).toString('utf8');

    // Only text-bearing formats produce useful content.
    const isText = !mimeType || mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml';
    if (isText) {
      await this.prisma.evidence.update({
        where: { id: evidenceId },
        data: { content: text.slice(0, 200_000) },
      });
    }
    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId, kind: 'TEXT_EXTRACTION' } },
      data: { status: 'COMPLETED', result: { bytes: text.length }, completedAt: new Date() },
    });
  }

  private async extractMetadata(evidenceId: string): Promise<void> {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: { id: true, mimeType: true, size: true, originalFilename: true },
    });
    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId, kind: 'METADATA_EXTRACTION' } },
      data: {
        status: 'COMPLETED',
        result: {
          mimeType: evidence?.mimeType ?? null,
          size: evidence?.size ?? null,
          filename: evidence?.originalFilename ?? null,
        },
        completedAt: new Date(),
      },
    });
  }

  private async completePartial(evidenceId: string, kind: string, message: string): Promise<void> {
    await this.prisma.evidenceProcessingJob.update({
      where: { evidenceId_kind: { evidenceId, kind } },
      data: { status: 'PARTIAL', errorMessage: message, completedAt: new Date() },
    });
    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { processingStatus: 'PARTIAL' },
    });
  }

  private safeMessage(message: string): string {
    // Strip anything that could look like a stack trace / internal path.
    return message.split('\n')[0]?.slice(0, 200) || 'Processing failed';
  }
}
