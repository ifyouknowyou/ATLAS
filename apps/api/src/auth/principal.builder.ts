import { UnauthorizedException } from '@nestjs/common';
import { permissionsForRole } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from './principal';

/**
 * Builds a fresh, up-to-date AuthenticatedPrincipal from a user + organization.
 *
 * Shared between AuthGuard (bearer JWT path) and the SSE ticket path so both
 * produce identical principals and never trust stale role/permission data.
 * The membership row is re-read live on every call.
 */
export async function buildPrincipal(
  prisma: PrismaService,
  userId: string,
  organizationId: string,
): Promise<AuthenticatedPrincipal> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });
  if (!membership) {
    throw new UnauthorizedException('No active organization membership');
  }
  return {
    userId: membership.userId,
    organizationId: membership.organizationId,
    workspaceId: membership.activeWorkspaceId,
    role: membership.role,
    permissions: permissionsForRole(membership.role),
  };
}