import { GeoService, haversineKm } from './geo.service';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { AuthenticatedPrincipal } from '../auth/principal';

const principal: AuthenticatedPrincipal = {
  userId: 'u1',
  organizationId: 'org1',
  workspaceId: null,
  role: 'ANALYST',
  permissions: ['entity.read', 'investigation.read'],
};

function makeService(overrides: { entities?: unknown[]; arcs?: unknown[] }) {
  const prisma = {
    entity: {
      findMany: jest.fn(async () => overrides.entities ?? []),
      count: jest.fn(async () => 0),
    },
    relationship: {
      findMany: jest.fn(async () => overrides.arcs ?? []),
    },
  } as unknown as PrismaService;
  const access = {
    listAccessWhere: jest.fn(
      () => ({ investigation: { members: { some: { userId: 'u1' } } } }),
    ),
  } as unknown as InvestigationAccessService;
  const service = new GeoService(prisma, access);
  return { service, prisma, access };
}

describe('haversineKm', () => {
  it('returns ~0 for identical points', () => {
    expect(haversineKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBeLessThan(1e-6);
  });
  it('computes a real-world distance (London → Paris ≈ 343 km)', () => {
    const d = haversineKm({ latitude: 51.5072, longitude: -0.1276 }, { latitude: 48.8566, longitude: 2.3522 });
    expect(d).toBeGreaterThan(330);
    expect(d).toBeLessThan(360);
  });
  it('is symmetric', () => {
    const a = { latitude: 10, longitude: 20 };
    const b = { latitude: -5, longitude: 40 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

describe('GeoService', () => {
  it('inBoundingBox returns rows scoped by organization and box', async () => {
    const { service, prisma } = makeService({
      entities: [{ id: 'n1', latitude: 1, longitude: 2 }],
    });
    const result = await service.inBoundingBox(principal, {
      minLat: 0,
      maxLat: 5,
      minLng: 0,
      maxLng: 5,
      limit: 500,
    } as never);
    expect(result).toHaveLength(1);
    expect(prisma.entity.findMany).toHaveBeenCalled();
  });

  it('inRadius filters the window by haversine distance', async () => {
    const { service } = makeService({
      entities: [
        { id: 'c', latitude: 10, longitude: 10 },
        { id: 'far', latitude: 80, longitude: 10 },
      ],
    });
    const result = await service.inRadius(principal, {
      lat: 10,
      lng: 10,
      radiusKm: 500,
      limit: 100,
    } as never);
    // The far point (~7800 km away) is filtered out; only the center remains.
    expect(result.items.map((i) => i.latitude)).toEqual([10]);
    expect(result.meta.count).toBe(1);
  });

  it('locations returns only geolocated rows', async () => {
    const { service } = makeService({
      entities: [{ id: 'n1', latitude: 1, longitude: 2 }],
    });
    const result = await service.locations(principal, { limit: 500 } as never);
    expect(result).toHaveLength(1);
  });

  it('arcs drops relationships missing either coordinate', async () => {
    const { service } = makeService({
      arcs: [
        {
          kind: 'USES',
          confidence: 80,
          source: { latitude: 1, longitude: 2 },
          target: { latitude: 3, longitude: 4 },
        },
        {
          kind: 'USES',
          confidence: 80,
          source: { latitude: null, longitude: null },
          target: { latitude: 3, longitude: 4 },
        },
      ],
    });
    const result = await service.arcs(principal, { limit: 500 } as never);
    expect(result).toHaveLength(1);
  });
});