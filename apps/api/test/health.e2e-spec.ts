import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestingApp, resetDatabase } from './helpers/db';

describe('Health (e2e)', () => {
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

  it('reports ok with database connectivity', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.db).toBe('up');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('is reachable without authentication', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });
});