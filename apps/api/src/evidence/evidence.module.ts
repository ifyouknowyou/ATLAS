import { Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';

@Module({
  imports: [InvestigationsModule, ActivityModule],
  controllers: [EvidenceController],
  providers: [EvidenceService],
})
export class EvidenceModule {}