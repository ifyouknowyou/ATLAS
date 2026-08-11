import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

/**
 * Server-side SHA-256 hashing for evidence integrity (Phase 5).
 *
 * Phase 2 only format-validated a client-supplied hash. Phase 5 computes the
 * hash from the actual bytes server-side so integrity is meaningful.
 */
@Injectable()
export class HashService {
  sha256(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /** Deterministic hex of a short-lived signed-URL token (HMAC-free usage). */
  shortDigest(value: string): string {
    return createHash('sha256').update(value).digest('hex').slice(0, 16);
  }
}
