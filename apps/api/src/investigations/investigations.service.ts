import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvestigationMemberRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from './investigation-access.service';
import {
  CreateInvestigationDto,
  ListInvestigationsQueryDto,
  UpdateInvestigationDto,
} from './dto/investigation.dto';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/member.dto';

type PrismaInvestigationWhere = Prisma.InvestigationWhereInput;

/** Investigation reads/writes are scoped to the principal's organization. */
@Injectable()
export class InvestigationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListInvestigationsQueryDto) {
    const { organizationId } = principal;

    if (query.workspaceId) {
      const ok = await this.workspaces.belongsToOrganization(
        organizationId,
        query.workspaceId,
      );
      if (!ok) throw new NotFoundException('Workspace not found');
    }

    const where: PrismaInvestigationWhere = {
      organizationId,
      ...(query.workspaceId ? { workspaceId: query.workspaceId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.classification ? { classification: query.classification } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      // Archived records are hidden unless explicitly requested.
      ...(query.archived
        ? { archivedAt: { not: null } }
        : { archivedAt: null }),
      ...(query.q
        ? { title: { contains: query.q, mode: 'insensitive' as const } }
        : {}),
      // Non-admins only see investigations they are members of.
      ...(this.access.investigationListWhere(principal) ?? {}),
    };

    const orderBy = this.sortForList(query.sortBy, query.order);
    const [items, total] = await Promise.all([
      this.prisma.investigation.findMany({
        where,
        select: investigationListSelect,
        orderBy,
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.investigation.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async get(principal: AuthenticatedPrincipal, investigationId: string) {
    const access = await this.access.requireCapability(
      principal,
      investigationId,
      'read',
    );

    const found = await this.prisma.investigation.findFirst({
      where: {
        id: investigationId,
        organizationId: principal.organizationId,
      },
      include: {
        workspace: { select: { id: true, name: true } },
        owner: { select: { id: true, displayName: true } },
        members: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, displayName: true, email: true } },
          },
        },
        _count: {
          select: {
            entities: true,
            relationships: true,
            evidence: true,
            notes: true,
            reports: true,
            timelineEvents: true,
            tasks: true,
            members: true,
          },
        },
      },
    });
    const investigation = requireFound(found, 'Investigation');
    // Expose the caller's effective role so the UI can affordance correctly
    // (the server remains the enforcement point).
    return { ...investigation, myRole: access.admin ? 'ORG_ADMIN' : (access.role ?? 'VIEWER') };
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateInvestigationDto) {
    const workspaceId = dto.workspaceId ?? principal.workspaceId ?? null;
    if (workspaceId) {
      const ok = await this.workspaces.belongsToOrganization(
        principal.organizationId,
        workspaceId,
      );
      if (!ok) throw new NotFoundException('Workspace not found');
    }

    if (dto.ownerId) {
      await this.assertOrgUser(principal, dto.ownerId);
    }

    const investigation = await this.prisma.investigation.create({
      data: {
        title: dto.title,
        description: dto.description,
        summary: dto.summary,
        status: dto.status ?? 'DRAFT',
        priority: dto.priority ?? 'MEDIUM',
        classification: dto.classification ?? 'INTERNAL',
        organizationId: principal.organizationId,
        workspaceId,
        ownerId: dto.ownerId ?? principal.userId,
        createdById: principal.userId,
      },
    });

    // The creator (or owner) joins as LEAD automatically.
    const memberUserId = dto.ownerId ?? principal.userId;
    await this.prisma.investigationMember.upsert({
      where: {
        investigationId_userId: {
          investigationId: investigation.id,
          userId: memberUserId,
        },
      },
      update: {},
      create: {
        investigationId: investigation.id,
        userId: memberUserId,
        role: 'LEAD',
        createdById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'INVESTIGATION_CREATED',
      message: `Investigation "${investigation.title}" created`,
      investigationId: investigation.id,
      workspaceId,
    });
    return investigation;
  }

  async update(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    dto: UpdateInvestigationDto,
  ) {
    const access = await this.access.requireCapability(
      principal,
      investigationId,
      'manage',
    );

    // Archived investigations are frozen except through archive/restore.
    const current = await this.prisma.investigation.findFirst({
      where: { id: investigationId, organizationId: principal.organizationId },
      select: { archivedAt: true },
    });
    if (current?.archivedAt) {
      throw new ForbiddenException(
        'Archived investigations cannot be modified; restore them first',
      );
    }

    if (dto.ownerId) {
      await this.assertOrgUser(principal, dto.ownerId);
    }
    if (dto.workspaceId) {
      const ok = await this.workspaces.belongsToOrganization(
        principal.organizationId,
        dto.workspaceId,
      );
      if (!ok) throw new NotFoundException('Workspace not found');
    }

    const investigation = await this.prisma.investigation.update({
      where: { id: investigationId },
      data: {
        ...dto,
        updatedById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'INVESTIGATION_UPDATED',
      message: `Investigation "${investigation.title}" updated`,
      investigationId,
      metadata: { status: dto.status },
    });
    return investigation;
  }

  async archive(principal: AuthenticatedPrincipal, investigationId: string) {
    await this.access.requireCapability(principal, investigationId, 'manage');
    const investigation = await this.prisma.investigation.update({
      where: { id: investigationId },
      data: { status: 'ARCHIVED', archivedAt: new Date(), updatedById: principal.userId },
    });
    await this.activity.record(principal, {
      type: 'INVESTIGATION_ARCHIVED',
      message: `Investigation "${investigation.title}" archived`,
      investigationId,
    });
    return this.get(principal, investigationId);
  }

  async restore(principal: AuthenticatedPrincipal, investigationId: string) {
    await this.access.requireCapability(principal, investigationId, 'manage');
    const investigation = await this.prisma.investigation.update({
      where: { id: investigationId },
      data: { status: 'ACTIVE', archivedAt: null, updatedById: principal.userId },
    });
    await this.activity.record(principal, {
      type: 'INVESTIGATION_UPDATED',
      message: `Investigation "${investigation.title}" restored`,
      investigationId,
    });
    return this.get(principal, investigationId);
  }

  /** Removal is org-level: only OWNER/ADMIN holders of investigation.delete. */
  async remove(principal: AuthenticatedPrincipal, investigationId: string): Promise<void> {
    const found = await this.prisma.investigation.findFirst({
      where: { id: investigationId, organizationId: principal.organizationId },
      select: { id: true, title: true, organizationId: true },
    });
    const investigation = requireFound(found, 'Investigation');
    await this.activity.record(principal, {
      type: 'INVESTIGATION_UPDATED',
      message: `Investigation "${investigation.title}" deleted`,
      investigationId,
    });
    await this.prisma.investigation.delete({ where: { id: investigationId } });
  }

  // ---------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------

  async dashboard(principal: AuthenticatedPrincipal, investigationId: string) {
    const access = await this.access.requireCapability(
      principal,
      investigationId,
      'read',
    );

    const [counts, recentActivity, nodes, edges] = await Promise.all([
      this.prisma.investigation.findFirst({
        where: { id: investigationId, organizationId: principal.organizationId },
        select: {
          _count: {
            select: {
              entities: true,
              relationships: true,
              evidence: true,
              notes: true,
              tasks: true,
              members: true,
              timelineEvents: true,
            },
          },
        },
      }),
      this.prisma.activityEvent.findMany({
        where: { investigationId, organizationId: principal.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
          user: { select: { displayName: true } },
        },
      }),
      this.prisma.entity.findMany({
        where: { investigationId, organizationId: principal.organizationId },
        select: { id: true, name: true, type: true, confidence: true, latitude: true, longitude: true },
        take: 200,
      }),
      this.prisma.relationship.findMany({
        where: { investigationId, organizationId: principal.organizationId },
        select: { id: true, kind: true, sourceId: true, targetId: true, confidence: true },
        take: 300,
      }),
    ]);

    return {
      counts: counts?._count,
      recentActivity,
      graph: { nodes, edges },
    };
  }

  // ---------------------------------------------------------------------
  // Members
  // ---------------------------------------------------------------------

  listMembers(principal: AuthenticatedPrincipal, investigationId: string) {
    return this.access.requireCapability(principal, investigationId, 'read').then(
      () =>
        this.prisma.investigationMember.findMany({
          where: { investigationId },
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: { select: { id: true, displayName: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        }),
    );
  }

  async addMember(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    dto: AddMemberDto,
  ) {
    const access = await this.access.requireCapability(
      principal,
      investigationId,
      'manage',
    );
    const investigation = access.investigation;

    const orgUser = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: dto.userId,
          organizationId: investigation.organizationId,
        },
      },
      select: { userId: true },
    });
    if (!orgUser) {
      throw new BadRequestException(
        'User must belong to the parent organization first',
      );
    }

    const member = await this.prisma.investigationMember
      .create({
        data: {
          investigationId,
          userId: dto.userId,
          role: dto.role,
          createdById: principal.userId,
        },
        include: { user: { select: { displayName: true } } },
      })
      .catch((error: unknown) => {
        if (isUniqueViolation(error)) {
          throw new ConflictException('User is already an investigation member');
        }
        throw error;
      });

    await this.activity.record(principal, {
      type: 'MEMBER_ADDED',
      message: `${member.user.displayName} added as ${member.role}`,
      investigationId,
    });
    return member;
  }

  async updateMemberRole(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    memberUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.access.requireCapability(principal, investigationId, 'manage');

    const updated = await this.prisma.investigationMember.update({
      where: {
        investigationId_userId: {
          investigationId,
          userId: memberUserId,
        },
      },
      data: { role: dto.role },
      include: { user: { select: { displayName: true } } },
    });

    await this.activity.record(principal, {
      type: 'MEMBER_ROLE_CHANGED',
      message: `${updated.user.displayName} role changed to ${updated.role}`,
      investigationId,
    });
    return updated;
  }

  async removeMember(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    memberUserId: string,
  ): Promise<void> {
    await this.access.requireCapability(principal, investigationId, 'manage');

    // Never orphan an investigation without a LEAD.
    if (memberUserId === principal.userId) {
      const leadCount = await this.prisma.investigationMember.count({
        where: { investigationId, role: 'LEAD' },
      });
      if (leadCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last LEAD from an investigation',
        );
      }
    }

    const removed = await this.prisma.investigationMember.delete({
      where: {
        investigationId_userId: { investigationId, userId: memberUserId },
      },
      include: { user: { select: { displayName: true } } },
    });

    await this.activity.record(principal, {
      type: 'MEMBER_REMOVED',
      message: `${removed.user.displayName} removed from investigation`,
      investigationId,
    });
  }

  // ---------------------------------------------------------------------
  // Activity
  // ---------------------------------------------------------------------

  listActivity(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    page: PageQueryDto,
  ) {
    return this.access.requireCapability(principal, investigationId, 'read').then(
      async (access) => {
        const where = {
          investigationId,
          organizationId: access.investigation.organizationId,
        };
        const [items, total] = await Promise.all([
          this.prisma.activityEvent.findMany({
            where,
            select: {
              id: true,
              type: true,
              message: true,
              metadata: true,
              createdAt: true,
              user: { select: { displayName: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: page.offset,
            take: page.limit,
          }),
          this.prisma.activityEvent.count({ where }),
        ]);
        return toPage(items, total, page);
      },
    );
  }

  // ---------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------

  private async assertOrgUser(
    principal: AuthenticatedPrincipal,
    userId: string,
  ): Promise<void> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: principal.organizationId,
        },
      },
      select: { userId: true },
    });
    if (!membership) {
      throw new BadRequestException(
        'User does not belong to your organization',
      );
    }
  }

  private sortForList(
    sortBy?: string,
    order?: 'asc' | 'desc',
  ): { [key: string]: 'asc' | 'desc' } {
    const direction = order === 'asc' ? 'asc' : 'desc';
    switch (sortBy) {
      case 'title':
        return { title: direction };
      case 'createdAt':
        return { createdAt: direction };
      case 'updatedAt':
      default:
        return { updatedAt: direction };
    }
  }
}

const investigationListSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  classification: true,
  ownerId: true,
  archivedAt: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      entities: true,
      evidence: true,
      tasks: true,
      members: true,
    },
  },
} as const;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}