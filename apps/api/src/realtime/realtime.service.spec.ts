import { RealtimeService } from './realtime.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedPrincipal } from '../auth/principal';

const admin: AuthenticatedPrincipal = {
  userId: 'u1',
  organizationId: 'org1',
  workspaceId: null,
  role: 'OWNER',
  permissions: ['investigation.read'],
};

const member: AuthenticatedPrincipal = {
  userId: 'u2',
  organizationId: 'org1',
  workspaceId: null,
  role: 'ANALYST',
  permissions: ['investigation.read'],
};

function makeService(overrides?: { memberships?: Array<{ investigationId: string }> }) {
  const prisma = {
    investigationMember: {
      findMany: jest.fn(async () => overrides?.memberships ?? []),
    },
  } as unknown as PrismaService;
  const service = new RealtimeService(prisma);
  return { service, prisma };
}

describe('RealtimeService', () => {
  it('admins receive org-wide events without investigation filtering', async () => {
    const { service } = makeService();
    const connId = 'c1';
    await service.subscribe(connId, admin);
    const delivered: unknown[] = [];
    const sub = service.open(connId).subscribe((m) => delivered.push(m));

    service.publish('org1', {
      type: 'graph',
      investigationId: 'inv9',
      message: 'created',
    });
    sub.unsubscribe();
    expect(delivered.length).toBeGreaterThan(0);
  });

  it('non-admins only receive events for investigations they belong to', async () => {
    const { service } = makeService({
      memberships: [{ investigationId: 'invA' }],
    });
    const connId = 'c2';
    await service.subscribe(connId, member);
    const delivered: unknown[] = [];
    const sub = service.open(connId).subscribe((m) => delivered.push(m));

    service.publish('org1', { type: 'graph', investigationId: 'invA', message: 'allowed' });
    service.publish('org1', { type: 'graph', investigationId: 'invB', message: 'blocked' });
    sub.unsubscribe();

    const texts = delivered.map((m) => (m as { data: string }).data);
    const allowed = texts.filter((t) => t.includes('allowed'));
    const blocked = texts.filter((t) => t.includes('blocked'));
    expect(allowed.length).toBeGreaterThan(0);
    expect(blocked).toHaveLength(0);
  });

  it('ignores events from other organizations', async () => {
    const { service } = makeService();
    await service.subscribe('c3', admin);
    const delivered: unknown[] = [];
    const sub = service.open('c3').subscribe((m) => delivered.push(m));
    service.publish('org-other', { type: 'graph', message: 'foreign' });
    sub.unsubscribe();
    expect(delivered).toHaveLength(0);
  });

  it('increments per-connection sequence numbers', async () => {
    const { service } = makeService();
    await service.subscribe('c4', admin);
    const delivered: unknown[] = [];
    const sub = service.open('c4').subscribe((m) => delivered.push(m));
    service.publish('org1', { type: 'graph', investigationId: 'invA', message: 'one' });
    service.publish('org1', { type: 'graph', investigationId: 'invA', message: 'two' });
    sub.unsubscribe();
    const ids = delivered
      .map((m) => (m as { id?: string }).id)
      .filter((id): id is string => typeof id === 'string')
      .map(Number)
      .sort((a, b) => a - b);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('removes the connection when the stream closes', async () => {
    const { service } = makeService();
    await service.subscribe('c5', admin);
    const sub = service.open('c5').subscribe();
    sub.unsubscribe();
    service.publish('org1', { type: 'graph', investigationId: 'invA', message: 'after' });
    expect((service as unknown as { connections: Map<string, unknown> }).connections.size).toBe(0);
  });
});