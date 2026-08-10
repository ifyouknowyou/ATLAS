import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness + database connectivity. No auth by design (probe endpoint). */
  @Public()
  @Get()
  async health(): Promise<{ status: string; db: string; timestamp: string }> {
    let db = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      // db reported as down; status reflects it.
    }
    const status = db === 'up' ? 'ok' : 'degraded';
    return { status, db, timestamp: new Date().toISOString() };
  }
}