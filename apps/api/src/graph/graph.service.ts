import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type {
  GraphEdgePayload,
  GraphNodePayload,
  GraphPayload,
  NeighborhoodPayload,
  PathPayload,
} from '@atlas/shared';
import {
  BrowseGraphQueryDto,
  NeighborhoodQueryDto,
  PathQueryDto,
} from './graph.dto';

/**
 * Graph intelligence (Phase 3).
 *
 * The graph module is a *read* projection over the authoritative
 * Entity/Relationship records — it never duplicates them. Every query is
 * scoped to the principal's organization and, when an investigation is
 * requested, to investigation membership via `InvestigationAccessService`.
 */

type PrismaEntityWhere = Prisma.EntityWhereInput;
type PrismaRelationshipWhere = Prisma.RelationshipWhereInput;

const NODE_SELECT = {
  id: true,
  name: true,
  type: true,
  confidence: true,
  latitude: true,
  longitude: true,
  investigationId: true,
  tags: true,
} as const;

const EDGE_SELECT = {
  id: true,
  kind: true,
  direction: true,
  confidence: true,
  sourceId: true,
  targetId: true,
  investigationId: true,
} as const;

type NodeRow = Prisma.EntityGetPayload<{ select: typeof NODE_SELECT }>;
type EdgeRow = Prisma.RelationshipGetPayload<{ select: typeof EDGE_SELECT }>;

function toNode(row: NodeRow): GraphNodePayload {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    confidence: row.confidence,
    latitude: row.latitude,
    longitude: row.longitude,
    investigationId: row.investigationId,
    tags: row.tags,
  };
}

function toEdge(row: EdgeRow): GraphEdgePayload {
  return {
    id: row.id,
    kind: row.kind,
    direction: row.direction,
    confidence: row.confidence,
    sourceId: row.sourceId,
    targetId: row.targetId,
    investigationId: row.investigationId,
  };
}

/** Hard cap on nodes expanded per BFS frontier (explosion guard, §12/§40). */
const MAX_NEIGHBORS = 150;
/** Hard cap on nodes visited during a path search. */
const MAX_PATH_NODES = 1000;

