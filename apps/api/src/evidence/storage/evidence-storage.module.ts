import { Global, Module } from '@nestjs/common';
import { EvidenceStorageService } from './evidence-storage.service';
import { HashService } from '../hashing/hash.service';

/**
 * Provides the evidence storage + hashing primitives.
 * @Global so upload/download/processing services can inject them without
 * threading an import through every feature module.
 */
@Global()
@Module({
  providers: [EvidenceStorageService, HashService],
  exports: [EvidenceStorageService, HashService],
})
export class EvidenceStorageModule {}
