import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AdminSystemStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export interface AdminSystemHealth {
  api: AdminSystemStatus;
  database: AdminSystemStatus;
  queue: AdminSystemStatus;
  workers: AdminSystemStatus;
  ai: AdminSystemStatus;
  search: AdminSystemStatus;
  storage: AdminSystemStatus;
  realtime: AdminSystemStatus;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async systemHealth(): Promise<AdminSystemHealth> {
    let databaseStatus: AdminSystemStatus = 'HEALTHY';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'UNHEALTHY';
    }

    const health: AdminSystemHealth = {
      api: 'HEALTHY',
      database: databaseStatus,
      queue: 'HEALTHY',
      workers: 'HEALTHY',
      ai: 'HEALTHY',
      search: 'HEALTHY',
      storage: 'HEALTHY',
      realtime: 'HEALTHY',
    };

    return health;
  }

  async auditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'DESC' },
    });
  }
}