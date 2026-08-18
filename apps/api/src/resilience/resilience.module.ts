import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResilienceService } from './resilience.service';
import { PaginationPipe } from './pagination.pipe';

@Module({
  imports: [PrismaModule],
  providers: [ResilienceService, PaginationPipe],
  exports: [ResilienceService, PaginationPipe],
})
export class ResilienceModule {}