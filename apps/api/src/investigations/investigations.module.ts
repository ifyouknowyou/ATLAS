import { Module } from '@nestjs/common';
import { InvestigationsController } from './investigations.controller';
import { InvestigationsService } from './investigations.service';
import { InvestigationAccessService } from './investigation-access.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ActivityModule } from '../common/activity.service';

@Module({
  imports: [WorkspacesModule, ActivityModule],
  controllers: [InvestigationsController],
  providers: [InvestigationsService, InvestigationAccessService],
  exports: [InvestigationAccessService, InvestigationsService],
})
export class InvestigationsModule {}