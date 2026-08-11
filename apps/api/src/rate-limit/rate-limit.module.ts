import { Global, Module } from '@nestjs/common';
import { RateLimitStore } from './rate-limit.store';
import { RateLimitGuard } from './rate-limit.guard';

/**
 * Rate limiting (Phase 5). Global so the guard can be registered as an
 * APP_GUARD in AppModule. In-memory store — single-instance; multi-instance
 * scaling would require a shared store (e.g. Redis), documented in the
 * architecture doc.
 */
@Global()
@Module({
  providers: [RateLimitStore, RateLimitGuard],
  exports: [RateLimitStore, RateLimitGuard],
})
export class RateLimitModule {}
