import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import {
  CreateRelationshipDto,
  ListRelationshipsQueryDto,
  UpdateRelationshipDto,
} from './dto/relationship.dto';

/**
 * Relationship intelligence. Enforces, server-side:
 *  - both endpoints belong to the caller's organization (cross-tenant → 404)
 *  - no self-relationships
 *  - endpoints in matching investigations (no cross-investigation links)
 */
@Injectable()
export class RelationshipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(
    principal: AuthenticatedPrincipal,
    query: ListRelationshipsQueryDto,
  ) {
    const { organizationId } = principal;
    const where = {
      organizationId,
      ...(query.investigationId ? { investigationId: query.investigationId } : {}),
      ...(query.type ? { kind: query.type } : {}),
      ...(query.entityId
        ? { OR: [{ sourceId: query.entityId }, { targetId: query.entityId }] }
        : {}),
      ...(query.q
        ? { description: { contains: query.q, mode: 'insensitive' as const } }
        : {}),
      // Non-admins see org-level + investigation-scoped links they can access.
      ...(this.access.listAccessWhere(principal) ?? {}),
    };

    const select = {
      id: true,
      kind: true,
      direction: true,
      confidence: true,
      description: true,
      investigationId: true,
      createdAt: true,
      updatedAt: true,
      source: { select: { id: true, name: true, type: true } },
      target: { select: { id: true, name: true, type: true } },
    } as const;

    const [items, total] = await Promise.all([
      this.prisma.relationship.findMany({
        where,
        select,
        orderBy: { updatedAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.relationship.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async get(principal: AuthenticatedPrincipal, relationshipId: string) {
    const found = await this.prisma.relationship.findFirst({
      where: { id: relationshipId, organizationId: principal.organizationId },
      include: {
        source: { select: { id: true, name: true, type: true } },
        target: { select: { id: true, name: true, type: true } },
      },
    });
    const relationship = requireFound(found, 'Relationship');
    if (relationship.investigationId) {
      await this.access.requireCapability(principal, relationship.investigationId, 'read');
    }
    return relationship;
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateRelationshipDto) {
    const endpoints = await this.loadEndpoints(principal, dto);

    // No self-relationships (unless a later phase explicitly permits them).
    if (endpoints.source.id === endpoints.target.id) {
      throw new BadRequestException('A relationship cannot link an entity to itself');
    }

    const investigationId = this.resolveInvestigation(dto, endpoints);

    await this.assertInvestigationAccess(principal, investigationId);

    const relationship = await this.prisma.relationship.create({
      data: {
        kind: dto.type,
        direction: dto.direction ?? 'UNDIRECTED',
        confidence: dto.confidence ?? 0,
        description: dto.description,
        organizationId: principal.organizationId,
        investigationId,
        sourceId: endpoints.source.id,
        targetId: endpoints.target.id,
        createdById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'RELATIONSHIP_CREATED',
      message: `Relationship ${dto.type} created: ${endpoints.source.name} → ${endpoints.target.name}`,
      investigationId,
    });
    return relationship;
  }

  async update(
    principal: AuthenticatedPrincipal,
    relationshipId: string,
    dto: UpdateRelationshipDto,
  ) {
    const relationship = await this.requireRelationship(
      principal,
      relationshipId,
      'contribute',
    );
    const updated = await this.prisma.relationship.update({
      where: { id: relationshipId },
      data: {
        kind: dto.type,
        direction: dto.direction,
        confidence: dto.confidence,
        description: dto.description,
      },
    });
    await this.activity.record(principal, {
      type: 'RELATIONSHIP_UPDATED',
      message: 'Relationship updated',
      investigationId: relationship.investigationId,
    });
    return updated;
  }

  async remove(
    principal: AuthenticatedPrincipal,
    relationshipId: string,
  ): Promise<void> {
    const relationship = await this.requireRelationship(
      principal,
      relationshipId,
      'contribute',
    );
    await this.prisma.relationship.delete({ where: { id: relationshipId } });
    await this.activity.record(principal, {
      type: 'RELATIONSHIP_REMOVED',
      message: 'Relationship removed',
      investigationId: relationship.investigationId,
    });
  }

  // ------------------------------------------------------------------

  private async loadEndpoints(
    principal: AuthenticatedPrincipal,
    dto: CreateRelationshipDto,
  ): Promise<{
    source: { id: string; name: string; investigationId: string | null };
    target: { id: string; name: string; investigationId: string | null };
  }> {
    const [sourceFound, targetFound] = await Promise.all([
      this.prisma.entity.findFirst({
        where: { id: dto.sourceEntityId, organizationId: principal.organizationId },
        select: { id: true, name: true, investigationId: true },
      }),
      this.prisma.entity.findFirst({
        where: { id: dto.targetEntityId, organizationId: principal.organizationId },
        select: { id: true, name: true, investigationId: true },
      }),
    ]);
    const source = requireFound(sourceFound, 'Source entity');
    const target = requireFound(targetFound, 'Target entity');

    if (source.investigationId !== target.investigationId) {
      throw new BadRequestException(
        'Relationship endpoints must belong to the same investigation',
      );
    }
    return { source, target };
  }

  private resolveInvestigation(
    dto: CreateRelationshipDto,
    endpoints: { source: { investigationId: string | null }; target: { investigationId: string | null } },
  ): string | null {
    const entityInv = endpoints.source.investigationId; // equals target's
    if (entityInv) {
      if (dto.investigationId && dto.investigationId !== entityInv) {
        throw new BadRequestException(
          'Relationship investigation does not match its entities',
        );
      }
      return entityInv;
    }
    // Both endpoints are org-level.
    if (dto.investigationId) {
      throw new BadRequestException(
        'Cannot link org-level entities to an investigation',
      );
    }
    return null;
  }

  private async assertInvestigationAccess(
    principal: AuthenticatedPrincipal,
    investigationId: string | null,
  ): Promise<void> {
    if (investigationId) {
      await this.access.requireCapability(principal, investigationId, 'contribute');
    } else {
      this.access.assertOrgPermission(principal, 'entity.create');
    }
  }

  private async requireRelationship(
    principal: AuthenticatedPrincipal,
    relationshipId: string,
    capability: 'read' | 'contribute',
  ): Promise<{ id: string; investigationId: string | null }> {
const found = await this.prisma.relationship.findFirst({
      where: { id: relationshipId, organizationId: principal.organizationId },
      select: { id: true, investigationId: true },
    });
    const relationship = requireFound(found, 'Relationship');
    if (relationship.investigationId) {
      await this.access.requireCapability(
        principal,
        relationship.investigationId,
        capability,
      );
    } else {
      this.access.assertOrgPermission(principal, 'entity.update');
    }
    return relationship;
  }
}