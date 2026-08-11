import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, existsSync, promises as fs } from 'node:fs';
import { join, normalize, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { APP_CONFIG, AppConfig } from '../../config/app-config';

/**
 * Local-disk evidence storage (Phase 5).
 *
 * Files are stored under `ATLAS_STORAGE_DIR` in an internal layout keyed by
 * evidence id + version number. Callers only ever pass logical ids — this
 * service owns the mapping to absolute paths and refuses any path that escapes
 * the storage root (path-traversal guard). Absolute paths are never exposed to
 * clients; delivery flows through authorized download endpoints.
 */
@Injectable()
export class EvidenceStorageService {
  private readonly root: string;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.root = resolve(config.storageDir);
  }

  /** Internal storage key for a given evidence version. */
  storageKey(evidenceId: string, versionNumber: number): string {
    return join(evidenceId, `v${versionNumber}`);
  }

  /** Relative key where the file actually lives. */
  async save(
    evidenceId: string,
    versionNumber: number,
    originalFilename: string,
    buffer: Buffer,
  ): Promise<{ storageKey: string; size: number }> {
    const key = this.storageKey(evidenceId, versionNumber);
    const abs = this.resolveWithinRoot(key);
    await fs.mkdir(this.safeDirname(abs), { recursive: true });
    await fs.writeFile(abs, buffer, { flag: 'wx' });
    return { storageKey: key, size: buffer.length };
  }

  /** Opens a readable stream for the stored file (caller re-authorizes access). */
  async open(
    storageKey: string,
  ): Promise<{ stream: Readable; size: number }> {
    const abs = this.resolveWithinRoot(storageKey);
    if (!existsSync(abs)) {
      throw new NotFoundException('Stored evidence file not found');
    }
    const stat = await fs.stat(abs);
    return { stream: createReadStream(abs), size: stat.size };
  }

  async stat(storageKey: string): Promise<{ size: number }> {
    const abs = this.resolveWithinRoot(storageKey);
    if (!existsSync(abs)) {
      throw new NotFoundException('Stored evidence file not found');
    }
    const stat = await fs.stat(abs);
    return { size: stat.size };
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const abs = this.resolveWithinRoot(storageKey);
      return existsSync(abs);
    } catch {
      return false;
    }
  }

  async remove(storageKey: string): Promise<void> {
    const abs = this.resolveWithinRoot(storageKey);
    if (existsSync(abs)) {
      await fs.unlink(abs);
    }
  }

  /** Resolves a storage key under the root, rejecting any escape attempt. */
  private resolveWithinRoot(storageKey: string): string {
    if (!storageKey || storageKey.includes('\0')) {
      throw new BadRequestException('Invalid storage key');
    }
    const abs = resolve(this.root, storageKey);
    const rootPrefix = this.root.endsWith(sep) ? this.root : `${this.root}${sep}`;
    const normalizedRoot = normalize(this.root);
    if (abs !== normalizedRoot && !abs.startsWith(rootPrefix)) {
      throw new BadRequestException('Storage path escapes the storage root');
    }
    return abs;
  }

  private safeDirname(absPath: string): string {
    const idx = absPath.lastIndexOf(sep);
    return idx === -1 ? absPath : absPath.slice(0, idx);
  }
}
