import { Test } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let svc: HealthService;
  const prisma = { $queryRaw: jest.fn() } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    svc = module.get(HealthService);
  });

  it('liveness always ok', async () => {
    expect(await svc.checkLiveness()).toBeTruthy();
  });

  it('readiness healthy when DB ok', async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([{ count: 0 }]);
    const result = await svc.checkReadiness({});
    expect(result.status).toBe('healthy');
  });
});