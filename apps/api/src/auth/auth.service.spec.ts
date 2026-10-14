import { ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { permissionsForRole } from '@atlas/shared';
import { AppConfig } from '../config/app-config';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from './sessions.service';
import { AuthService } from './auth.service';

const config: AppConfig = {
  nodeEnv: 'test',
  apiPort: 4100,
  databaseUrl: 'postgresql://test',
  corsOrigins: [],
  authJwtSecret: 'test-secret',
  authJwtExpiresIn: '1h',
  authBcryptRounds: 4,
  demoOwnerEmail: 'admin@atlas.demo',
  demoOwnerPassword: 'unused',
  anthropicModel: 'claude-opus-5',
  storageDir: '/tmp/atlas-test-storage',
  maxUploadMb: 5,
  signedUrlTtlS: 120,
  jobsPollIntervalMs: 2000,
};

function createService(membership: {
  userId: string;
  organizationId: string;
  activeWorkspaceId: string | null;
  role: 'OWNER';
} | null) {
  const findFirst = jest.fn().mockResolvedValue(membership);
  const signAsync = jest.fn().mockResolvedValue('demo-token');
  const create = jest.fn().mockResolvedValue({
    sid: 'demo-session',
    expiresAt: new Date('2030-01-01T00:00:00Z'),
  });
  const prisma = {
    membership: { findFirst },
  } as unknown as PrismaService;
  const jwt = { signAsync } as unknown as JwtService;
  const sessions = { create } as unknown as SessionsService;

  return {
    service: new AuthService(prisma, jwt, sessions, config),
    findFirst,
    signAsync,
    create,
  };
}

describe('AuthService.demoSession', () => {
  it('issues a session for the demo tenant owner without credentials', async () => {
    const membership = {
      userId: 'demo-owner',
      organizationId: 'demo-org',
      activeWorkspaceId: 'demo-workspace',
      role: 'OWNER' as const,
    };
    const { service, findFirst, signAsync, create } = createService(membership);

    await expect(service.demoSession()).resolves.toEqual({
      accessToken: 'demo-token',
      session: {
        userId: membership.userId,
        organizationId: membership.organizationId,
        workspaceId: membership.activeWorkspaceId,
        role: membership.role,
        permissions: permissionsForRole('OWNER'),
      },
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        role: 'OWNER',
        user: { isActive: true },
        organization: { slug: 'atlas-demo', isDemo: true },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        userId: true,
        organizationId: true,
        activeWorkspaceId: true,
        role: true,
      },
    });
    expect(create).toHaveBeenCalledWith(membership.userId);
    expect(signAsync).toHaveBeenCalled();
  });

  it('reports an unavailable demo workspace when it has not been seeded', async () => {
    const { service } = createService(null);

    await expect(service.demoSession()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
