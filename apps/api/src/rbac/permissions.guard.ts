import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { requiredPermissionsOf } from './require-permission.decorator';

/**
 * Enforces required permissions declared via @RequirePermission(...).
 * Runs after AuthGuard, which has already populated the principal with a
 * fresh, server-computed permission list.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const required = requiredPermissionsOf(
      context.getHandler(),
      context.getClass(),
    );

    if (required.length === 0) {
      return true;
    }

    const granted = request.principal?.permissions ?? [];
    const missing = required.filter((permission) => !granted.includes(permission));
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing required permission: ${missing.join(', ')}`,
      );
    }
    return true;
  }
}