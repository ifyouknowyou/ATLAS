import { Test } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService (Phase 7)', () => {
  let service: HealthService;
  const prisma = { $queryRaw: jest.fn() } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(HealthService);
  });

  it('liveness returns ok', async () => {
    const result = await service.checkLiveness();
    expect(result.status).toBe('ok');
  });

  it('readiness healthy when DB ok', async () => {
    (prisma.$queryRaw as any).mockResolvedValue([{ count: 0 }]);
    const result = await service.checkReadiness({});
    expect(result.status).toBe('healthy');
  });

  it('readiness unhealthy when DB down', async () => {
    (prisma.$queryRaw as any).mockRejectedValue(new Error('DB down'));
    const result = await service.checkReadiness({});
    expect(result.status).toBe('unhealthy');
  });
});