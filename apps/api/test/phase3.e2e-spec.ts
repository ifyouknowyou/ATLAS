import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { request as httpRequest } from 'node:http';
import request from 'supertest';
import {
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
  addOrgUser,
  addInvestigationMember,
} from './helpers/db';

/**
 * Phase 3 — Graph, Geospatial, Timeline.
 * Verifies the new endpoints AND that the visualization layer can never
 * bypass investigation authorization (§38/§40).
 */
describe('Phase 3 graph & geospatial (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await resetDatabase(prisma);
    app = await createTestingApp();
  });
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('browses an org-wide graph and geo box with valid auth', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'g1' });
    const token = await login(app, org.email);

    const e1 = await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'LOCATION',
        name: 'Atlas HQ',
        latitude: 47.4979,
        longitude: 19.0402,
      })
      .expect(201);
    const e2 = await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'ORGANIZATION',
        name: 'Meridian Ventures',
        latitude: 51.5072,
        longitude: -0.1276,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/relationships')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'LOCATED_AT',
        sourceEntityId: e1.body.id,
        targetEntityId: e2.body.id,
      })
      .expect(201);

    const graph = await request(app.getHttpServer())
      .get('/api/graph')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(graph.body.nodes.length).toBeGreaterThanOrEqual(2);
    expect(graph.body.edges.length).toBeGreaterThanOrEqual(1);

    const box = await request(app.getHttpServer())
      .get(
        '/api/geo/bounding-box?minLat=40&maxLat=60&minLng=-10&maxLng=30',
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(box.body)).toBe(true);

    const locations = await request(app.getHttpServer())
      .get('/api/geo/locations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(locations.body.length).toBeGreaterThanOrEqual(2);

    const arcs = await request(app.getHttpServer())
      .get('/api/geo/arcs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(arcs.body)).toBe(true);

    const timeline = await request(app.getHttpServer())
      .get('/api/timeline')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(typeof timeline.body.total).toBe('number');
  });

  it('returns found:false for an impossible shortest path without 500', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'p1' });
    const token = await login(app, org.email);
    const [a, b] = await Promise.all([
      request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'PERSON', name: 'Alpha' })
        .expect(201),
      request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'PERSON', name: 'Beta' })
        .expect(201),
    ]);
    const res = await request(app.getHttpServer())
      .get(`/api/graph/path?sourceId=${a.body.id}&targetId=${b.body.id}&maxHops=3`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.found).toBe(false);
  });

  it('blocks Viewer access to a non-member investigation graph', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'v1' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Restricted case' })
      .expect(201);
    const viewerId = await addOrgUser(prisma, org.organizationId, {
      email: 'viewer1@test.local',
      role: 'VIEWER',
    });
    const entity = await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        type: 'LOCATION',
        name: 'Secret Site',
        latitude: 10,
        longitude: 20,
        investigationId: inv.body.id,
      })
      .expect(201);

    // Viewer is NOT a member of the investigation: unrestricted endpoints
    // that could leak the restricted entity must not return it.
    const viewerToken = await loginWith(app, viewerId);
    const graph = await request(app.getHttpServer())
      .get('/api/graph')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);
    expect(graph.body.nodes.map((n: { id: string }) => n.id)).not.toContain(entity.body.id);

    const box = await request(app.getHttpServer())
      .get('/api/geo/bounding-box?minLat=0&maxLat=60&minLng=0&maxLng=60')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);
    expect(box.body.map((n: { id: string }) => n.id)).not.toContain(entity.body.id);

    // Investigation-scoped access for a same-org non-member is denied
    // (403, matching the Phase 2 investigation endpoint contract).
    await request(app.getHttpServer())
      .get(`/api/timeline?investigationId=${inv.body.id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/graph?investigationId=${inv.body.id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);

    // The restricted entity itself is unresolvable through neighborhood
    // expansion (treated as not-found — the entity is invisible).
    await request(app.getHttpServer())
      .get(`/api/graph/neighborhood?centerId=${entity.body.id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(404);
  });

  it('returns member-scoped data to an investigation member', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'm1' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Member case' })
      .expect(201);
    const analystId = await addOrgUser(prisma, org.organizationId, {
      email: 'member1@test.local',
      role: 'ANALYST',
    });
    await addInvestigationMember(prisma, inv.body.id, analystId, 'LEAD', org.userId);
    const entity = await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ type: 'DOMAIN', name: 'member.example', investigationId: inv.body.id })
      .expect(201);

    const memberToken = await loginWith(app, analystId);
    const graph = await request(app.getHttpServer())
      .get(`/api/graph?investigationId=${inv.body.id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    expect(graph.body.nodes.map((n: { id: string }) => n.id)).toContain(entity.body.id);

    const neighborhood = await request(app.getHttpServer())
      .get(`/api/graph/neighborhood?centerId=${entity.body.id}&depth=1`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    expect(neighborhood.body.center.id).toBe(entity.body.id);
  });

  it('enforces timeline kind whitelisting', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 't1' });
    const token = await login(app, org.email);
    await request(app.getHttpServer())
      .get('/api/timeline?kind=NOT_A_KIND')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});

// login helper that takes the user id directly (email unknown).
async function loginWith(
  app: INestApplication,
  userId: string,
): Promise<string> {
  // The members are created with emails we control in addOrgUser; resolve it.
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.$disconnect();
  if (!user) throw new Error('user not found');
  return login(app, user.email);
}
describe('Phase 3 realtime SSE (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await resetDatabase(prisma);
    app = await createTestingApp();
    // Listen on a real ephemeral port so the SSE raw-socket test can connect.
    await app.listen(0);
  });
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('refuses a stream without a valid ticket', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'sse1' });
    await login(app, org.email);
    const res = await request(app.getHttpServer())
      .get('/api/realtime/stream?token=invalid')
      .expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('issues a ticket, then opens a valid SSE stream', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'sse2' });
    const token = await login(app, org.email);
    const ticket = await request(app.getHttpServer())
      .post('/api/realtime/ticket')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(201);
    expect(typeof ticket.body.ticket).toBe('string');

    // Open the stream and assert on response headers, then abort (SSE never
    // terminates, so we read the open response and destroy the request).
    await new Promise<void>((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port: (app.getHttpServer().address() as { port: number }).port,
          path: `/api/realtime/stream?token=${encodeURIComponent(ticket.body.ticket)}`,
          method: 'GET',
        },
        (res) => {
          try {
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/event-stream');
          } catch (err) {
            req.destroy();
            reject(err);
            return;
          }
          req.destroy();
          resolve();
        },
      );
      req.on('error', reject);
      req.end();
    });
  });
});
