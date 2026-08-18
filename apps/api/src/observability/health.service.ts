import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export interface HealthChecks {
  [key: string]: { status: HealthStatus; detail?: string };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLiveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async checkReadiness(checks: HealthChecks = {}): Promise<{ status: HealthStatus; checks: HealthChecks }> {
    const results: HealthChecks = { ...checks };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      results.database = { status: 'healthy' };
    } catch (error) {
      results.database = { status: 'unhealthy', detail: (error as Error).message };
    }

    const unhealthy = Object.values(results).filter((c) => c.status === 'unhealthy').length;
    const status: HealthStatus = unhealthy > 0 ? 'unhealthy' : Object.values(results).some((c) => c.status === 'degraded') ? 'degraded' : 'healthy';

    return { status, checks: results };
  }
}