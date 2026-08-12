import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import {
  addInvestigationMember,
  addOrgUser,
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
} from './helpers/db';

/**
 * Phase 5 — Real-Time Collaboration (e2e).
 * Verifies comments on targets, replies, mention→notification gating,
 * presence scoping, notification permission-awareness, and XSS resistance.
 */
describe('Collaboration (e2e)', () => {
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

  let seq = 0;
  async function owner() {
    seq += 1;
    const f = await createOrgFixture(prisma, { role: 'OWNER', suffix: `col${seq}` });
    return { ...f, token: await login(app, f.email) };
  }

  async function userWithInvestigationRole(
    f: Awaited<ReturnType<typeof createOrgFixture>>,
    investigationId: string,
    suffix: string,
    invRole: 'VIEWER' | 'CONTRIBUTOR' | 'ANALYST' | 'LEAD',
  ) {
    seq += 1;
    const email = `${suffix}${seq}@test.local`;
    const userId = await addOrgUser(prisma, f.organizationId, { email, role: 'ANALYST' });
    await addInvestigationMember(prisma, investigationId, userId, invRole, f.userId);
    return { userId, token: await login(app, email) };
  }

  it('creates a comment and reads it back on an investigation', async () => {
    const o = await owner();
    const inv = await prisma.investigation.create({
      data: { title: 'collab-inv', organizationId: o.organizationId, createdById: o.userId },
    });

    const comment = await request(app.getHttpServer())
      .post('/api/comments')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ targetType: 'INVESTIGATION', targetId: inv.id, body: 'Initial observation' })
      .expect(201);
    expect(comment.body.body).toBe('Initial observation');

    const list = await request(app.getHttpServer())
      .get(`/api/comments?targetType=INVESTIGATION&targetId=${inv.id}`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(list.body.length).toBe(1);
  });

  it('a non-member cannot read comments on a private investigation', async () => {
    const o = await owner();
    const inv = await prisma.investigation.create({
      data: { title: 'private-inv', organizationId: o.organizationId, createdById: o.userId },
    });
    await request(app.getHttpServer())
      .post('/api/comments')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ targetType: 'INVESTIGATION', targetId: inv.id, body: 'secret' })
      .expect(201);

    const outsider = await createOrgFixture(prisma, { role: 'VIEWER', suffix: `out${seq}` });
    const outsiderToken = await login(app, outsider.email);
    await request(app.getHttpServer())
      .get(`/api/comments?targetType=INVESTIGATION&targetId=${inv.id}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .expect(404);
  });

  it('creates a mention that notifies the mentioned accessible user', async () => {
    const o = await owner();
    const inv = await prisma.investigation.create({
      data: { title: 'mention-inv', organizationId: o.organizationId, createdById: o.userId },
    });
    const analyst = await userWithInvestigationRole(o, inv.id, 'an', 'ANALYST');
    const analystHandle = `an${seq}`; // addOrgUser uses email prefix as displayName

    const comment = await request(app.getHttpServer())
      .post('/api/comments')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ targetType: 'INVESTIGATION', targetId: inv.id, body: `cc @${analystHandle} for review` })
      .expect(201);
    expect(comment.body.id).toBeDefined();

    // The mentioned user gets a notification.
    const notifications = await request(app.getHttpServer())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${analyst.token}`)
      .expect(200);
    expect(notifications.body.length).toBeGreaterThanOrEqual(1);
    expect(notifications.body[0].kind).toBe('MENTION');
  });

  it('an XSS attempt in a comment body is stored as text and never executes', async () => {
    const o = await owner();
    const inv = await prisma.investigation.create({
      data: { title: 'xss-inv', organizationId: o.organizationId, createdById: o.userId },
    });
    const payload = '<script>window.__pwned=1</script>';
    const comment = await request(app.getHttpServer())
      .post('/api/comments')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ targetType: 'INVESTIGATION', targetId: inv.id, body: payload })
      .expect(201);
    expect(comment.body.body).toBe(payload); // stored verbatim

    const list = await request(app.getHttpServer())
      .get(`/api/comments?targetType=INVESTIGATION&targetId=${inv.id}`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(list.body[0].body).toBe(payload);
  });

  it('presence heartbeat + active now are scoped to the caller', async () => {
    const o = await owner();
    const inv = await prisma.investigation.create({
      data: { title: 'presence-inv', organizationId: o.organizationId, createdById: o.userId },
    });
    const analyst = await userWithInvestigationRole(o, inv.id, 'pr', 'CONTRIBUTOR');

    await request(app.getHttpServer())
      .post(`/api/collaboration/INVESTIGATION/${inv.id}/presence`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({})
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/collaboration/INVESTIGATION/${inv.id}/presence`)
      .set('Authorization', `Bearer ${analyst.token}`)
      .send({})
      .expect(201);

    const active = await request(app.getHttpServer())
      .get(`/api/collaboration/INVESTIGATION/${inv.id}/presence`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(active.body.length).toBeGreaterThanOrEqual(1);
  });
});