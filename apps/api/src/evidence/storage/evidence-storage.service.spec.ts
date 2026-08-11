import { BadRequestException } from '@nestjs/common';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EvidenceStorageService } from './evidence-storage.service';

async function makeStorage(): Promise<{ storage: EvidenceStorageService; dir: string }> {
  const dir = await mkdtemp(join(tmpdir(), 'atlas-storage-'));
  const storage = new EvidenceStorageService({
    storageDir: dir,
  } as never);
  return { storage, dir };
}

describe('EvidenceStorageService', () => {
  it('round-trips a file and reports its size', async () => {
    const { storage, dir } = await makeStorage();
    try {
      const { storageKey, size } = await storage.save('ev-1', 1, 'a.txt', Buffer.from('hello world'));
      expect(size).toBe(11);
      const { stream, size: readSize } = await storage.open(storageKey);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk as Buffer);
      expect(Buffer.concat(chunks).toString('utf8')).toBe('hello world');
      expect(readSize).toBe(11);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a path-traversal storage key', async () => {
    const { storage, dir } = await makeStorage();
    try {
      await expect(storage.open('../../etc/passwd')).rejects.toBeInstanceOf(BadRequestException);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects an absolute storage key', async () => {
    const { storage, dir } = await makeStorage();
    try {
      await expect(storage.open('/etc/passwd')).rejects.toBeInstanceOf(BadRequestException);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('returns exists=false for missing files', async () => {
    const { storage, dir } = await makeStorage();
    try {
      expect(await storage.exists('ev-x/v9')).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('removes a stored file', async () => {
    const { storage, dir } = await makeStorage();
    try {
      const { storageKey } = await storage.save('ev-2', 1, 'a.bin', Buffer.from([1, 2, 3]));
      expect(await storage.exists(storageKey)).toBe(true);
      await storage.remove(storageKey);
      expect(await storage.exists(storageKey)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
