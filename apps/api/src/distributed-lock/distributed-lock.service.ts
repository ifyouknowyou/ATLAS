import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistributedLockService implements OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async acquire(key: string, ttlMs: number, owner?: string): Promise<boolean> {
    const ownerId = owner ?? `${process.pid}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + ttlMs);

    const result = await this.prisma.$executeRaw`
      INSERT INTO "DistributedLock" ("key", "owner", "expiresAt")
      VALUES (${key}, ${ownerId}, ${expiresAt})
      ON CONFLICT ("key") DO NOTHING
    `;

    return result > 0;
  }

  async release(key: string): Promise<void> {
    await this.prisma.distributedLock.delete({ where: { key } }).catch(() => {});
  }

  async extend(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.prisma.$executeRaw`
      UPDATE "DistributedLock"
      SET "expiresAt" = NOW() + INTERVAL '1 millisecond' * ${ttlMs}
      WHERE "key" = ${key}
    `;
    return result > 0;
  }

  async isHeld(key: string): Promise<boolean> {
    const count = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as "count" FROM "DistributedLock" WHERE "key" = ${key} AND "expiresAt" > NOW()
    `;
    return Number(count[0]?.count ?? 0) > 0;
  }

  async onModuleDestroy() {
    // best-effort cleanup
    const likePattern = `${process.pid}-%`;
    try {
      await this.prisma.$executeRaw`DELETE FROM "DistributedLock" WHERE "owner" LIKE ${likePattern}`;
    } catch {}
  }
}