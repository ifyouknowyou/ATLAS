import { NotFoundException } from '@nestjs/common';
import { GraphService } from './graph.service';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { AuthenticatedPrincipal } from '../auth/principal';

const principal: AuthenticatedPrincipal = {
  userId: 'u1',
  organizationId: 'org1',
  workspaceId: null,
  role: 'VIEWER',
  permissions: ['investigation.read'],
};

function makeService(overrides: {
  entities?: unknown[];
  relationships?: unknown[];
  count?: number;
  accessScope?: Record<string, unknown> | undefined;
}) {
  const prisma = {
    entity: {
      findMany: jest.fn(async () => overrides.entities ?? []),
      count: jest.fn(async () => overrides.count ?? 0),
      findFirst: jest.fn(async () => overrides.entities?.[0] ?? null),
    },
    relationship: {
      findMany: jest.fn(async () => overrides.relationships ?? []),
    },
  } as unknown as PrismaService;
  const access = {
    listAccessWhere: jest.fn(
      () => overrides.accessScope ?? { investigation: { members: { some: { userId: 'u1' } } } },
    ),
    requireCapability: jest.fn(async () => undefined),
  } as unknown as InvestigationAccessService;
  const service = new GraphService(prisma, access);
  return { service, prisma, access };
}

describe('GraphService.browse', () => {
  it('returns nodes, edges and meta with counts', async () => {
    const { service } = makeService({
      entities: [
        { id: 'n1', name: 'A', type: 'PERSON', confidence: 50, latitude: null, longitude: null, investigationId: null, tags: [] },
        { id: 'n2', name: 'B', type: 'ORGANIZATION', confidence: 70, latitude: null, longitude: null, investigationId: null, tags: [] },
      ],
      relationships: [
        { id: 'e1', kind: 'RELATED_TO', direction: 'UNDIRECTED', confidence: 80, sourceId: 'n1', targetId: 'n2', investigationId: null },
      ],
      count: 2,
    });
    const result = await service.browse(principal, {
      limit: 300,
      offset: 0,
    } as never);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.meta.totalEntities).toBe(2);
  });

  it('truncates meta when total exceeds the limit', async () => {
    const { service } = makeService({ entities: [], relationships: [], count: 400 });
    const result = await service.browse(principal, { limit: 300, offset: 0 } as never);
    expect(result.meta.truncated).toBe(true);
  });

  it('enforces investigation capability when investigationId is supplied', async () => {
    const { service, access } = makeService({ entities: [], relationships: [], count: 0 });
    await service.browse(principal, {
      investigationId: 'inv1',
      limit: 300,
      offset: 0,
    } as never);
    expect(access.requireCapability).toHaveBeenCalledWith(principal, 'inv1', 'read');
  });
});

describe('GraphService.neighborhood', () => {
  it('expands one hop and reports depth', async () => {
    const { service } = makeService({
      entities: [
        { id: 'n1', name: 'Center', type: 'PERSON', confidence: 50, latitude: null, longitude: null, investigationId: null, tags: [] },
        { id: 'n2', name: 'Neighbor', type: 'ORGANIZATION', confidence: 50, latitude: null, longitude: null, investigationId: null, tags: [] },
      ],
      relationships: [
        { id: 'e1', kind: 'RELATED_TO', direction: 'UNDIRECTED', confidence: 80, sourceId: 'n1', targetId: 'n2', investigationId: null },
      ],
    });
    const result = await service.neighborhood(principal, {
      centerId: 'n1',
      depth: 1,
      limit: 300,
    } as never);
    expect(result.depth).toBe(1);
    expect(result.nodes.map((n) => n.id)).toContain('n1');
  });

  it('throws NotFound when the center is inaccessible', async () => {
    const { service } = makeService({ entities: [], relationships: [], count: 0 });
    const prismaMock = (service as unknown as { prisma: { entity: { findFirst: jest.Mock } } }).prisma;
    prismaMock.entity.findFirst.mockResolvedValue(null);
    await expect(
      service.neighborhood(principal, { centerId: 'n9', depth: 1 } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('GraphService.path', () => {
  it('returns an immediate path when source and target are the same entity', async () => {
    const { service } = makeService({
      entities: [
        { id: 'n1', name: 'A', type: 'PERSON', confidence: 50, latitude: null, longitude: null, investigationId: null, tags: [] },
      ],
      relationships: [],
    });
    // findFirst for source resolves to n1; target never resolves to n2.
    const prismaMock = (service as unknown as { prisma: { entity: { findFirst: jest.Mock } } }).prisma;
    prismaMock.entity.findFirst.mockImplementation(async () => ({
      id: 'n1', name: 'A', type: 'PERSON', confidence: 50, latitude: null, longitude: null, investigationId: null, tags: [],
    }));
    const result = await service.path(principal, {
      sourceId: 'n1',
      targetId: 'n1',
      maxHops: 4,
    } as never);
    expect(result.found).toBe(true);
    expect(result.hops).toBe(0);
  });
});