@Injectable()
export class GraphService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
  ) {}

  private async assertInvestigationRead(
    principal: AuthenticatedPrincipal,
    investigationId?: string,
  ): Promise<void> {
    if (!investigationId) return;
    await this.access.requireCapability(principal, investigationId, 'read');
  }

  private nodeWhere(
    principal: AuthenticatedPrincipal,
    query: BrowseGraphQueryDto,
  ): PrismaEntityWhere {
    return {
      organizationId: principal.organizationId,
      ...(query.investigationId
        ? { investigationId: query.investigationId }
        : {}),
      ...(query.entityType ? { type: query.entityType } : {}),
      ...(query.geoOnly === 'true'
        ? { latitude: { not: null }, longitude: { not: null } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { displayName: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(this.access.listAccessWhere(principal) ?? {}),
    };
  }

  private relationshipWhere(
    principal: AuthenticatedPrincipal,
    investigationId?: string,
    relationshipType?: string,
  ): PrismaRelationshipWhere {
    return {
      organizationId: principal.organizationId,
      ...(investigationId ? { investigationId } : {}),
      ...(relationshipType ? { kind: relationshipType as never } : {}),
      ...(this.access.listAccessWhere(principal) ?? {}),
    };
  }

  /** Load edges whose endpoints lie within the given entity id set. */
  private async edgesBetween(
    principal: AuthenticatedPrincipal,
    entityIds: string[],
    investigationId?: string,
    relationshipType?: string,
  ): Promise<EdgeRow[]> {
    if (entityIds.length === 0) return [];
    const where: PrismaRelationshipWhere = {
      ...this.relationshipWhere(principal, investigationId, relationshipType),
      AND: [
        { sourceId: { in: entityIds } },
        { targetId: { in: entityIds } },
      ],
    };
    const rows = await this.prisma.relationship.findMany({
      where,
      select: EDGE_SELECT,
      take: 1000,
    });
    return rows as EdgeRow[];
  }

  /** Edges touching any of the given entity ids (for BFS expansion). */
  private async edgesTouching(
    principal: AuthenticatedPrincipal,
    entityIds: string[],
  ): Promise<EdgeRow[]> {
    if (entityIds.length === 0) return [];
    const rows = await this.prisma.relationship.findMany({
      where: {
        organizationId: principal.organizationId,
        OR: [
          { sourceId: { in: entityIds } },
          { targetId: { in: entityIds } },
        ],
        ...(this.access.listAccessWhere(principal) ?? {}),
      },
      select: EDGE_SELECT,
      take: 2000,
    });
    return rows as EdgeRow[];
  }

  /** Browse a graph slice (org-wide or investigation-scoped). */
  async browse(
    principal: AuthenticatedPrincipal,
    query: BrowseGraphQueryDto,
  ): Promise<GraphPayload> {
    await this.assertInvestigationRead(principal, query.investigationId);
    const where = this.nodeWhere(principal, query);

    const [entities, totalEntities] = await Promise.all([
      this.prisma.entity.findMany({
        where,
        select: NODE_SELECT,
        orderBy: { updatedAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.entity.count({ where }),
    ]);

    const nodeIds = entities.map((n) => n.id);
    const edges = await this.edgesBetween(
      principal,
      nodeIds,
      query.investigationId,
      query.relationshipType,
    );

    return {
      nodes: entities.map(toNode),
      edges: edges.map(toEdge),
      meta: {
        totalEntities,
        truncated: totalEntities > query.limit,
      },
    };
  }

  /**
   * Neighborhood expansion around a center entity (1 or 2 hops).
   * Explosion guard: at most MAX_NEIGHBORS frontier nodes are expanded;
   * if exceeded, `truncated` is set and the result is bounded.
   */
  async neighborhood(
    principal: AuthenticatedPrincipal,
    query: NeighborhoodQueryDto,
  ): Promise<NeighborhoodPayload> {
    await this.assertInvestigationRead(principal, query.investigationId);

    const center = requireFound(
      await this.prisma.entity.findFirst({
        where: {
          id: query.centerId,
          organizationId: principal.organizationId,
          ...(query.investigationId
            ? { investigationId: query.investigationId }
            : {}),
          // A non-member must never expand a restricted investigation's node.
          ...(this.access.listAccessWhere(principal) ?? {}),
        },
        select: NODE_SELECT,
      }),
      'Entity',
    );

    const depth = query.depth ?? 1;
    const visited = new Set<string>([center.id]);
    const nodes: NodeRow[] = [center];
    let frontier = [center.id];
    let truncated = false;

    for (let hop = 0; hop < depth; hop += 1) {
      const next: string[] = [];
      const edges = await this.edgesTouching(principal, frontier);
      for (const edge of edges) {
        if (visited.size >= MAX_NEIGHBORS) {
          truncated = true;
          break;
        }
        const neighborId =
          edge.sourceId === frontier[0] && visited.has(edge.sourceId)
            ? edge.targetId
            : edge.sourceId;
        if (visited.has(neighborId)) continue;
        // Re-filter discovered neighbors through access (never leak).
        const allowed = await this.prisma.entity.findFirst({
          where: {
            id: neighborId,
            organizationId: principal.organizationId,
            ...(this.access.listAccessWhere(principal) ?? {}),
          },
          select: NODE_SELECT,
        });
        if (!allowed) continue;
        visited.add(neighborId);
        nodes.push(allowed);
        next.push(neighborId);
      }
      frontier = next;
    }

    const edges = await this.edgesBetween(principal, [...visited], query.investigationId);

    return {
      center: toNode(center),
      nodes: nodes.map(toNode),
      edges: edges.map(toEdge),
      depth,
      truncated,
    };
  }

  /**
   * Bounded shortest-path search (BFS) between two entities.
   * A miss returns `found:false` (200) rather than an error.
   */
  async path(
    principal: AuthenticatedPrincipal,
    query: PathQueryDto,
  ): Promise<PathPayload> {
    await this.assertInvestigationRead(principal, query.investigationId);

    const [source, target] = await Promise.all([
      requireFound(
        await this.prisma.entity.findFirst({
          where: {
            id: query.sourceId,
            organizationId: principal.organizationId,
            ...(query.investigationId
              ? { investigationId: query.investigationId }
              : {}),
            ...(this.access.listAccessWhere(principal) ?? {}),
          },
          select: NODE_SELECT,
        }),
        'Entity',
      ),
      requireFound(
        await this.prisma.entity.findFirst({
          where: {
            id: query.targetId,
            organizationId: principal.organizationId,
            ...(query.investigationId
              ? { investigationId: query.investigationId }
              : {}),
            ...(this.access.listAccessWhere(principal) ?? {}),
          },
          select: NODE_SELECT,
        }),
        'Entity',
      ),
    ]);

    if (source.id === target.id) {
      return { nodes: [toNode(source)], edges: [], found: true, hops: 0 };
    }

    const maxHops = query.maxHops ?? 4;
    const parent = new Map<string, string>();
    const visited = new Set<string>([source.id]);
    let frontier = [source.id];
    let found = false;

    outer: for (let hop = 1; hop <= maxHops; hop += 1) {
      if (visited.size >= MAX_PATH_NODES) break;
      const next: string[] = [];
      const edges = await this.edgesTouching(principal, frontier);
      for (const edge of edges) {
        const neighborId =
          edge.sourceId === frontier[0] && visited.has(edge.sourceId)
            ? edge.targetId
            : edge.sourceId;
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        parent.set(neighborId, edge.sourceId === neighborId ? edge.targetId : edge.sourceId);
        if (neighborId === target.id) {
          found = true;
          break outer;
        }
        next.push(neighborId);
      }
      frontier = next;
    }

    if (!found) {
      return { nodes: [], edges: [], found: false, hops: 0 };
    }

    // Reconstruct the node chain source → target.
    const pathIds: string[] = [target.id];
    let cursor = target.id;
    while (cursor !== source.id && parent.has(cursor)) {
      cursor = parent.get(cursor)!;
      pathIds.unshift(cursor);
    }

    const [rows, edges] = await Promise.all([
      this.prisma.entity.findMany({
        where: { id: { in: pathIds }, organizationId: principal.organizationId },
        select: NODE_SELECT,
      }),
      this.edgesBetween(principal, pathIds, query.investigationId),
    ]);

    const byId = new Map(rows.map((r) => [r.id, r]));
    const nodes = pathIds
      .map((id) => byId.get(id))
      .filter((n): n is NodeRow => Boolean(n))
      .map(toNode);

    return {
      nodes,
      edges: edges.map(toEdge),
      found: true,
      hops: pathIds.length - 1,
    };
  }
}
