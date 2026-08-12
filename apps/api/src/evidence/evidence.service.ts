import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPage } from '../common/pagination.dto';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import {
  CreateEvidenceDto,
  ListEvidenceQueryDto,
  UpdateEvidenceDto,
} from './dto/evidence.dto';
import { UpdateEvidenceExtendedDto } from './dto/evidence-upload.dto';
import { EvidenceAccessService } from './evidence-access.service';
import { EvidenceAccessEventService } from './evidence-access-event.service';

/** Evidence metadata + integrity foundation (Phase 2) extended for Phase 5. */
@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EvidenceAccessService,
    private readonly activity: ActivityService,
    private readonly events: EvidenceAccessEventService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListEvidenceQueryDto) {
    const where = this.access.listEvidenceWhere(principal) as Record<string, unknown>;
    if (query.type) where.kind = query.type;
    if (query.status) where.status = query.status;
    if (query.classification) where.classification = query.classification;
    if (query.investigationId) where.investigationId = query.investigationId;
    if (query.q) {
      where.OR = [{ name: { contains: query.q, mode: 'insensitive' } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.evidence.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        select: {
          id: true,
          name: true,
          description: true,
          source: true,
          kind: true,
          status: true,
          classification: true,
          hash: true,
          mimeType: true,
          size: true,
          originalFilename: true,
          processingStatus: true,
          verifiedAt: true,
          collectedAt: true,
          investigationId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, displayName: true } },
          _count: { select: { versions: true, annotations: true, accessEvents: true, links: true } },
        },
      }),
      this.prisma.evidence.count({ where }),
    ]);

    return toPage(items, total, query);
  }

  async get(principal: AuthenticatedPrincipal, evidenceId: string) {
    const evidence = await this.access.requireEvidence(principal, evidenceId, 'read');
    return this.prisma.evidence.findUnique({
      where: { id: evidence.id },
      select: {
        id: true,
        name: true,
        description: true,
        source: true,
        kind: true,
        status: true,
        classification: true,
        hash: true,
        mimeType: true,
        size: true,
        originalFilename: true,
        processingStatus: true,
        verifiedAt: true,
        reference: true,
        collectedAt: true,
        investigationId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: { select: { id: true, displayName: true } },
        _count: { select: { versions: true, annotations: true, accessEvents: true, links: true } },
      },
    });
  }

  /**
   * Creates the metadata row for a freshly uploaded file (Phase 5). The file
   * itself is written by the storage service afterwards; this is the record
   * that versioning and chain-of-custody attach to.
   */
  async createFromUpload(
    principal: AuthenticatedPrincipal,
    input: {
      title: string;
      description?: string;
      source?: string;
      kind: string;
      classification?: string;
      status?: string;
      reference?: string;
      investigationId?: string;
      mimeType?: string;
    },
  ) {
    const evidence = await this.prisma.evidence.create({
      data: {
        name: input.title,
        description: input.description ?? null,
        source: input.source ?? null,
        kind: (input.kind as never) ?? 'OTHER',
        status: (input.status as never) ?? 'AVAILABLE',
        classification: (input.classification as never) ?? 'INTERNAL',
        reference: input.reference ?? null,
        mimeType: input.mimeType ?? null,
        investigationId: input.investigationId ?? null,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });
    return evidence;
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateEvidenceDto) {
    if (dto.investigationId) {
      await this.access.requireEvidenceByInvestigation(
        principal,
        dto.investigationId,
        'contribute',
      );
    } else {
      this.access.assertOrgPermissionForUpload(principal);
    }

    const evidence = await this.prisma.evidence.create({
      data: {
        name: dto.title,
        description: dto.description,
        source: dto.source,
        kind: dto.type ?? 'OTHER',
        status: dto.status ?? 'PENDING',
        classification: dto.classification ?? 'INTERNAL',
        hash: dto.hash,
        mimeType: dto.mimeType,
        size: dto.size,
        reference: dto.reference,
        collectedAt: dto.collectedAt ? new Date(dto.collectedAt) : null,
        investigationId: dto.investigationId ?? null,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'EVIDENCE_ADDED',
      message: `Evidence "${evidence.name}" added`,
      investigationId: evidence.investigationId,
      metadata: { evidenceId: evidence.id },
    });
    return evidence;
  }

  async update(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    dto: UpdateEvidenceDto,
  ) {
    const evidence = await this.access.requireEvidence(
      principal,
      evidenceId,
      'contribute',
    );
    const updated = await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: {
        name: dto.title,
        description: dto.description,
        source: dto.source,
        kind: dto.type,
        status: dto.status,
        classification: dto.classification,
        hash: dto.hash,
        mimeType: dto.mimeType,
        size: dto.size,
        reference: dto.reference,
        collectedAt: dto.collectedAt ? new Date(dto.collectedAt) : undefined,
      },
    });

    if (dto.classification && dto.classification !== evidence.classification) {
      await this.events.record({
        evidenceId,
        principal,
        action: 'CLASSIFICATION_CHANGED',
        safeMetadata: { from: evidence.classification, to: dto.classification },
      });
    } else {
      await this.events.record({
        evidenceId,
        principal,
        action: 'METADATA_EDITED',
      });
    }

    await this.activity.record(principal, {
      type: 'EVIDENCE_UPDATED',
      message: `Evidence "${updated.name}" updated`,
      investigationId: updated.investigationId,
    });
    return updated;
  }

  /** Extended Phase 5 metadata update (classification changes audited). */
  async updateExtended(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    dto: UpdateEvidenceExtendedDto,
  ) {
    const evidence = await this.access.requireEvidence(
      principal,
      evidenceId,
      'contribute',
    );

    if (dto.classification && dto.classification !== evidence.classification) {
      await this.access.assertCanChangeClassification(
        principal,
        evidenceId,
        dto.classification,
      );
    }

    const updated = await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: {
        name: dto.title,
        description: dto.description,
        source: dto.source,
        kind: dto.kind,
        status: dto.status,
        classification: dto.classification,
        reference: dto.reference,
        investigationId: dto.investigationId,
      },
    });

    const action = dto.classification && dto.classification !== evidence.classification
      ? 'CLASSIFICATION_CHANGED'
      : 'METADATA_EDITED';
    await this.events.record({
      evidenceId,
      principal,
      action,
      safeMetadata: action === 'CLASSIFICATION_CHANGED'
        ? { from: evidence.classification, to: dto.classification }
        : undefined,
    });

    await this.activity.record(principal, {
      type: action === 'CLASSIFICATION_CHANGED' ? 'EVIDENCE_CLASSIFIED' : 'EVIDENCE_UPDATED',
      message: `Evidence "${updated.name}" ${action === 'CLASSIFICATION_CHANGED' ? 'reclassified' : 'updated'}`,
      investigationId: updated.investigationId,
    });
    return updated;
  }

  async setArchived(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    archived: boolean,
  ): Promise<void> {
    const evidence = await this.access.requireEvidence(
      principal,
      evidenceId,
      'manage',
    );
    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { status: archived ? 'ARCHIVED' : 'AVAILABLE' },
    });
    await this.events.record({
      evidenceId,
      principal,
      action: archived ? 'ARCHIVED' : 'RESTORED',
    });
    await this.activity.record(principal, {
      type: archived ? 'EVIDENCE_UPDATED' : 'EVIDENCE_UPDATED',
      message: `Evidence "${evidence.name}" ${archived ? 'archived' : 'restored'}`,
      investigationId: evidence.investigationId,
    });
  }

  async accessHistory(principal: AuthenticatedPrincipal, evidenceId: string) {
    await this.access.requireEvidence(principal, evidenceId, 'read');
    return this.prisma.evidenceAccessEvent.findMany({
      where: { evidenceId, organizationId: principal.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        evidenceId: true,
        versionId: true,
        action: true,
        actorType: true,
        actorId: true,
        safeMetadata: true,
        createdAt: true,
      },
    });
  }

  async remove(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
  ): Promise<void> {
    const evidence = await this.access.requireEvidence(
      principal,
      evidenceId,
      'manage',
    );
    await this.events.record({
      evidenceId,
      principal,
      action: 'DELETED',
    });
    await this.prisma.evidence.delete({ where: { id: evidenceId } });
    await this.activity.record(principal, {
      type: 'EVIDENCE_REMOVED',
      message: `Evidence "${evidence.name}" removed`,
      investigationId: evidence.investigationId,
    });
  }
}
