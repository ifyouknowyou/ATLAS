import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import {
  addOrgUser,
  addInvestigationMember,
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
} from './helpers/db';

/**
 * Phase 5 — Reports (e2e).
 * Verifies CRUD, sections/blocks, versions, review/approval/publish workflow,
 * publishing protection (quality gate, AI gate, permissions), and export.
 */
describe('Reports (e2e)', () => {
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
    const f = await createOrgFixture(prisma, { role: 'OWNER', suffix: `rep${seq}` });
    return { ...f, token: await login(app, f.email) };
  }

  async function memberOf(
    f: Awaited<ReturnType<typeof createOrgFixture>>,
    investigationId: string,
    role: 'VIEWER' | 'CONTRIBUTOR' | 'ANALYST' | 'LEAD',
  ) {
    seq += 1;
    const email = `${role.toLowerCase()}${seq}-repmem@test.local`;
    const userId = await addOrgUser(prisma, f.organizationId, { email, role: 'ANALYST' });
    await addInvestigationMember(prisma, investigationId, userId, role, f.userId);
    return { userId, token: await login(app, email) };
  }

  async function withInvestigation(f: Awaited<ReturnType<typeof createOrgFixture>>) {
    return prisma.investigation.create({
      data: { title: 'rep-inv', organizationId: f.organizationId, createdById: f.userId },
    });
  }

  it('creates a report from a template and lists it', async () => {
    const o = await owner();
    const templates = await request(app.getHttpServer())
      .get('/api/reports/templates')
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    const invTemplate = templates.body.find((t: { kind: string }) => t.kind === 'INVESTIGATION_REPORT');
    expect(invTemplate).toBeDefined();

    const created = await request(app.getHttpServer())
      .post('/api/reports/from-template')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'Alpha Report', templateId: invTemplate.id })
      .expect(201);

    expect(created.body.sections.length).toBeGreaterThan(0);

    const list = await request(app.getHttpServer())
      .get('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('adds a block to a section and bumps the report version', async () => {
    const o = await owner();
    const inv = await withInvestigation(o);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'Block Report', investigationId: inv.id })
      .expect(201);

    const section = await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ key: 'findings', title: 'Findings', isRequired: true })
      .expect(201);

    const block = await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections/${section.body.id}/blocks`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ type: 'TEXT', content: { text: 'Key finding' } })
      .expect(201);
    expect(block.body.type).toBe('TEXT');

    const detail = await request(app.getHttpServer())
      .get(`/api/reports/${report.body.id}`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(detail.body.currentVersion).toBeGreaterThan(0);
    expect(detail.body.sections[0].blocks.length).toBe(1);
  });

  it('runs the full review → approve → publish workflow', async () => {
    const o = await owner();
    const inv = await withInvestigation(o);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'Workflow Report', investigationId: inv.id })
      .expect(201);

    // Give the report content so the quality gate passes on publish.
    const section = await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ key: 'findings', title: 'Findings', isRequired: true })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections/${section.body.id}/blocks`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ type: 'TEXT', content: { text: 'A finding' } })
      .expect(201);

    // Reviewer (ANALYST) can review; a plain CONTRIBUTOR cannot approve.
    const reviewer = await memberOf(o, inv.id, 'ANALYST');
    const contributor = await memberOf(o, inv.id, 'CONTRIBUTOR');

    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/submit`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(201);

    // Contributor must NOT be able to approve.
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/approve`)
      .set('Authorization', `Bearer ${contributor.token}`)
      .expect(403);

    // Reviewer approves.
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/review`)
      .set('Authorization', `Bearer ${reviewer.token}`)
      .send({ decision: 'APPROVE', comment: 'looks good' })
      .expect(201);

    // Explicit approval (owner).
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/approve`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(201);

    // Publish.
    const published = await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/publish`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(201);
    expect(published.body.status).toBe('PUBLISHED');
  });

  it('a DRAFT cannot be published without approval', async () => {
    const o = await owner();
    const inv = await withInvestigation(o);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'No-Publish Report', investigationId: inv.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/publish`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(409);
  });

  it('a report with unverified AI content cannot be published', async () => {
    const o = await owner();
    const inv = await withInvestigation(o);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'AI Report', investigationId: inv.id })
      .expect(201);

    const section = await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ key: 'ai-analysis', title: 'AI Analysis' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections/${section.body.id}/blocks`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ type: 'AI_SUMMARY', content: { text: 'AI draft' }, aiGenerated: true })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/submit`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/review`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ decision: 'APPROVE' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/approve`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(201);

    // AI content still under review blocks publishing.
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/publish`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(409);
  });

  it('exports JSON and HTML', async () => {
    const o = await owner();
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'Export Report' })
      .expect(201);

    const json = await request(app.getHttpServer())
      .get(`/api/reports/${report.body.id}/export?format=JSON`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(json.headers['content-type']).toContain('application/json');

    const html = await request(app.getHttpServer())
      .get(`/api/reports/${report.body.id}/export?format=HTML`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(html.headers['content-type']).toContain('text/html');
    expect(html.text).toContain('Export Report');

    const pdf = await request(app.getHttpServer())
      .get(`/api/reports/${report.body.id}/export?format=PDF`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
    expect(pdf.body.slice(0, 4).toString('latin1')).toBe('%PDF');
  });

  it('a VIEWER cannot modify a report', async () => {
    const o = await owner();
    const inv = await withInvestigation(o);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .set('Authorization', `Bearer ${o.token}`)
      .send({ title: 'Read-Only Report', investigationId: inv.id })
      .expect(201);

    const viewer = await memberOf(o, inv.id, 'VIEWER');
    await request(app.getHttpServer())
      .post(`/api/reports/${report.body.id}/sections`)
      .set('Authorization', `Bearer ${viewer.token}`)
      .send({ key: 'sneaky', title: 'Sneaky' })
      .expect(403);
  });
});
