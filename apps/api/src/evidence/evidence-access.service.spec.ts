import { ForbiddenException } from '@nestjs/common';
import { EvidenceAccessService } from './evidence-access.service';
import { AuthenticatedPrincipal } from '../auth/principal';

const admin: AuthenticatedPrincipal = {
  userId: 'u-admin',
  organizationId: 'org1',
  workspaceId: null,
  role: 'OWNER',
  permissions: ['evidence.read', 'evidence.classify', 'evidence.delete'],
};

const analyst: AuthenticatedPrincipal = {
  userId: 'u-analyst',
  organizationId: 'org1',
  workspaceId: null,
  role: 'ANALYST',
  permissions: ['evidence.read', 'evidence.download', 'evidence.annotate'],
};

const viewer: AuthenticatedPrincipal = {
  userId: 'u-viewer',
  organizationId: 'org1',
  workspaceId: null,
  role: 'VIEWER',
  permissions: ['evidence.read', 'evidence.download'],
};

function makeService() {
  return new EvidenceAccessService(
    {
      // Prisma client mock
      evidence: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'ev1',
          name: 'Evidence 1',
          classification: 'CONFIDENTIAL',
          status: 'AVAILABLE',
          investigationId: null,
          storageKey: 'ev1/v1',
          mimeType: 'application/pdf',
          versions: [{ id: 'ver1' }],
        }),
      },
    } as never,
    {
      requireCapability: jest.fn().mockResolvedValue(undefined),
      assertOrgPermission: jest.fn(),
      isOrgAdmin: jest.fn((p: AuthenticatedPrincipal) => p.role === 'OWNER' || p.role === 'ADMIN'),
      listAccessWhere: jest.fn(() => undefined),
    } as never,
  );
}

describe('EvidenceAccessService', () => {
  it('isOrgAdmin recognizes OWNER/ADMIN', () => {
    const service = makeService();
    expect(service.isOrgAdmin(admin)).toBe(true);
    expect(service.isOrgAdmin(analyst)).toBe(false);
  });

  it('requireEvidence resolves org-level evidence via org permission', async () => {
    const service = makeService();
    const result = await service.requireEvidence(analyst, 'ev1', 'read');
    expect(result.id).toBe('ev1');
    expect(result.versionId).toBe('ver1');
  });

  it('blocks RESTRICTED org-level evidence for non-admins', async () => {
    const prisma = {
      evidence: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'evR',
          name: 'Restricted',
          classification: 'RESTRICTED',
          status: 'AVAILABLE',
          investigationId: null,
          storageKey: 'evR/v1',
          mimeType: null,
          versions: [],
        }),
      },
    };
    const service = makeService();
    (service as unknown as { prisma: unknown }).prisma = prisma;
    await expect(service.requireEvidence(viewer, 'evR', 'read')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows RESTRICTED org-level evidence for org admins', async () => {
    const prisma = {
      evidence: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'evR',
          name: 'Restricted',
          classification: 'RESTRICTED',
          status: 'AVAILABLE',
          investigationId: null,
          storageKey: 'evR/v1',
          mimeType: null,
          versions: [],
        }),
      },
    };
    const service = makeService();
    (service as unknown as { prisma: unknown }).prisma = prisma;
    const result = await service.requireEvidence(admin, 'evR', 'read');
    expect(result.id).toBe('evR');
  });

  it('listEvidenceWhere includes RESTRICTED for admins but not analysts', () => {
    const service = makeService();
    const adminWhere = service.listEvidenceWhere(admin) as Record<string, unknown>;
    expect(adminWhere.organizationId).toBe('org1');
    expect(adminWhere.OR).toBeUndefined();

    const analystWhere = service.listEvidenceWhere(analyst) as { OR?: unknown[] };
    expect(analystWhere.OR).toBeDefined();
  });
});
