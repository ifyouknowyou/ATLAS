import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';

/**
 * Phase 7 — centralized admin authorization guard.
 *
 * Blocks non-admin users from `/admin/*` endpoints and surfaces
 * the same failure channel (403 Forbidden) used by RBAC so clients
 * and tests can reason about it consistently.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const principal = request.principal;

    if (!principal) {
      throw new ForbiddenException('Authentication required');
    }

    if (principal.role !== 'OWNER' && principal.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}
