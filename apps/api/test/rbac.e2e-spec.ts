import { INestApplication } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { API_ERROR_CODES, permissionsForRole } from '@atlas/shared';
import {
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
} from './helpers/db';

describe('RBAC enforcement (e2e)', () => {
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

  async function authedAs(
    role: Role,
  ): Promise<{ token: string; fixture: Awaited<ReturnType<typeof createOrgFixture>> }> {
    const fixture = await createOrgFixture(prisma, { role });
    const token = await login(app, fixture.email);
    return { token, fixture };
  }

  it('grants investigation.read to every role that lists it', async () => {
    for (const role of ['VIEWER', 'INVESTIGATOR', 'ANALYST', 'ADMIN', 'OWNER'] as Role[]) {
      const { token } = await authedAs(role);
      await request(app.getHttpServer())
        .get('/api/investigations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }
  });

  it('blocks a VIEWER from creating an investigation (403)', async () => {
    const { token } = await authedAs('VIEWER');
    const response = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Denied case' })
      .expect(403);
    expect(response.body.error.code).toBe(API_ERROR_CODES.FORBIDDEN);
  });

  it('allows an ANALYST to create but not delete an investigation', async () => {
    const { token } = await authedAs('ANALYST');
    const created = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Analyst case' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/investigations/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const denied = await request(app.getHttpServer())
      .delete(`/api/investigations/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(denied.body.error.code).toBe(API_ERROR_CODES.FORBIDDEN);
  });

  it('requires members.manage to list organization users', async () => {
    const analyst = await authedAs('ANALYST');
    const admin = await authedAs('ADMIN');

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${analyst.token}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  it('requires workspace.manage to create a workspace', async () => {
    const { token } = await authedAs('VIEWER');
    await request(app.getHttpServer())
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost Workspace' })
      .expect(403);
  });

  it('exposes exactly the asserted permission matrix per role', async () => {
    for (const role of ['VIEWER', 'INVESTIGATOR', 'ANALYST', 'ADMIN', 'OWNER'] as Role[]) {
      const { token } = await authedAs(role);
      const { body } = await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect([...body.session.permissions].sort()).toEqual(
        [...permissionsForRole(role)].sort(),
      );
    }
  });
});