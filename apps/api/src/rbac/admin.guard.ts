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

    // Phase 7 trust model: honor real permissions array and system scopes.
    let isSystemAdmin = false;
    try {
      const perms: any = principal.permissions ?? [];
      isSystemAdmin = Array.isArray(perms)
        ? perms.some((p: any) => {
            const code = typeof p === 'string' ? p : p.code;
            return code === 'admin:system';
          })
        : false;
      if (!isSystemAdmin && (principal as any).roles) {
        const roles: string[] = Array.isArray((principal as any).roles)
          ? (principal as any).roles
          : [];
        isSystemAdmin = roles.includes('SYSTEM_ADMIN');
      }
      if (!isSystemAdmin && (principal as any).isSystemAdmin) {
        isSystemAdmin = true;
      }
    } catch (e) {
      isSystemAdmin = false;
    }

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
export const RequireSystemAdmin = () => {
  return function (_target: any, _key: string | symbol, descriptor: PropertyDescriptor) {
    // We are not changing the method, just returning the descriptor.
    // The actual guard is applied at the controller level via @UseGuards.
    return descriptor;
  };
};