import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { EvidenceService } from './evidence.service';
import { EvidenceVersionService } from './evidence-version.service';
import { EvidenceAccessService } from './evidence-access.service';
import { ActivityService } from '../common/activity.service';
import { UploadEvidenceBodyDto } from './dto/evidence-upload.dto';

interface UploadedFileShape {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/** Sniffable file signatures (magic bytes) for upload validation (§4). */
const MAGIC_BYTES: Array<{ ext: string; mime: string; magic: number[] }> = [
  { ext: 'pdf', mime: 'application/pdf', magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: 'png', mime: 'image/png', magic: [0x89, 0x50, 0x4e, 0x47] }, // .PNG
  { ext: 'jpg', mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
  { ext: 'gif', mime: 'image/gif', magic: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { ext: 'webp', mime: 'image/webp', magic: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { ext: 'zip', mime: 'application/zip', magic: [0x50, 0x4b, 0x03, 0x04] }, // PK
];

/**
 * Secure evidence upload (Phase 5 §4, §5, §6).
 *
 * Multipart via memoryStorage (validate before ever touching disk), explicit
 * size/MIME/magic-byte validation, generated server-side storage key, real
 * server-computed SHA-256, and a first EvidenceVersion + chain-of-custody
 * access event. The client never supplies a filename used on disk.
 */
@Controller('evidence')
export class EvidenceUploadController {
  constructor(
    private readonly evidence: EvidenceService,
    private readonly versions: EvidenceVersionService,
    private readonly access: EvidenceAccessService,
    private readonly activity: ActivityService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post('upload')
  @RequirePermission('evidence.create')
  @RateLimit({ limit: 5, windowMs: 60_000 })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // memoryStorage is the default in Nest 11
      limits: { fileSize: 25 * 1024 * 1024, files: 1 },
    }),
  )
  async upload(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: UploadedFileShape | undefined,
    @Body() dto: UploadEvidenceBodyDto,
  ) {
    if (!file || file.size === 0) {
      throw new BadRequestException('A non-empty file is required');
    }
    const maxBytes = this.config.maxUploadMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File exceeds the ${this.config.maxUploadMb} MiB upload limit`,
      );
    }

    const detected = this.detectFileType(file.buffer, file.originalname, file.mimetype);
    const originalFilename = this.sanitizeOriginalName(file.originalname);

    // Authorize scoped evidence before any write.
    if (dto.investigationId) {
      await this.access.requireEvidenceByInvestigation(
        request.principal,
        dto.investigationId,
        'contribute',
      );
    } else {
      // org-level upload — assert org permission here (service handles it too).
      await this.access.assertOrgPermissionForUpload(request.principal);
    }

    const evidence = await this.evidence.createFromUpload(request.principal, {
      title: dto.title ?? originalFilename,
      description: dto.description,
      source: dto.source,
      kind: dto.type ?? detected.kind,
      classification: dto.classification,
      status: dto.status ?? 'AVAILABLE',
      reference: dto.reference,
      investigationId: dto.investigationId,
      mimeType: detected.mime,
    });

    const version = await this.versions.createInitial(request.principal, {
      evidenceId: evidence.id,
      originalFilename,
      mimeType: detected.mime,
      buffer: file.buffer,
      changeSummary: 'Initial upload',
    });

    await this.activity.record(request.principal, {
      type: 'EVIDENCE_UPLOADED',
      message: `Evidence ${evidence.name} uploaded`,
      investigationId: evidence.investigationId,
      metadata: { evidenceId: evidence.id, hash: version.hash },
    });

    return {
      id: evidence.id,
      name: evidence.name,
      hash: version.hash,
      versionNumber: version.versionNumber,
      size: version.size,
      mimeType: detected.mime,
    };
  }

  /** Magic-byte detection overrides any client-supplied mime type. */
  private detectFileType(
    buffer: Buffer,
    _originalname: string,
    claimedMime: string,
  ): { mime: string; kind: string } {
    const magic = Array.from(buffer.subarray(0, 8));
    const match = MAGIC_BYTES.find((sig) =>
      sig.magic.every((b, i) => magic[i] === b),
    );
    if (match) return { mime: match.mime, kind: this.kindForMime(match.mime) };

    const normalized = (claimedMime || '').split(';')[0].trim().toLowerCase();
    // Binary types MUST match magic bytes — a claimed PDF (or image/zip) that
    // does not start with its signature is rejected rather than trusted.
    const requiresMagic = (m: string) =>
      m === 'application/pdf' ||
      m === 'application/zip' ||
      m === 'application/gzip' ||
      m.startsWith('image/');
    if (requiresMagic(normalized)) {
      throw new BadRequestException(
        `File content does not match declared type: ${claimedMime || 'unknown'}`,
      );
    }
    // Non-binary allowlist: text/plain, text/csv, text/html, JSON, XML, logs.
    if (
      normalized.startsWith('text/') ||
      normalized === 'application/json' ||
      normalized === 'application/xml' ||
      normalized === 'application/octet-stream' ||
      normalized === ''
    ) {
      return { mime: normalized || 'application/octet-stream', kind: this.kindForMime(normalized) };
    }
    throw new BadRequestException(
      `Unsupported file type: ${claimedMime || 'unknown'}`,
    );
  }

  private kindForMime(mime: string): string {
    if (mime.startsWith('image/')) return 'IMAGE';
    if (mime === 'application/pdf') return 'DOCUMENT';
    if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml') {
      return 'LOG';
    }
    if (mime === 'application/zip' || mime === 'application/gzip') return 'ARCHIVE';
    return 'OTHER';
  }

  private sanitizeOriginalName(name: string): string {
    // Keep only the basename + safe chars; never used as a disk path.
    const base = (name || 'evidence').split(/[\\/]/).pop() ?? 'evidence';
    return base.replace(/[^\w.\- ]/g, '_').slice(0, 120) || 'evidence';
  }
}

// Namespace augmentation is avoided — the access service exposes these helpers.
export type { UploadedFileShape };
