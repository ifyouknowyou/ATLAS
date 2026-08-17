import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';

@Module({
  imports: [PrismaModule, JobsModule],
  exports: [ConnectorsService],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
})
export class ConnectorsModule {}