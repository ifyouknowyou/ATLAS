import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RateLimitStore } from './rate-limit.store';
import { rateLimitOf } from './rate-limit.decorator';
import { AuthenticatedRequest } from '../auth/principal';

/**
 * Per-user sliding-window rate limit (Phase 5).
 *
 * Runs after AuthGuard + PermissionsGuard (registered in AppModule) so the
 * principal is populated. Routes opt in via @RateLimit({ limit, windowMs }).
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly store: RateLimitStore) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const options = rateLimitOf(context.getHandler(), context.getClass());
    if (!options) {
      return true;
    }

    // Fall back to the client ip when no principal is present (defensive).
    const userId = request.principal?.userId ?? 'anonymous';
    const key = `${request.principal?.organizationId ?? '?'}:${userId}`;

    if (!this.store.consume(key, options.limit, options.windowMs)) {
      const requestId = typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : '';
      throw new HttpException(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down and retry.',
            requestId,
            details: { retryAfterSeconds: Math.ceil(options.windowMs / 1000) },
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
