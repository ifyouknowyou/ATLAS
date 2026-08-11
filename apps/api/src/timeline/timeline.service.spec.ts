import { NotFoundException } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { AuthenticatedPrincipal } from '../auth/principal';

const principal: AuthenticatedPrincipal = {
  userId: 'u1',
  organizationId: 'org1',
  workspaceId: null,
  role: 'ANALYST',
  permissions: ['investigation.read', 'entity.read'],
};

function makeService(overrides: {
  rows?: unknown[];
  total?: number;
  entity?: unknown;
}) {
  const prisma = {
    timelineEvent: {
      findMany: jest.fn(async () => overrides.rows ?? []),
      count: jest.fn(async () => overrides.total ?? 0),
    },
    entity: {
      findFirst: jest.fn(async () => overrides.entity ?? null),
    },
  } as unknown as PrismaService;
  const access = {
    listAccessWhere: jest.fn(
      () => ({ investigation: { members: { some: { userId: 'u1' } } } }),
    ),
    requireCapability: jest.fn(async () => undefined),
  } as unknown as InvestigationAccessService;
  const service = new TimelineService(prisma, access);
  return { service, prisma, access };
}

describe('TimelineService.list', () => {
  it('returns mapped items with createdBy display name', async () => {
    const { service } = makeService({
      rows: [
        {
          id: 't1',
          title: 'Sighting',
          description: 'desc',
          kind: 'ENTITY',
          occurredAt: new Date('2026-07-01T00:00:00Z'),
          investigationId: null,
          entityId: 'n1',
          createdById: 'u1',
          createdBy: { displayName: 'Analyst One' },
        },
      ],
      total: 1,
    });
    const result = await service.list(principal, { limit: 50, offset: 0 } as never);
    expect(result.items[0]).toMatchObject({
      id: 't1',
      kind: 'ENTITY',
      createdByDisplayName: 'Analyst One',
    });
    expect(result.total).toBe(1);
  });

  it('enforces capability when investigationId is supplied', async () => {
    const { service, access } = makeService({ rows: [], total: 0 });
    await service.list(principal, {
      investigationId: 'inv1',
      limit: 50,
      offset: 0,
    } as never);
    expect(access.requireCapability).toHaveBeenCalledWith(principal, 'inv1', 'read');
  });

  it('throws when an entity-scoped query cannot resolve the entity', async () => {
    const { service } = makeService({ rows: [], total: 0, entity: null });
    await expect(
      service.list(principal, { entityId: 'n9', limit: 50, offset: 0 } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});