import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import { requireFound } from '../common/resources';
import type { Permission } from '@atlas/shared';

export type ReportCapability = 'read' | 'edit' | 'manage';

const CAPABILITY_ORG_PERMISSION: Record<ReportCapability, Permission> = {
  read: 'report.read',
  edit: 'report.update',
  manage: 'report.delete',
};

/**
 * Report authorization (Phase 5 §30–§31, §43).
 *
 * Org-level reports (no investigation) are gated by the org `report.*`
 * permission. Investigation-scoped reports are gated by investigation
 * capability: read→VIEWER, edit→CONTRIBUTOR, manage→LEAD. Publishing,
 * review, and approval additionally require their own permissions and are
 * checked by the review/approval/publish services.
 */
@Injectable()
export class ReportAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly investigation: InvestigationAccessService,
  ) {}

  async requireReport(
    principal: AuthenticatedPrincipal,
    reportId: string,
    capability: ReportCapability,
  ): Promise<{
    id: string;
    title: string;
    status: string;
    classification: string;
    investigationId: string | null;
    aiStatus: string | null;
    currentVersion: number;
  }> {
    const found = await this.prisma.report.findFirst({
      where: { id: reportId, organizationId: principal.organizationId },
      select: {
        id: true,
        title: true,
        status: true,
        classification: true,
        investigationId: true,
        aiStatus: true,
        currentVersion: true,
      },
    });
    const report = requireFound(found, 'Report');

    if (report.investigationId) {
      await this.investigation.requireCapability(
        principal,
        report.investigationId,
        capability === 'edit' ? 'contribute' : capability === 'manage' ? 'manage' : 'read',
      );
    } else {
      this.investigation.assertOrgPermission(
        principal,
        CAPABILITY_ORG_PERMISSION[capability],
      );
    }
    return report;
  }

  /** List-scope where clause (org + investigation membership). */
  listReportsWhere(principal: AuthenticatedPrincipal): Record<string, unknown> {
    const base: Record<string, unknown> = {
      organizationId: principal.organizationId,
    };
    if (principal.role === 'OWNER' || principal.role === 'ADMIN') {
      return base;
    }
    const accessWhere = this.investigation.listAccessWhere(principal) ?? {};
    return { ...base, ...accessWhere };
  }

  /** Scope a create/template-hydrate into an investigation. */
  async requireReportForCreate(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    capability: 'contribute' | 'manage',
  ): Promise<void> {
    await this.investigation.requireCapability(principal, investigationId, capability);
  }

  /** Org-level report creation permission. */
  async requireOrgCreate(principal: AuthenticatedPrincipal): Promise<void> {
    this.investigation.assertOrgPermission(principal, 'report.create');
  }

  /** Org admins can see restricted report content in exports. */
  isElevated(principal: AuthenticatedPrincipal): boolean {
    return principal.role === 'OWNER' || principal.role === 'ADMIN';
  }

  async canApprove(principal: AuthenticatedPrincipal, reportId: string): Promise<boolean> {
    try {
      await this.requireReport(principal, reportId, 'manage');
      return principal.permissions.includes('report.approve');
    } catch {
      return false;
    }
  }

  async canPublish(principal: AuthenticatedPrincipal, reportId: string): Promise<boolean> {
    try {
      await this.requireReport(principal, reportId, 'manage');
      return principal.permissions.includes('report.publish');
    } catch {
      return false;
    }
  }
}
