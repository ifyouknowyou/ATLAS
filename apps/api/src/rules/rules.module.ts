import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
  imports: [PrismaModule, JobsModule],
  exports: [RulesService],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}