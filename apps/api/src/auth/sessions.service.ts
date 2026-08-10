import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Server-held, revocable sessions. A JWT alone is not enough to stay logged
 * in — its `sid` must reference a live ActiveSession row. Logout deletes the
 * row, immediately killing every token bound to it.
 */
@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, ttlMs = SESSION_TTL_MS): Promise<{
    sid: string;
    expiresAt: Date;
  }> {
    const sid = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + ttlMs);
    return this.prisma.activeSession.create({
      data: { sid, userId, expiresAt },
      select: { sid: true, expiresAt: true },
    });
  }

  /** Revokes one session (logout). */
  async revoke(sid: string): Promise<void> {
    await this.prisma.activeSession.deleteMany({ where: { sid } });
  }

  /** Revokes every session for a user (e.g. password change). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.activeSession.deleteMany({ where: { userId } });
  }
}