import { Test } from '@nestjs/testing';
import { DistributedLockService } from './distributed-lock.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DistributedLockService (Phase 7)', () => {
  let service: DistributedLockService;
  const prisma = {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    distributedLock: { delete: jest.fn() },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DistributedLockService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(DistributedLockService);
  });

  it('acquires lock when insert succeeds', async () => {
    (prisma.$executeRaw as any).mockResolvedValue(1);
    expect(await service.acquire('k', 1000)).toBe(true);
  });

  it('fails acquire when conflict', async () => {
    (prisma.$executeRaw as any).mockResolvedValue(0);
    expect(await service.acquire('k', 1000)).toBe(false);
  });

  it('releases without error', async () => {
    (prisma.distributedLock.delete as any).mockResolvedValue(null);
    await expect(service.release('k')).resolves.toBeUndefined();
  });
});