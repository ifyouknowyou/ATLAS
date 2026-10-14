import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService (Phase 7)', () => {
  let service: AdminService;
  const queryRaw = jest.fn();
  const findMany = jest.fn();
  const prisma = {
    $queryRaw: queryRaw,
    auditLog: { findMany },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(AdminService);
  });

  it('returns all required health fields', async () => {
    queryRaw.mockResolvedValue([{ count: 0 }]);
    const result = await service.systemHealth();
    expect(result).toHaveProperty('api');
    expect(result).toHaveProperty('database');
    expect(result).toHaveProperty('queue');
    expect(result).toHaveProperty('workers');
    expect(result).toHaveProperty('ai');
    expect(result).toHaveProperty('search');
    expect(result).toHaveProperty('storage');
    expect(result).toHaveProperty('realtime');
  });

  it('returns audit logs', async () => {
    findMany.mockResolvedValue([{ id: '1' }]);
    const logs = await service.auditLogs();
    expect(logs).toEqual([{ id: '1' }]);
  });
});