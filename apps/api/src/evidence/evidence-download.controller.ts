import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { AuthenticatedRequest } from '../auth/principal';
import { Public } from '../auth/public.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { EvidenceAccessService } from './evidence-access.service';
import { EvidenceStorageService } from './storage/evidence-storage.service';
import { EvidenceSignedUrlService } from './evidence-signed-url.service';
import { EvidenceAccessEventService } from './evidence-access-event.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Authorized evidence delivery (§14, §62, §64).
 *
 * - `GET /evidence/:id/download` and `/file` stream with the caller's bearer
 *   token (AuthGuard + PermissionsGuard run globally), then a delivery-time
 *   re-authz inside the service (membership, classification, status —
 *   ARCHIVED/RESTRICTED denied).
 * - `GET /evidence/:id/preview` streams inline for the viewer.
 * - `GET /evidence/:id/signed-url` mints a ~120s token for <img>/<object>/iframe.
 * - `GET /evidence/deliver/:token` is @Public (browser can't send headers) and
 *   re-validates the token + live access before streaming. Revocation (archive,
 *   re-classify, membership removal) takes effect immediately.
 */
@Controller('evidence')
export class EvidenceDownloadController {
  constructor(
    private readonly access: EvidenceAccessService,
    private readonly storage: EvidenceStorageService,
    private readonly signed: EvidenceSignedUrlService,
    private readonly events: EvidenceAccessEventService,
    private readonly prisma: PrismaService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Get(':id/download')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  async download(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.stream(request, id, { disposition: 'attachment' }, res);
  }

  @Get(':id/preview')
  @RateLimit({ limit: 120, windowMs: 60_000 })
  async preview(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.stream(request, id, { disposition: 'inline' }, res);
  }

  @Get(':id/signed-url')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  async signedUrl(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('version') version?: string,
  ) {
    await this.access.requireEvidence(request.principal, id, 'read');
    const token = this.signed.mint({
      evidenceId: id,
      versionId: version ?? null,
      sub: request.principal.userId,
      oid: request.principal.organizationId,
      sid: request.sessionPayload?.sid ?? '',
      ttlS: this.config.signedUrlTtlS,
    });
    return {
      url: `/api/evidence/deliver/${token}`,
      expiresAt: new Date(Date.now() + this.config.signedUrlTtlS * 1000).toISOString(),
    };
  }

  /** @Public — opened by <img>/<object>/iframe without an Authorization header. */
  @Get('deliver/:token')
  @Public()
  async deliver(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const decoded = this.signed.verify(token);
    // Delivery-time re-authz: reconstruct the principal from the DB.
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: decoded.sub, organizationId: decoded.oid },
      },
    });
    if (!membership) throw new ForbiddenException('Access revoked');

    const evidence = await this.prisma.evidence.findFirst({
      where: { id: decoded.evidenceId, organizationId: decoded.oid },
      include: { versions: { orderBy: { versionNumber: 'desc' } } },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');
    if (evidence.status === 'ARCHIVED' || evidence.status === 'RESTRICTED') {
      throw new ForbiddenException('This evidence is no longer available');
    }
    if (evidence.classification === 'RESTRICTED' && !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new ForbiddenException('RESTRICTED evidence requires elevated access');
    }

    const version =
      decoded.versionId
        ? evidence.versions.find((v) => v.id === decoded.versionId)
        : evidence.versions[0];
    if (!version) {
      throw new NotFoundException('Stored file not found');
    }

    await this.events.record({
      evidenceId: evidence.id,
      action: decoded.versionId ? 'DOWNLOADED' : 'PREVIEWED',
      actorType: 'USER',
      actorId: decoded.sub,
      organizationId: decoded.oid,
      versionId: version.id,
      safeMetadata: { via: 'signed-url' },
    });

    const { stream, size } = await this.storage.open(version.storageKey);
    this.setHeaders(res, evidence, version.mimeType, size, 'inline');
    return new StreamableFile(stream, { type: version.mimeType ?? 'application/octet-stream', length: size });
  }

  private async stream(
    request: AuthenticatedRequest,
    evidenceId: string,
    opts: { disposition: 'inline' | 'attachment' },
    res: Response,
  ): Promise<StreamableFile> {
    const evidence = await this.access.requireEvidence(
      request.principal,
      evidenceId,
      'read',
    );
    if (evidence.status === 'ARCHIVED') {
      throw new ForbiddenException('This evidence is archived');
    }
    const storageKey = evidence.storageKey;
    if (!storageKey) {
      throw new NotFoundException('This evidence has no stored file');
    }
    const versionId = evidence.versionId;

    await this.events.record({
      evidenceId,
      principal: request.principal,
      action: opts.disposition === 'attachment' ? 'DOWNLOADED' : 'PREVIEWED',
      versionId,
      safeMetadata: { via: 'authorized-stream' },
    });

    const { stream, size } = await this.storage.open(storageKey);
    this.setHeaders(res, evidence, evidence.mimeType, size, opts.disposition);
    return new StreamableFile(stream, {
      type: evidence.mimeType ?? 'application/octet-stream',
      length: size,
    });
  }

  private setHeaders(
    res: Response,
    evidence: { name: string },
    mimeType: string | null,
    size: number,
    disposition: string,
  ): void {
    const safeName = evidence.name.replace(/[^\w.\- ]/g, '_');
    res.setHeader('Content-Type', mimeType ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
    res.setHeader('Content-Length', String(size));
    // helmet sets X-Content-Type-Options: nosniff globally.
  }
}
