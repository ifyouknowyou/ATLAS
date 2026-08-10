import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IncomingMessage } from 'node:http';
import { APP_CONFIG, AppConfig } from '../config/app-config';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

interface AttemptState {
  count: number;
  resetAt: number;
}

/**
 * Minimal per-IP in-memory throttle for the login endpoint. Not a distributed
 * limiter — that belongs to production hardening (Phase 7). Enough to blunt
 * brute-force noise against the demo surface.
 */
@Injectable()
export class LoginThrottleGuard implements CanActivate {
  private readonly attempts = new Map<string, AttemptState>();

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    // Integration tests share one loopback IP; the throttle is turned off in
    // the test environment so suites don't trip it (prod/CI remain throttled).
    if (this.config.nodeEnv === 'test') {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<IncomingMessage & { ip?: string }>();

    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const state = this.attempts.get(key);

    if (!state || state.resetAt <= now) {
      if (state) {
        this.attempts.delete(key);
      }
      this.attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
      this.prune(now);
      return true;
    }

    state.count += 1;
    if (state.count > MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private prune(now: number): void {
    for (const [key, state] of this.attempts) {
      if (state.resetAt <= now) this.attempts.delete(key);
    }
    if (this.attempts.size > 10_000) this.attempts.clear();
  }
}