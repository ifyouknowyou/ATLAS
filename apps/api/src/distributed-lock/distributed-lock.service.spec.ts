import { Test } from '@nestjs/testing';
import { DistributedLockService } from './distributed-lock.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DistributedLockService', () => {
  let lock: DistributedLockService;
  const prisma = {
    $executeRaw: jest.fn(),
    distributedLock: { delete: jest.fn() },
    $queryRaw: jest.fn(),
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DistributedLockService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    lock = module.get(DistributedLockService);
  });

  it('acquires lock when DB insert succeeds', async () => {
    (prisma.$executeRaw as any).mockResolvedValueOnce(1);
    expect(await lock.acquire('k1', 1000)).toBe(true);
  });

  it('fails acquire when DB insert conflicts', async () => {
    (prisma.$executeRaw as any).mockResolvedValueOnce(0);
    expect(await lock.acquire('k1', 1000)).toBe(false);
  });

  it('releases lock without error', async () => {
    (prisma.distributedLock.delete as any).mockResolvedValueOnce(null);
    await expect(lock.release('k1')).resolves.toBeUndefined();
  });
});