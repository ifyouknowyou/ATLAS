import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import { InvestigationMemberRole, PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { requestIdMiddleware } from '../../src/common/request-id';
import { AllExceptionsFilter } from '../../src/common/http-exception.filter';

export const TEST_PASSWORD = 'Passw0rd!Test#1';

/** Shared e2e fixtures + app bootstrap for integration tests. */

export async function createTestingApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  // Mirror main.ts wiring so e2e behaves like production bootstrap.
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

export interface OrgFixture {
  organizationId: string;
  workspaceId: string;
  userId: string;
  email: string;
}

let sequence = 0;

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  // Child-first order (FK dependencies removed before parents). Runs as
  // sequential queries — avoids Prisma interactive transactions in jest.
  await prisma.mention.deleteMany();
  await prisma.commentReply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.presenceSession.deleteMany();
  await prisma.collaborationEvent.deleteMany();
  await prisma.reportApproval.deleteMany();
  await prisma.reportReview.deleteMany();
  await prisma.reportCitation.deleteMany();
  await prisma.reportBlock.deleteMany();
  await prisma.reportSection.deleteMany();
  await prisma.reportVersion.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.report.deleteMany();
  await prisma.evidenceAccessEvent.deleteMany();
  await prisma.evidenceProcessingJob.deleteMany();
  await prisma.evidenceAnnotation.deleteMany();
  await prisma.evidenceLink.deleteMany();
  await prisma.evidenceVersion.deleteMany();
  await prisma.backgroundJob.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.note.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.activeSession.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

/**
 * Creates an isolated org + user (+ workspace) for tenant tests. All data is
 * invented test data.
 */
export async function createOrgFixture(
  prisma: PrismaClient,
  opts: { role: Role; suffix?: string },
): Promise<OrgFixture> {
  sequence += 1;
  const suffix = opts.suffix ?? `t${sequence}`;
  const email = `${opts.role.toLowerCase()}${suffix}@test.local`;
  const orgSlug = `org-${suffix}`;

  const organization = await prisma.organization.create({
    data: { name: `Test Org ${suffix}`, slug: orgSlug, settings: {} },
  });
  const user = await prisma.user.create({
    data: {
      email,
      displayName: `Tester ${suffix}`,
      passwordHash: hashSync(TEST_PASSWORD, 4),
    },
  });
  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: opts.role,
    },
  });
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Main Workspace',
      organizationId: organization.id,
      createdById: user.id,
    },
  });
  await prisma.membership.update({
    where: {
      userId_organizationId: { userId: user.id, organizationId: organization.id },
    },
    data: { activeWorkspaceId: workspace.id },
  });

  return {
    organizationId: organization.id,
    workspaceId: workspace.id,
    userId: user.id,
    email,
  };
}

export async function login(
  app: INestApplication,
  email: string,
  password = TEST_PASSWORD,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return response.body.accessToken as string;
}

/** Adds an additional org member (for Phase 2 member/investigation tests). */
export async function addOrgUser(
  prisma: PrismaClient,
  organizationId: string,
  opts: { email: string; role: Role },
): Promise<string> {
  const user = await prisma.user.create({
    data: {
      email: opts.email,
      displayName: opts.email.split('@')[0] ?? 'Tester',
      passwordHash: hashSync(TEST_PASSWORD, 4),
    },
  });
  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId,
      role: opts.role,
    },
  });
  return user.id;
}

/** Grants an investigation-level role (Phase 2). */
export async function addInvestigationMember(
  prisma: PrismaClient,
  investigationId: string,
  userId: string,
  role: InvestigationMemberRole,
  createdById: string,
): Promise<void> {
  await prisma.investigationMember.create({
    data: {
      investigationId,
      userId,
      role,
      createdById,
    },
  });
}