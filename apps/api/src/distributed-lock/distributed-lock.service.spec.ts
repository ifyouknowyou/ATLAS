import { Test } from '@nestjs/testing';
import { DistributedLockService } from './distributed-lock.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DistributedLockService (Phase 7)', () => {
  let service: DistributedLockService;
  const executeRaw = jest.fn();
  const deleteLock = jest.fn();
  const prisma = {
    $executeRaw: executeRaw,
    $queryRaw: jest.fn(),
    distributedLock: { delete: deleteLock },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DistributedLockService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(DistributedLockService);
  });

  it('acquires lock when insert succeeds', async () => {
    executeRaw.mockResolvedValue(1);
    expect(await service.acquire('k', 1000)).toBe(true);
  });

  it('fails acquire when conflict', async () => {
    executeRaw.mockResolvedValue(0);
    expect(await service.acquire('k', 1000)).toBe(false);
  });

  it('releases without error', async () => {
    deleteLock.mockResolvedValue(null);
    await expect(service.release('k')).resolves.toBeUndefined();
  });
});