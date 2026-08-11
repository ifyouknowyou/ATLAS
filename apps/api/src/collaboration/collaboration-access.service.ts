import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';

export interface TargetAccess {
  investigationId: string | null;
  readable: boolean;
  contribute: boolean;
}

const TARGET_TABLES: Record<string, string> = {
  INVESTIGATION: 'investigation',
  ENTITY: 'entity',
  EVIDENCE: 'evidence',
  TIMELINE_EVENT: 'timelineEvent',
  REPORT: 'report',
  REPORT_BLOCK: 'reportBlock',
  NOTE: 'note',
  RELATIONSHIP: 'relationship',
};

/**
 * Polymorphic target access resolution for collaboration (Phase 5 §39, §43).
 *
 * Depends only on Prisma + InvestigationAccessService — never imports the
 * evidence/reports modules — so comments/notifications/presence can resolve
 * any CommentTargetType without creating module cycles.
 */
@Injectable()
export class CollaborationAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigation: InvestigationAccessService,
  ) {}

  /**
   * Resolves whether the principal can read/contribute to a target resource.
   * For investigation-scoped targets, membership drives access; org-level
   * targets fall back to org read permissions.
   */
  async resolveTargetAccess(
    principal: AuthenticatedPrincipal,
    targetType: string,
    targetId: string,
  ): Promise<TargetAccess> {
    const table = TARGET_TABLES[targetType];
    if (!table) return { investigationId: null, readable: false, contribute: false };

    if (targetType === 'INVESTIGATION') {
      const inv = await this.prisma.investigation.findFirst({
        where: { id: targetId, organizationId: principal.organizationId },
        select: { id: true },
      });
      if (!inv) return { investigationId: targetId, readable: false, contribute: false };
      return this.investigationAccessFor(principal, targetId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as Record<string, any>)[table];
    const row = await delegate.findFirst({
      where: { id: targetId, organizationId: principal.organizationId },
      select: { investigationId: true },
    });
    if (!row) return { investigationId: null, readable: false, contribute: false };

    if (row.investigationId) {
      return this.investigationAccessFor(principal, row.investigationId);
    }
    // Org-level target (no investigation) — readable if the caller holds the
    // org read permission for the resource kind.
    const readable = this.canReadOrgTarget(principal, targetType);
    return { investigationId: null, readable, contribute: readable };
  }

  /** Throws 404 if the target doesn't exist/isn't accessible — never leaks. */
  async requireTarget(
    principal: AuthenticatedPrincipal,
    targetType: string,
    targetId: string,
  ): Promise<TargetAccess> {
    const access = await this.resolveTargetAccess(principal, targetType, targetId);
    if (!access.readable) {
      throw new NotFoundException('Target not found or not accessible');
    }
    return access;
  }

  private async investigationAccessFor(
    principal: AuthenticatedPrincipal,
    investigationId: string,
  ): Promise<TargetAccess> {
    if (principal.role === 'OWNER' || principal.role === 'ADMIN') {
      return { investigationId, readable: true, contribute: true };
    }
    const member = await this.prisma.investigationMember.findUnique({
      where: { investigationId_userId: { investigationId, userId: principal.userId } },
      select: { role: true },
    });
    if (!member) return { investigationId, readable: false, contribute: false };
    const rank: Record<string, number> = { VIEWER: 1, CONTRIBUTOR: 2, ANALYST: 3, LEAD: 4 };
    const r = rank[member.role] ?? 1;
    return {
      investigationId,
      readable: true,
      contribute: r >= 2,
    };
  }

  private canReadOrgTarget(principal: AuthenticatedPrincipal, targetType: string): boolean {
    const permissionMap: Record<string, string> = {
      EVIDENCE: 'evidence.read',
      ENTITY: 'entity.read',
      REPORT: 'report.read',
      NOTE: 'note.read',
      RELATIONSHIP: 'relationship.read',
      TIMELINE_EVENT: 'investigation.read',
      REPORT_BLOCK: 'report.read',
    };
    const perm = permissionMap[targetType];
    if (!perm) return true;
    return principal.permissions.includes(perm as never);
  }
}
