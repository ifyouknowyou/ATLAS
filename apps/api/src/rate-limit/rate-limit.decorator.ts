import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  /** Max requests within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/**
 * Declares a per-user rate limit for a route/controller (Phase 5).
 * The in-memory store keys on `{ scope: userId }`.
 */
export const RateLimit = (options: RateLimitOptions): CustomDecorator =>
  SetMetadata(RATE_LIMIT_KEY, options);

export function rateLimitOf(
  handler: object,
  controller: object,
): RateLimitOptions | null {
  return (
    Reflect.getMetadata(RATE_LIMIT_KEY, handler) ??
    Reflect.getMetadata(RATE_LIMIT_KEY, controller) ??
    null
  );
}
