import { Injectable, NotFoundException } from '@nestjs/common';
import type { EvidenceLinkTargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { EvidenceAccessService } from './evidence-access.service';

/** Tables a link target can resolve into, and which column identifies it. */
const TARGET_MODELS: Record<EvidenceLinkTargetType, string> = {
  INVESTIGATION: 'investigation',
  ENTITY: 'entity',
  RELATIONSHIP: 'relationship',
  TIMELINE_EVENT: 'timelineEvent',
  NOTE: 'note',
  REPORT: 'report',
};

/**
 * Evidence ↔ intelligence-object linking (§16). Every association is
 * permission-checked: the target must exist in the caller's organization and
 * the caller must be able to read it before a link is created.
 */
@Injectable()
export class EvidenceLinkingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EvidenceAccessService,
  ) {}

  async list(evidenceId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.evidenceLink.findMany({
      where: { evidenceId, organizationId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, displayName: true } } },
    });
  }

  async create(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    targetType: EvidenceLinkTargetType,
    targetId: string,
    linkType = 'REFERS_TO',
  ) {
    // Authorize the evidence itself.
    await this.access.requireEvidence(principal, evidenceId, 'contribute');

    // Authorize + confirm the target exists in this org.
    const model = TARGET_MODELS[targetType];
    if (!model) throw new NotFoundException('Unsupported link target');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as Record<string, any>)[model];
    const exists = await delegate.findFirst({
      where: { id: targetId, organizationId: principal.organizationId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Linked target not found or not accessible');
    }

    return this.prisma.evidenceLink.upsert({
      where: {
        evidenceId_targetType_targetId: { evidenceId, targetType, targetId },
      },
      update: { linkType },
      create: {
        evidenceId,
        targetType,
        targetId,
        linkType,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
      include: { createdBy: { select: { id: true, displayName: true } } },
    });
  }

  async remove(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    targetType: EvidenceLinkTargetType,
    targetId: string,
  ): Promise<void> {
    await this.access.requireEvidence(principal, evidenceId, 'manage');
    await this.prisma.evidenceLink.deleteMany({
      where: { evidenceId, targetType, targetId, organizationId: principal.organizationId },
    });
  }
}