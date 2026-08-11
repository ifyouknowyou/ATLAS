import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role, ROLES, permissionsForRole } from '@atlas/shared';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfig } from '../config/app-config';
import { AuthenticatedRequest } from './principal';

const config: AppConfig = {
  nodeEnv: 'test',
  apiPort: 4100,
  databaseUrl: 'postgresql://test',
  corsOrigins: [],
  authJwtSecret: 'test-secret',
  authJwtExpiresIn: '1h',
  authBcryptRounds: 4,
  demoOwnerEmail: 'admin@atlas.demo',
  demoOwnerPassword: 'x',
  anthropicModel: 'claude-opus-5',
  storageDir: '/tmp/atlas-test-storage',
  maxUploadMb: 5,
  signedUrlTtlS: 120,
  jobsPollIntervalMs: 2000,
};

type PrismaOverrides = {
  session?: { sid: string; expiresAt: Date } | null;
  membership?: {
    userId: string;
    organizationId: string;
    activeWorkspaceId: string | null;
    role: Role;
  } | null;
};

function buildContext(
  request: Partial<AuthenticatedRequest>,
  publicTarget = false,
): ExecutionContext {
  const handler = () => undefined;
  const controller = () => undefined;
  if (publicTarget) {
    Reflect.defineMetadata('isPublic', true, handler);
  }
  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => request as AuthenticatedRequest,
    }),
  } as unknown as ExecutionContext;
}

function setupGuard(overrides: PrismaOverrides) {
  const jwt = {
    verifyAsync: jest.fn(
      async (): Promise<{ sub: string; sid: string; oid: string }> => ({
        sub: 'u1',
        sid: 's1',
        oid: 'o1',
      }),
    ),
  } as unknown as Partial<JwtService>;

  const prisma = {
    activeSession: {
      findUnique: jest.fn(async () => overrides.session ?? null),
    },
    membership: {
      findUnique: jest.fn(async () => overrides.membership ?? null),
    },
  } as unknown as Partial<PrismaService>;

  const guard = new AuthGuard(jwt as JwtService, prisma as PrismaService, config);
  return { guard, prisma, jwt };
}

describe('AuthGuard', () => {
  it('accepts a valid token, session and membership, attaching a fresh principal', async () => {
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer tok' } as AuthenticatedRequest['headers'],
    };
    const { guard } = setupGuard({
      session: { sid: 's1', expiresAt: new Date(Date.now() + 60_000) },
      membership: {
        userId: 'u1',
        organizationId: 'o1',
        activeWorkspaceId: 'w1',
        role: 'ANALYST',
      },
    });

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
    expect(request.principal).toMatchObject({
      userId: 'u1',
      organizationId: 'o1',
      workspaceId: 'w1',
      role: 'ANALYST',
    });
    // Permissions are recomputed server-side from the DB role, not the token.
    expect(request.principal?.permissions).toEqual(permissionsForRole('ANALYST'));
    expect(request.sessionPayload).toEqual({ sub: 'u1', sid: 's1', oid: 'o1' });
  });

  it('rejects requests without a bearer token', async () => {
    const { guard } = setupGuard({ session: null });
    const context = buildContext({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when the server-held session is missing', async () => {
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer tok' } as AuthenticatedRequest['headers'],
    };
    const { guard } = setupGuard({ session: null });
    await expect(guard.canActivate(buildContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an expired server session', async () => {
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer tok' } as AuthenticatedRequest['headers'],
    };
    const { guard } = setupGuard({
      session: { sid: 's1', expiresAt: new Date(Date.now() - 5000) },
    });
    await expect(guard.canActivate(buildContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a principal with no organization membership', async () => {
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer tok' } as AuthenticatedRequest['headers'],
    };
    const { guard } = setupGuard({
      session: { sid: 's1', expiresAt: new Date(Date.now() + 60_000) },
      membership: null,
    });
    await expect(guard.canActivate(buildContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('bypasses auth for public targets', async () => {
    const request: Partial<AuthenticatedRequest> = { headers: {} };
    const { guard } = setupGuard({ session: null });
    await expect(guard.canActivate(buildContext(request, true))).resolves.toBe(
      true,
    );
  });

  it('covers every role in the permission matrix', () => {
    for (const role of ROLES) {
      expect(permissionsForRole(role).length).toBeGreaterThan(0);
    }
  });
});