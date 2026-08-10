import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import {
  CreateEvidenceDto,
  ListEvidenceQueryDto,
  UpdateEvidenceDto,
} from './dto/evidence.dto';

/** Evidence metadata + integrity foundation (no file pipeline in Phase 2). */
@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListEvidenceQueryDto) {
    const where = {
      organizationId: principal.organizationId,
      ...(query.type ? { kind: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.investigationId ? { investigationId: query.investigationId } : {}),
      ...(query.q
        ? { name: { contains: query.q, mode: 'insensitive' as const } }
        : {}),
      // Non-admins see org-level + accessible-investigation evidence.
      ...(this.access.listAccessWhere(principal) ?? {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.evidence.findMany({
        where,
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
          collectedAt: true,
          investigationId: true,
          createdAt: true,
          createdBy: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.evidence.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async get(principal: AuthenticatedPrincipal, evidenceId: string) {
    const found = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: principal.organizationId },
      include: {
        investigation: { select: { id: true, title: true } },
        createdBy: { select: { id: true, displayName: true } },
      },
    });
    const evidence = requireFound(found, 'Evidence');
    if (evidence.investigationId) {
      await this.access.requireCapability(principal, evidence.investigationId, 'read');
    }
    return evidence;
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateEvidenceDto) {
    if (dto.investigationId) {
      await this.access.requireCapability(
        principal,
        dto.investigationId,
        'contribute',
      );
    } else {
      this.access.assertOrgPermission(principal, 'evidence.create');
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
    const evidence = await this.requireEvidence(
      principal,
      evidenceId,
      'evidence.update',
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

    await this.activity.record(principal, {
      type: 'EVIDENCE_UPDATED',
      message: `Evidence "${updated.name}" updated`,
      investigationId: updated.investigationId,
    });
    return updated;
  }

  async remove(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
  ): Promise<void> {
    const evidence = await this.requireEvidence(
      principal,
      evidenceId,
      'evidence.delete',
    );
    await this.prisma.evidence.delete({ where: { id: evidenceId } });
    await this.activity.record(principal, {
      type: 'EVIDENCE_UPDATED',
      message: `Evidence "${evidence.name}" removed`,
      investigationId: evidence.investigationId,
    });
  }

  private async requireEvidence(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    orgPermission: 'evidence.update' | 'evidence.delete',
  ): Promise<{ id: string; name: string; investigationId: string | null }> {
    const found = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: principal.organizationId },
      select: { id: true, name: true, investigationId: true },
    });
    const evidence = requireFound(found, 'Evidence');
    if (evidence.investigationId) {
      await this.access.requireCapability(
        principal,
        evidence.investigationId,
        'contribute',
      );
    } else {
      this.access.assertOrgPermission(principal, orgPermission);
    }
    return evidence;
  }
}