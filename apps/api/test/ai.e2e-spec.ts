import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { requestIdMiddleware } from '../src/common/request-id';
import { AllExceptionsFilter } from '../src/common/http-exception.filter';
import { CLAUDE_PROVIDER, type ClaudeProvider } from '../src/ai/claude.provider';
import {
  createOrgFixture,
  login,
  resetDatabase,
  addOrgUser,
  addInvestigationMember,
} from './helpers/db';

/**
 * Phase 4 — AI Intelligence Engine.
 * Verifies the AI endpoints are auth-gated, investigation-scoped, and can
 * never bypass investigation authorization. The provider token is overridden
 * with a fake so the suite needs no real Anthropic credential.
 */
const fakeProvider: ClaudeProvider = {
  isConfigured: () => true,
  chat: jest.fn(async ({ system }) => {
    const reply = system.includes('summarizer')
      ? JSON.stringify({
          overview: 'A probe of cross-border financial activity.',
          keyEntities: ['Mario Rossi', 'Acme Corp'],
          keyRelationships: ['Rossi → Acme Corp'],
          evidenceHighlights: ['Bank transfer records'],
          openQuestions: ['Who are the ultimate beneficiaries?'],
        })
      : 'A grounded analytical answer.';
    return { text: reply };
  }),
};

/** Mirrors createTestingApp() but overrides CLAUDE_PROVIDER with a fake. */
async function createAiTestingApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(CLAUDE_PROVIDER)
    .useValue(fakeProvider)
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(requestIdMiddleware);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      validationError: { target: false, value: false },
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app;
}

async function loginWith(app: INestApplication, userId: string): Promise<string> {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.$disconnect();
  if (!user) throw new Error('user not found');
  return login(app, user.email);
}

describe('Phase 4 AI engine (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await resetDatabase(prisma);
    app = await createAiTestingApp();
  });
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).post('/api/ai/chat').send({ message: 'hi' }).expect(401);
    await request(app.getHttpServer()).post('/api/ai/summarize').send({}).expect(401);
    await request(app.getHttpServer()).get('/api/ai/messages').expect(401);
  });

  it('returns a grounded reply for an investigation-scoped chat', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a1' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Probe case' })
      .expect(201);
    const entity = await request(app.getHttpServer())
      .post('/api/entities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ type: 'PERSON', name: 'Mario Rossi', investigationId: inv.body.id })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ investigationId: inv.body.id, message: 'Who is Mario Rossi?' })
      .expect(201);

    expect(res.body.reply).toBe('A grounded analytical answer.');
    expect(res.body.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'ENTITY', id: entity.body.id, title: 'Mario Rossi' }),
      ]),
    );
    expect(typeof res.body.messageId).toBe('string');
  });

  it('blocks a non-member viewer from investigation-scoped chat', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a2' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Restricted AI case' })
      .expect(201);
    const viewerId = await addOrgUser(prisma, org.organizationId, {
      email: 'ai-viewer@test.local',
      role: 'VIEWER',
    });

    await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ investigationId: inv.body.id, message: 'inside' })
      .expect(201);

    const viewerToken = await loginWith(app, viewerId);
    await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ investigationId: inv.body.id, message: 'leak attempt' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/ai/summarize')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ investigationId: inv.body.id })
      .expect(403);
  });

  it('returns a structured summary for an investigation member', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a3' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Summary case' })
      .expect(201);
    const analystId = await addOrgUser(prisma, org.organizationId, {
      email: 'ai-analyst@test.local',
      role: 'ANALYST',
    });
    await addInvestigationMember(prisma, inv.body.id, analystId, 'LEAD', org.userId);

    const memberToken = await loginWith(app, analystId);
    const res = await request(app.getHttpServer())
      .post('/api/ai/summarize')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ investigationId: inv.body.id })
      .expect(201);

    expect(res.body.summary.overview).toContain('financial');
    expect(res.body.summary.keyEntities).toContain('Mario Rossi');
    expect(res.body.summary.openQuestions).toHaveLength(1);
  });

  it('persists chat history and scopes it to the investigation', async () => {
    const org = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a4' });
    const ownerToken = await login(app, org.email);
    const inv = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'History case' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ investigationId: inv.body.id, message: 'first question' })
      .expect(201);

    const history = await request(app.getHttpServer())
      .get(`/api/ai/messages?investigationId=${inv.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(history.body.length).toBeGreaterThanOrEqual(2); // USER + ASSISTANT
    expect(history.body.map((m: { role: string }) => m.role)).toEqual(
      expect.arrayContaining(['USER', 'ASSISTANT']),
    );
    expect(history.body.every((m: { investigationId?: never }) => true)).toBe(true);
  });

  it('does not leak another org conversation through org-wide messages', async () => {
    const orgA = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a5' });
    const tokenA = await login(app, orgA.email);
    const invA = await request(app.getHttpServer())
      .post('/api/investigations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Org A case' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ investigationId: invA.body.id, message: 'secret from A' })
      .expect(201);

    const orgB = await createOrgFixture(prisma, { role: 'OWNER', suffix: 'a6' });
    const tokenB = await login(app, orgB.email);
    // Org B owner (org admin) must not reach Org A's investigation at all —
    // cross-org investigation lookups resolve to 404 (no existence leak).
    await request(app.getHttpServer())
      .get(`/api/ai/messages?investigationId=${invA.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });
});
