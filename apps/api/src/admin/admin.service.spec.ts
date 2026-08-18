import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let svc: AdminService;
  const prisma = {
    $queryRaw: jest.fn(),
    auditLog: { findMany: jest.fn() },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    svc = module.get(AdminService);
  });

  it('returns system health fields', async () => {
    (prisma.$queryRaw as any).mockResolvedValue([{ count: 0 }]);
    const result = await svc.systemHealth();
    expect(result).toHaveProperty('api');
    expect(result).toHaveProperty('database');
    expect(result).toHaveProperty('queue');
    expect(result).toHaveProperty('workers');
    expect(result).toHaveProperty('ai');
    expect(result).toHaveProperty('search');
    expect(result).toHaveProperty('storage');
    expect(result).toHaveProperty('realtime');
  });

  it('returns degraded DB when query throws', async () => {
    (prisma.$queryRaw as any).mockRejectedValueOnce(new Error('DB down'));
    const result = await svc.systemHealth();
    expect(result.database).toBe('DEGRADED');
  });

  it('returns audit logs', async () => {
    (prisma.auditLog.findMany as any).mockResolvedValueOnce([{ id: 1 }]);
    const logs = await svc.auditLogs();
    expect(logs).toEqual([{ id: 1 }]);
  });
});