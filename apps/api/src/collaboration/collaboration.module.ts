import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { NotificationsController } from './notifications.controller';
import { PresenceController } from './presence.controller';
import { CommentsService } from './comments.service';
import { NotificationsService } from './notifications.service';
import { PresenceService } from './presence.service';
import { CollaborationAccessService } from './collaboration-access.service';
import { CollaborationEventsService } from './collaboration-events.service';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';

/**
 * Real-Time Collaboration (Phase 5). Access resolution only depends on Prisma +
 * InvestigationAccessService — no evidence/reports imports — avoiding cycles.
 */
@Module({
  imports: [InvestigationsModule, ActivityModule],
  controllers: [CommentsController, NotificationsController, PresenceController],
  providers: [
    CommentsService,
    NotificationsService,
    PresenceService,
    CollaborationAccessService,
    CollaborationEventsService,
  ],
  exports: [CollaborationAccessService, NotificationsService],
})
export class CollaborationModule {}
