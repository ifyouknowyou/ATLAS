import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { API_ERROR_CODES } from '@atlas/shared';
import {
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
} from './helpers/db';

/**
 * Multi-tenancy: resources are scoped to the authenticated organization
 * server-side. A user in Org B must not observe or mutate Org A data, even
 * with the same role and valid credentials.
 */
describe('Organization isolation (e2e)', () => {
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

  it('forbids cross-org reads of investigations', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a' });
    const orgB = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'b' });

    const tokenA = await login(app, orgA.email);
    const tokenB = await login(app, orgB.email);

    const created = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Org A secret case' })
      .expect(201);

    const crossOrg = await request(app.getHttpServer())
      .get(`/api/investigations/${created.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
    expect(crossOrg.body.error.code).toBe(API_ERROR_CODES.NOT_FOUND);

    // And B cannot modify A's case either.
    await request(app.getHttpServer())
      .patch(`/api/investigations/${created.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ status: 'COMPLETED' })
      .expect(404);
  });

  it('forbids cross-org entity reads and returns only own entities in lists', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'ea' });
    const orgB = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'eb' });

    const tokenA = await login(app, orgA.email);
    const tokenB = await login(app, orgB.email);

    await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ type: 'DOMAIN', name: 'alpha.example' })
      .expect(201);

    const orgBList = await request(app.getHttpServer())
      .get('/api/entities')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(orgBList.body.total).toBe(0);

    const orgBAll = await request(app.getHttpServer())
      .get('/api/entities?limit=100')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    const names = orgBAll.body.items.map(
      (e: { name: string }) => e.name,
    ) as string[];
    expect(names).not.toContain('alpha.example');
  });

  it('forbids cross-org workspace activation', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'wa' });
    const orgB = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'wb' });

    const tokenB = await login(app, orgB.email);

    const response = await request(app.getHttpServer())
      .post(`/api/workspaces/${orgA.workspaceId}/activate`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
    expect(response.body.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
  });

  it('scopes organization settings to the caller org', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'sa' });
    const orgB = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'sb' });

    const tokenA = await login(app, orgA.email);
    const tokenB = await login(app, orgB.email);

    await request(app.getHttpServer())
      .patch('/api/organizations/me/settings')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Renamed Org A' })
      .expect(200);

    const orgBView = await request(app.getHttpServer())
      .get('/api/organizations/me')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(orgBView.body.name).not.toBe('Renamed Org A');
  });

  it('ensures tenant data is not visible across org member lists', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'ADMIN', suffix: 'ma' });
    const orgB = await createOrgFixture(prisma, { role: 'ADMIN', suffix: 'mb' });

    const tokenA = await login(app, orgA.email);
    const members = await request(app.getHttpServer())
      .get('/api/organizations/me/members')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const emails = members.body.map(
      (m: { user: { email: string } }) => m.user.email,
    ) as string[];
    expect(emails).toContain(orgA.email);
    expect(emails).not.toContain(orgB.email);
  });
});