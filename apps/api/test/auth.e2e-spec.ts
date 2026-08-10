import { INestApplication } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { API_ERROR_CODES, PERMISSIONS } from '@atlas/shared';
import {
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
  TEST_PASSWORD,
} from './helpers/db';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let fixture: Awaited<ReturnType<typeof createOrgFixture>>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await resetDatabase(prisma);
    app = await createTestingApp();
    fixture = await createOrgFixture(prisma, { role: 'OWNER' });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('logs in and returns a permission-ful principal', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: fixture.email, password: TEST_PASSWORD })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.session.organizationId).toBe(fixture.organizationId);
    expect(response.body.session.role).toBe('OWNER');
    expect(response.body.session.permissions).toEqual([...PERMISSIONS]);
  });

  it('rejects invalid credentials with the API error contract', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: fixture.email, password: 'definitely-wrong' })
      .expect(401);

    expect(response.body.error.code).toBe(API_ERROR_CODES.INVALID_CREDENTIALS);
    expect(typeof response.body.error.requestId).toBe('string');
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('rejects malformed login body with VALIDATION_FAILED (no email)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ password: TEST_PASSWORD })
      .expect(400);

    expect(response.body.error.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);
    expect(Array.isArray(response.body.error.details)).toBe(true);
  });

  it('blocks protected routes without a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/investigations')
      .expect(401);
    expect(response.body.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
  });

  it('resolves a fresh session for a valid token', async () => {
    const token = await login(app, fixture.email);
    const response = await request(app.getHttpServer())
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.session.userId).toBe(fixture.userId);
    expect(response.body.session.role).toBe('OWNER');
  });

  it('logs out and immediately invalidates the session', async () => {
    const token = await login(app, fixture.email);
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const after = await request(app.getHttpServer())
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(after.body.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
  });

  it('treats each role as a viable login principal', async () => {
    const roles: Role[] = ['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'];
    for (const role of roles) {
      const f = await createOrgFixture(prisma, { role });
      await login(app, f.email); // throws on failure
    }
  });
});