import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import {
  CreateEntityDto,
  ListEntitiesQueryDto,
  UpdateEntityDto,
} from './dto/entity.dto';

type PrismaEntityWhere = Prisma.EntityWhereInput;

/** Entity reads/writes are scoped to the principal's organization. */
@Injectable()
export class EntitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListEntitiesQueryDto) {
    const { organizationId } = principal;

    if (query.workspaceId) {
      const ok = await this.workspaces.belongsToOrganization(
        organizationId,
        query.workspaceId,
      );
      if (!ok) throw new NotFoundException('Workspace not found');
    }

    const where: PrismaEntityWhere = {
      organizationId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.investigationId ? { investigationId: query.investigationId } : {}),
      ...(query.workspaceId ? { workspaceId: query.workspaceId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { displayName: { contains: query.q, mode: 'insensitive' as const } },
              { summary: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      // Non-admins only see org-level entities + entities in investigations
      // they belong to.
      ...(this.access.listAccessWhere(principal) ?? {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.entity.findMany({
        where,
        select: entityListSelect,
        orderBy: { updatedAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.entity.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async get(principal: AuthenticatedPrincipal, entityId: string) {
    const found = await this.prisma.entity.findFirst({
      where: { id: entityId, organizationId: principal.organizationId },
      include: {
        investigation: { select: { id: true, title: true, status: true } },
        outgoingRelationships: {
          select: {
            id: true,
            kind: true,
            direction: true,
            confidence: true,
            target: { select: { id: true, name: true, type: true } },
          },
        },
        incomingRelationships: {
          select: {
            id: true,
            kind: true,
            direction: true,
            confidence: true,
            source: { select: { id: true, name: true, type: true } },
          },
        },
        notes: {
          select: { id: true, title: true, visibility: true, createdAt: true },
        },
        _count: { select: { notes: true, timelineEvents: true } },
      },
    });
    const entity = requireFound(found, 'Entity');

    if (entity.investigationId) {
      await this.access.requireCapability(
        principal,
        entity.investigationId,
        'read',
      );
    }
    return entity;
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateEntityDto) {
    if (dto.investigationId) {
      await this.access.requireCapability(
        principal,
        dto.investigationId,
        'contribute',
      );
    } else {
      this.access.assertOrgPermission(principal, 'entity.create');
    }

    const workspaceId = dto.workspaceId ?? principal.workspaceId ?? null;
    if (workspaceId) {
      const ok = await this.workspaces.belongsToOrganization(
        principal.organizationId,
        workspaceId,
      );
      if (!ok) throw new NotFoundException('Workspace not found');
    }

    const entity = await this.prisma.entity.create({
      data: {
        type: dto.type,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        summary: dto.summary,
        status: dto.status ?? 'ACTIVE',
        confidence: dto.confidence ?? 0,
        uri: dto.uri,
        tags: dto.tags ?? [],
        properties: this.toJson(dto.properties),
        latitude: dto.latitude,
        longitude: dto.longitude,
        organizationId: principal.organizationId,
        workspaceId,
        investigationId: dto.investigationId ?? null,
        createdById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'ENTITY_CREATED',
      message: `Entity "${entity.name}" created`,
      investigationId: entity.investigationId,
      metadata: { entityId: entity.id },
    });
    return entity;
  }

  async update(
    principal: AuthenticatedPrincipal,
    entityId: string,
    dto: UpdateEntityDto,
  ) {
    const entity = await this.requireEntity(principal, entityId, 'contribute');
    if (!entity.investigationId) {
      this.access.assertOrgPermission(principal, 'entity.update');
    }

    const updated = await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        type: dto.type,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        summary: dto.summary,
        status: dto.status,
        confidence: dto.confidence,
        uri: dto.uri,
        tags: dto.tags,
        // Only touch properties when the field was actually provided.
        properties:
          dto.properties === undefined
            ? undefined
            : this.toJson(dto.properties),
        latitude: dto.latitude,
        longitude: dto.longitude,
        investigationId: dto.investigationId,
      },
    });

    await this.activity.record(principal, {
      type: 'ENTITY_UPDATED',
      message: `Entity "${updated.name}" updated`,
      investigationId: updated.investigationId,
      metadata: { entityId: updated.id },
    });
    return updated;
  }

  async archive(principal: AuthenticatedPrincipal, entityId: string) {
    const entity = await this.requireEntity(principal, entityId, 'contribute');
    if (!entity.investigationId) {
      this.access.assertOrgPermission(principal, 'entity.update');
    }
    await this.prisma.entity.update({
      where: { id: entityId },
      data: { status: 'ARCHIVED' },
    });
    await this.activity.record(principal, {
      type: 'ENTITY_ARCHIVED',
      message: `Entity "${entity.name}" archived`,
      investigationId: entity.investigationId,
      metadata: { entityId },
    });
    return this.get(principal, entityId);
  }

  async restore(principal: AuthenticatedPrincipal, entityId: string) {
    const entity = await this.requireEntity(principal, entityId, 'contribute');
    if (!entity.investigationId) {
      this.access.assertOrgPermission(principal, 'entity.update');
    }
    await this.prisma.entity.update({
      where: { id: entityId },
      data: { status: 'ACTIVE' },
    });
    await this.activity.record(principal, {
      type: 'ENTITY_UPDATED',
      message: `Entity "${entity.name}" restored`,
      investigationId: entity.investigationId,
      metadata: { entityId },
    });
    return this.get(principal, entityId);
  }

  async remove(
    principal: AuthenticatedPrincipal,
    entityId: string,
  ): Promise<void> {
    const entity = await this.requireEntity(principal, entityId, 'contribute');
    if (!entity.investigationId) {
      this.access.assertOrgPermission(principal, 'entity.delete');
    }
    await this.prisma.entity.delete({ where: { id: entityId } });
    await this.activity.record(principal, {
      type: 'ENTITY_UPDATED',
      message: `Entity "${entity.name}" removed`,
      investigationId: entity.investigationId,
      metadata: { entityId },
    });
  }

  /** Org-scoped lookup + investigation-capability gate when linked. */
  private async requireEntity(
    principal: AuthenticatedPrincipal,
    entityId: string,
    capability: 'read' | 'contribute',
  ): Promise<{ id: string; name: string; investigationId: string | null }> {
    const found = await this.prisma.entity.findFirst({
      where: { id: entityId, organizationId: principal.organizationId },
      select: { id: true, name: true, investigationId: true },
    });
    const entity = requireFound(found, 'Entity');
    if (entity.investigationId) {
      await this.access.requireCapability(
        principal,
        entity.investigationId,
        capability,
      );
    }
    return entity;
  }

  /** Converts an optional JSON object into a Prisma Json input. */
  private toJson(
    value: Record<string, unknown> | undefined,
  ): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
    return value === undefined
      ? Prisma.JsonNull
      : (value as Prisma.InputJsonValue);
  }
}

const entityListSelect = {
  id: true,
  type: true,
  name: true,
  displayName: true,
  summary: true,
  status: true,
  confidence: true,
  uri: true,
  tags: true,
  latitude: true,
  longitude: true,
  investigationId: true,
  workspaceId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { notes: true } },
} as const;