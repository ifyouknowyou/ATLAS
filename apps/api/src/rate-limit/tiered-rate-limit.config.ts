/**
 * Phase 7 tiered rate-limit config.
 * Routes should import these and use @RateLimit() from the matching key.
 * Guards/controllers pick tier by operation rather than one global ceiling.
 */
import { RateLimitOptions } from './rate-limit.decorator';

export const rateLimitTiers: Record<string, RateLimitOptions> = {
  auth: { limit: 10, windowMs: 60_000 },
  search: { limit: 120, windowMs: 60_000 },
  graph: { limit: 60, windowMs: 60_000 },
  ai: { limit: 30, windowMs: 60_000 },
  'file-upload': { limit: 20, windowMs: 60_000 },
  export: { limit: 10, windowMs: 60_000 },
  'connector-sync': { limit: 5, windowMs: 60_000 },
  'workflow-exec': { limit: 15, windowMs: 60_000 },
  evidence: { limit: 120, windowMs: 60_000 },
  report: { limit: 20, windowMs: 60_000 },
  'alert-write': { limit: 60, windowMs: 60_000 },
};

export type RateLimitTier = keyof typeof rateLimitTiers;

export function tierOf(name: RateLimitTier): RateLimitOptions {
  return rateLimitTiers[name];
}