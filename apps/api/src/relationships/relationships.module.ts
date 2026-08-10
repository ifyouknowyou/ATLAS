import { Module } from '@nestjs/common';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';

@Module({
  imports: [InvestigationsModule, ActivityModule],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
})
export class RelationshipsModule {}