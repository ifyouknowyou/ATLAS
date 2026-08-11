import { Injectable, NotFoundException } from '@nestjs/common';
import { EvidenceAccessEventService } from './evidence-access-event.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { EvidenceStorageService } from './storage/evidence-storage.service';
import { HashService } from './hashing/hash.service';

export type EvidenceChangeType =
  | 'UPLOAD'
  | 'METADATA_EDIT'
  | 'CLASSIFICATION_CHANGE'
  | 'RESTORE'
  | 'REUPLOAD';

/**
 * Evidence versioning (Phase 5 §7). Each version captures a storage key, the
 * server-computed SHA-256 hash, size, mime type and original filename, so a
 * version is a precise immutable snapshot of the file at a point in time.
 */
@Injectable()
export class EvidenceVersionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EvidenceAccessEventService,
    private readonly storage: EvidenceStorageService,
    private readonly hash: HashService,
  ) {}

  /**
   * Persists the first version of a freshly uploaded evidence record.
   */
  async createInitial(
    principal: AuthenticatedPrincipal,
    input: {
      evidenceId: string;
      originalFilename: string;
      mimeType: string;
      buffer: Buffer;
      changeSummary: string;
    },
  ): Promise<{ id: string; versionNumber: number; hash: string; size: number }> {
    const { evidenceId, originalFilename, mimeType, buffer, changeSummary } = input;
    const hash = this.hash.sha256(buffer);
    const { storageKey, size } = await this.storage.save(
      evidenceId,
      1,
      originalFilename,
      buffer,
    );
    const version = await this.prisma.evidenceVersion.create({
      data: {
        evidenceId,
        versionNumber: 1,
        storageKey,
        hash,
        size,
        mimeType,
        originalFilename,
        changeType: 'UPLOAD',
        changeSummary,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });
    await this.events.record({
      evidenceId,
      principal,
      action: 'UPLOADED',
      versionId: version.id,
      safeMetadata: { hash, size, mimeType },
    });
    // Point the evidence row at the newest version's hash + storage.
    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { hash, size, mimeType, storageKey, originalFilename },
    });
    return { id: version.id, versionNumber: version.versionNumber, hash, size };
  }

  async list(evidenceId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.evidenceVersion.findMany({
      where: { evidenceId, organizationId },
      orderBy: { versionNumber: 'desc' },
      include: { createdBy: { select: { id: true, displayName: true } } },
    });
  }

  /** Restores a historical version's file as the current bytes. */
  async restore(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    versionNumber: number,
    organizationId: string,
  ): Promise<void> {
    const version = await this.prisma.evidenceVersion.findFirst({
      where: { evidenceId, versionNumber, organizationId },
    });
    if (!version) {
      throw new NotFoundException('Evidence version not found');
    }
    const { stream } = await this.storage.open(version.storageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);
    const current = await this.prisma.evidenceVersion.findFirst({
      where: { evidenceId, organizationId },
      orderBy: { versionNumber: 'desc' },
    });
    const nextNumber = (current?.versionNumber ?? 0) + 1;
    const creation = await this.createNewVersion(principal, {
      evidenceId,
      buffer,
      originalFilename: version.originalFilename ?? 'restored',
      mimeType: version.mimeType ?? 'application/octet-stream',
      changeType: 'RESTORE',
      changeSummary: `Restored from v${versionNumber}`,
      nextNumber,
    });
    await this.events.record({
      evidenceId,
      principal,
      action: 'RESTORED',
      versionId: creation.id,
      safeMetadata: { fromVersion: versionNumber },
    });
  }

  async createNewVersion(
    principal: AuthenticatedPrincipal,
    input: {
      evidenceId: string;
      buffer: Buffer;
      originalFilename: string;
      mimeType: string;
      changeType: EvidenceChangeType;
      changeSummary: string;
      nextNumber?: number;
    },
  ): Promise<{ id: string; versionNumber: number }> {
    const { evidenceId, buffer, originalFilename, mimeType, changeType, changeSummary } = input;
    const current = await this.prisma.evidenceVersion.findFirst({
      where: { evidenceId, organizationId: principal.organizationId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = input.nextNumber ?? (current?.versionNumber ?? 0) + 1;
    const hash = this.hash.sha256(buffer);
    const { storageKey, size } = await this.storage.save(
      evidenceId,
      versionNumber,
      originalFilename,
      buffer,
    );
    const version = await this.prisma.evidenceVersion.create({
      data: {
        evidenceId,
        versionNumber,
        storageKey,
        hash,
        size,
        mimeType,
        originalFilename,
        changeType,
        changeSummary,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });
    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { hash, size, mimeType, storageKey, originalFilename: version.originalFilename },
    });
    return { id: version.id, versionNumber };
  }
}