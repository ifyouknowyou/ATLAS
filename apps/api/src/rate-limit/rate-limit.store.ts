import { Injectable } from '@nestjs/common';

/**
 * In-memory sliding-window rate-limit store (single instance, Phase 5).
 *
 * Keyed by `scope:userId`. Kept deliberately simple — this is a per-process
 * guard, not a distributed one; the multi-instance caveat is documented in
 * the architecture doc. A periodic sweep bounds memory usage.
 */
@Injectable()
export class RateLimitStore {
  private readonly buckets = new Map<string, number[]>();

  /**
   * @returns true when the request is allowed, false when rate-limited.
   */
  consume(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const cutoff = now - windowMs;
    let hits = this.buckets.get(key);
    if (!hits) {
      hits = [];
      this.buckets.set(key, hits);
    }
    // Drop entries outside the window.
    const active = hits.filter((t) => t > cutoff);
    this.buckets.set(key, active);
    if (active.length >= limit) {
      return false;
    }
    active.push(now);
    return true;
  }

  /** Removes expired buckets to bound memory. Call on an interval. */
  sweep(): void {
    const now = Date.now();
    for (const [key, hits] of this.buckets) {
      const active = hits.filter((t) => t > now - 60_000);
      if (active.length === 0) {
        this.buckets.delete(key);
      } else {
        this.buckets.set(key, active);
      }
    }
  }

  /** Test hook. */
  size(): number {
    return this.buckets.size;
  }
}
