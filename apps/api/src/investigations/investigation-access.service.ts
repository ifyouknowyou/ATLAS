import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InvestigationMemberRole } from '@prisma/client';
import type { Permission } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { requireFound } from '../common/resources';

/**
 * Investigation-level authorization (Phase 2).
 *
 * Access to an investigation is governed by the caller's organization role
 * (OWNER/ADMIN have full access) OR their investigation membership:
 *
 *   VIEWER       read
 *   CONTRIBUTOR  read + create/update content
 *   ANALYST      content + broader investigation operations
 *   LEAD         management (update, archive, members)
 *
 * All checks run server-side; probe-style routes return 404 for resources the
 * caller cannot even see (no existence leaks).
 */

const RANK: Record<InvestigationMemberRole, number> = {
  VIEWER: 1,
  CONTRIBUTOR: 2,
  ANALYST: 3,
  LEAD: 4,
};

export type MemberCapability = 'read' | 'contribute' | 'manage';

const CAPABILITY_MIN_RANK: Record<MemberCapability, number> = {
  read: RANK.VIEWER,
  contribute: RANK.CONTRIBUTOR,
  manage: RANK.LEAD,
};

export interface InvestigationAccess {
  investigation: { id: string; organizationId: string };
  /** Detected org-level administrative access. */
  admin: boolean;
  /** Investigation role if the caller is a member (else null). */
  role: InvestigationMemberRole | null;
}

@Injectable()
export class InvestigationAccessService {
  constructor(private readonly prisma: PrismaService) {}

  private isOrgAdmin(principal: AuthenticatedPrincipal): boolean {
    return principal.role === 'OWNER' || principal.role === 'ADMIN';
  }

  /** Gates an org-level (investigation-independent) mutation. */
  assertOrgPermission(
    principal: AuthenticatedPrincipal,
    permission: Permission,
  ): void {
    if (!principal.permissions.includes(permission)) {
      throw new ForbiddenException(
        `Missing organization permission: ${permission}`,
      );
    }
  }

  /**
   * Resolves access to an investigation, throwing 404 (missing) or 403
   * (not authorized) as appropriate. Never returns a membership leak.
   */
  async resolve(
    principal: AuthenticatedPrincipal,
    investigationId: string,
  ): Promise<InvestigationAccess> {
    const found = await this.prisma.investigation.findFirst({
      where: { id: investigationId, organizationId: principal.organizationId },
      select: { id: true, organizationId: true },
    });
    const investigation = requireFound(found, 'Investigation');

    if (this.isOrgAdmin(principal)) {
      return { investigation, admin: true, role: null };
    }

    const member = await this.prisma.investigationMember.findUnique({
      where: {
        investigationId_userId: {
          investigationId,
          userId: principal.userId,
        },
      },
      select: { id: true, role: true },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this investigation');
    }
    return { investigation, admin: false, role: member.role };
  }

  async requireCapability(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    capability: MemberCapability,
  ): Promise<InvestigationAccess> {
    const access = await this.resolve(principal, investigationId);
    if (access.admin) return access;
    if (access.role === null) {
      throw new ForbiddenException('Not authorized for this investigation');
    }
    const granted = RANK[access.role];
    if (granted < CAPABILITY_MIN_RANK[capability]) {
      throw new ForbiddenException(
        `Requires investigation role ${minimumRole(capability)}`,
      );
    }
    return access;
  }

  /**
   * Prisma `where` fragment for listing resources that reference an optional
   * investigation (entities, evidence, notes, relationships, tasks...):
   * org admins see everything; others see org-level records plus records in
   * investigations they belong to.
   */
  listAccessWhere(principal: AuthenticatedPrincipal) {
    if (this.isOrgAdmin(principal)) {
      return undefined;
    }
    return {
      OR: [
        { investigationId: null },
        {
          investigation: {
            members: { some: { userId: principal.userId } },
          },
        },
      ],
    };
  }

  /** List-scoping where for investigations themselves. */
  investigationListWhere(principal: AuthenticatedPrincipal) {
    if (this.isOrgAdmin(principal)) {
      return undefined;
    }
    return { members: { some: { userId: principal.userId } } };
  }
}

function minimumRole(capability: MemberCapability): string {
  const role: InvestigationMemberRole =
    capability === 'manage' ? 'LEAD' : capability === 'contribute' ? 'CONTRIBUTOR' : 'VIEWER';
  return role;
}

export function capabilityRank(role: InvestigationMemberRole): number {
  return RANK[role];
}