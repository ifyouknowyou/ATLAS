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

    // Phase 7 trust model: super-admin flag in principal for now;
    // later ABAC can extend this to role + org + classification + action.
    const isSystemAdmin =
      (principal as any).roles?.includes('SYSTEM_ADMIN') ??
      (principal as any).isSystemAdmin ??
      false;

    if (!isSystemAdmin) {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}

/**
 * Decorator that mirrors `@RequirePermission` for ops audit endpoints.
 * Imported by `AdminController` so no section header leak occurs.
 */
export const RequireSystemAdmin = () => AdminGuard;