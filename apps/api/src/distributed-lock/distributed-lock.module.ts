import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DistributedLockService } from './distributed-lock.service';

@Module({
  imports: [PrismaModule],
  providers: [DistributedLockService],
  exports: [DistributedLockService],
})
export class DistributedLockModule {}