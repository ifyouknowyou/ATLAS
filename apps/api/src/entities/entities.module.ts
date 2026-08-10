import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';

@Module({
  imports: [WorkspacesModule, InvestigationsModule, ActivityModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
})
export class EntitiesModule {}