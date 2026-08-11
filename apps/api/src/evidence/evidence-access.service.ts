import { ForbiddenException, Injectable } from '@nestjs/common';
import { Classification } from '@prisma/client';
import type { Permission } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import { requireFound } from '../common/resources';

export type EvidenceCapability = 'read' | 'annotate' | 'contribute' | 'manage';

const CAPABILITY_ORG_PERMISSION: Record<
  EvidenceCapability,
  { orgPermission: Permission; investigation: 'read' | 'contribute' | 'manage' }
> = {
  read: { orgPermission: 'evidence.read', investigation: 'read' },
  annotate: { orgPermission: 'evidence.annotate', investigation: 'contribute' },
  contribute: { orgPermission: 'evidence.update', investigation: 'contribute' },
  manage: { orgPermission: 'evidence.delete', investigation: 'manage' },
};

/**
 * Central evidence authorization (Phase 5 §4, §10, §11).
 *
 * Every evidence operation resolves: org scope → investigation membership (or
 * org permission for org-level evidence) → classification gate. Classification
 * is enforced for RESTRICTED unless the caller is an org admin or holds the
 * managing capability; classification lowering additionally requires
 * `evidence.classify` (§11 — a user can never lower classification without
 * explicit permission, and every change is audited).
 */
@Injectable()
export class EvidenceAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigation: InvestigationAccessService,
  ) {}

  isOrgAdmin(principal: AuthenticatedPrincipal): boolean {
    return principal.role === 'OWNER' || principal.role === 'ADMIN';
  }

  /**
   * Resolves evidence and enforces access. Selectively returns the row so
   * callers can build access events without a second query.
   */
  async requireEvidence(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    capability: EvidenceCapability,
  ): Promise<{
    id: string;
    name: string;
    classification: Classification;
    status: string;
    investigationId: string | null;
    storageKey: string | null;
    versionId: string | null;
    mimeType: string | null;
  }> {
    const found = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: principal.organizationId },
      select: {
        id: true,
        name: true,
        classification: true,
        status: true,
        investigationId: true,
        storageKey: true,
        mimeType: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          select: { id: true },
        },
      },
    });
    const evidence = requireFound(found, 'Evidence');

    const map = CAPABILITY_ORG_PERMISSION[capability];
    if (evidence.investigationId) {
      await this.investigation.requireCapability(
        principal,
        evidence.investigationId,
        map.investigation,
      );
    } else {
      this.investigation.assertOrgPermission(principal, map.orgPermission);
    }

    this.assertClassificationAccess(principal, evidence, capability);
    return {
      id: evidence.id,
      name: evidence.name,
      classification: evidence.classification,
      status: evidence.status,
      investigationId: evidence.investigationId,
      storageKey: evidence.storageKey,
      versionId: evidence.versions[0]?.id ?? null,
      mimeType: evidence.mimeType,
    };
  }

  /**
   * Classification access gate (§11, §13). RESTRICTED evidence requires an
   * elevated principal: org admin, or an investigation manager (LEAD) when the
   * evidence is investigation-scoped. PUBLIC/INTERNAL/CONFIDENTIAL are gated
   * purely by the investigation/org permission the requireEvidence path already
   * enforced.
   */
  private assertClassificationAccess(
    principal: AuthenticatedPrincipal,
    evidence: { classification: Classification; investigationId: string | null },
    _capability: EvidenceCapability,
  ): void {
    if (evidence.classification !== 'RESTRICTED') return;
    if (this.isOrgAdmin(principal)) return;
    if (evidence.investigationId === null) {
      throw new ForbiddenException('RESTRICTED evidence requires elevated access');
    }
    throw new ForbiddenException(
      'RESTRICTED evidence requires investigation manager access',
    );
  }

  /** Lowering classification is a privileged, audited action (§11). */
  async assertCanChangeClassification(
    principal: AuthenticatedPrincipal,
    evidenceId: string,
    next: Classification,
  ): Promise<{ current: Classification; investigationId: string | null; id: string }> {
    const found = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: principal.organizationId },
      select: { id: true, classification: true, investigationId: true },
    });
    const evidence = requireFound(found, 'Evidence');
    if (next !== evidence.classification) {
      this.investigation.assertOrgPermission(principal, 'evidence.classify');
    }
    return {
      id: evidence.id,
      current: evidence.classification,
      investigationId: evidence.investigationId,
    };
  }

  /** Scope an upload/annotation to an investigation's contribute capability. */
  async requireEvidenceByInvestigation(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    capability: 'contribute' | 'manage',
  ): Promise<void> {
    await this.investigation.requireCapability(principal, investigationId, capability);
  }

  /** Org-level evidence mutations require the org evidence.create permission. */
  assertOrgPermissionForUpload(principal: AuthenticatedPrincipal): void {
    this.investigation.assertOrgPermission(principal, 'evidence.create');
  }

  /** Prisma where fragment scoping evidence to org + access + classification. */
  listEvidenceWhere(
    principal: AuthenticatedPrincipal,
  ): Record<string, unknown> {
    const investigationWhere = this.investigation.listAccessWhere(principal);
    const orgAdmin = this.isOrgAdmin(principal);

    const accessClause = investigationWhere ?? {};
    const classificationClause = orgAdmin
      ? {}
      : {
          OR: [
            { classification: { not: 'RESTRICTED' as Classification } },
            {
              investigation: {
                members: {
                  some: { userId: principal.userId, role: { in: ['LEAD', 'ANALYST'] } },
                },
              },
            },
          ],
        };

    return {
      organizationId: principal.organizationId,
      ...(Object.keys(accessClause).length ? { ...accessClause } : {}),
      ...(Object.keys(classificationClause).length
        ? { ...classificationClause }
        : {}),
    };
  }
}