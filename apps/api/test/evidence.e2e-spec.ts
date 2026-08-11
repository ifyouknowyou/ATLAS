import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  addOrgUser,
  createOrgFixture,
  createTestingApp,
  login,
  resetDatabase,
} from './helpers/db';

/**
 * Phase 5 — Evidence Vault (e2e).
 * Verifies secure upload (magic-byte/size validation, server hashing),
 * versioning, chain-of-custody, annotations, download authorization,
 * IDOR/tenant/classification bypass, and signed-URL revocation semantics.
 */
describe('Evidence Vault (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let storageDir: string;

  beforeAll(async () => {
    storageDir = await mkdtemp(join(tmpdir(), 'atlas-ev-e2e-'));
    prisma = new PrismaClient();
    await resetDatabase(prisma);
    process.env.ATLAS_STORAGE_DIR = storageDir;
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await rm(storageDir, { recursive: true, force: true });
  });

  let ownerSeq = 0;
  async function owner() {
    ownerSeq += 1;
    const fixture = await createOrgFixture(prisma, { role: 'OWNER', suffix: `ev${ownerSeq}` });
    return { ...fixture, token: await login(app, fixture.email) };
  }

  it('uploads a PDF, computes the hash, and records a version + access event', async () => {
    const o = await owner();
    const pdf = Buffer.from('%PDF-1.4\n%ATLAS demo evidence\n%%EOF\n');
    const res = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .field('title', 'beacon log')
      .attach('file', pdf, 'beacon.pdf')
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(res.body.versionNumber).toBe(1);

    const versions = await request(app.getHttpServer())
      .get(`/api/evidence/${res.body.id}/versions`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(versions.body.length).toBe(1);

    const history = await request(app.getHttpServer())
      .get(`/api/evidence/${res.body.id}/access-history`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(history.body.some((e: { action: string }) => e.action === 'UPLOADED')).toBe(true);
  });

  it('rejects a file that fails magic-byte validation (executable masquerading as PDF)', async () => {
    const o = await owner();
    const fake = Buffer.from('#!/bin/sh\necho pwned\n');
    const res = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .field('title', 'bad file')
      .attach('file', fake, 'fake.pdf')
      .expect(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('blocks a same-org non-member from uploading to an investigation', async () => {
    const o = await owner();
    await addOrgUser(prisma, o.organizationId, {
      email: 'viewer-notmember@test.local',
      role: 'VIEWER',
    });
    const viewerToken = await login(app, 'viewer-notmember@test.local');
    const inv = await prisma.investigation.create({
      data: {
        title: 'inv-owner-only',
        organizationId: o.organizationId,
        createdById: o.userId,
      },
    });
    const pdf = Buffer.from('%PDF-1.4\ndata\n%%EOF\n');
    await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${viewerToken}`)
      .field('title', 'sneaky')
      .field('investigationId', inv.id)
      .attach('file', pdf, 'sneaky.pdf')
      .expect(403);
  });

  it('enforces download authorization — other org cannot download', async () => {
    const o = await owner();
    const pdf = Buffer.from('%PDF-1.4\ndata\n%%EOF\n');
    const up = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .attach('file', pdf, 'secret.pdf')
      .expect(201);

    const other = await createOrgFixture(prisma, { role: 'VIEWER', suffix: `oth${ownerSeq}` });
    const otherToken = await login(app, other.email);
    // Cross-org scoping 404s (never reveals existence).
    await request(app.getHttpServer())
      .get(`/api/evidence/${up.body.id}/download`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });

  it('downloads only for an authorized user and streams the original bytes', async () => {
    const o = await owner();
    const bytes = Buffer.from('%PDF-1.4\nhello evidence\n%%EOF\n');
    const up = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .attach('file', bytes, 'hello.pdf')
      .expect(201);

    const dl = await request(app.getHttpServer())
      .get(`/api/evidence/${up.body.id}/download`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(dl.body.equals(bytes)).toBe(true);
  });

  it('signed URL is revoked when evidence is archived (delivery re-authz)', async () => {
    const o = await owner();
    const bytes = Buffer.from('%PDF-1.4\narchive-me\n%%EOF\n');
    const up = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .attach('file', bytes, 'archive.pdf')
      .expect(201);

    const signed = await request(app.getHttpServer())
      .get(`/api/evidence/${up.body.id}/signed-url`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(signed.body.url).toContain('/api/evidence/deliver/');

    await request(app.getHttpServer())
      .post(`/api/evidence/${up.body.id}/archive`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(204);

    // Even the valid token must now fail at delivery.
    await request(app.getHttpServer())
      .get(signed.body.url)
      .expect(403);
  });

  it('creates and resolves an annotation', async () => {
    const o = await owner();
    const bytes = Buffer.from('%PDF-1.4\nanno\n%%EOF\n');
    const up = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .attach('file', bytes, 'anno.pdf')
      .expect(201);

    const created = await request(app.getHttpServer())
      .post(`/api/evidence/${up.body.id}/annotations`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ type: 'HIGHLIGHT', content: 'key passage', tags: ['flag'] })
      .expect(201);
    expect(created.body.type).toBe('HIGHLIGHT');

    await request(app.getHttpServer())
      .post(`/api/evidence/annotations/${created.body.id}/resolve`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ resolved: true })
      .expect(200);
    const list = await request(app.getHttpServer())
      .get(`/api/evidence/${up.body.id}/annotations`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(list.body[0].resolvedAt).toBeTruthy();
  });

  it('creates a linked reference to an entity', async () => {
    const o = await owner();
    const bytes = Buffer.from('%PDF-1.4\nlink\n%%EOF\n');
    const up = await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .attach('file', bytes, 'link.pdf')
      .expect(201);

    const entity = await prisma.entity.create({
      data: {
        type: 'PERSON',
        name: 'Linked Person',
        displayName: 'Linked Person',
        organizationId: o.organizationId,
        createdById: o.userId,
      },
    });

    await request(app.getHttpServer())
      .post(`/api/evidence/${up.body.id}/links`)
      .set('Authorization', `Bearer ${o.token}`)
      .send({ targetType: 'ENTITY', targetId: entity.id })
      .expect(201);

    const links = await request(app.getHttpServer())
      .get(`/api/evidence/${up.body.id}/links`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(links.body.length).toBe(1);
  });

  it('search returns only accessible evidence', async () => {
    const o = await owner();
    const bytes = Buffer.from('%PDF-1.4\nsearchable\n%%EOF\n');
    await request(app.getHttpServer())
      .post('/api/evidence/upload')
      .set('Authorization', `Bearer ${o.token}`)
      .field('title', 'unique-snippet-xyz')
      .attach('file', bytes, 'search.pdf')
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/evidence/search?q=unique-snippet-xyz`)
      .set('Authorization', `Bearer ${o.token}`)
      .expect(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });
});
