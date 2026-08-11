import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { PermissionsGuard } from './rbac/permissions.guard';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { EntitiesModule } from './entities/entities.module';
import { TasksModule } from './tasks/tasks.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { EvidenceModule } from './evidence/evidence.module';
import { NotesModule } from './notes/notes.module';
import { SearchModule } from './search/search.module';
import { GraphModule } from './graph/graph.module';
import { GeoModule } from './geo/geo.module';
import { TimelineModule } from './timeline/timeline.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AiModule } from './ai/ai.module';
import { ActivityModule } from './common/activity.service';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    ActivityModule,
    HealthModule,
    UsersModule,
    OrganizationsModule,
    WorkspacesModule,
    InvestigationsModule,
    EntitiesModule,
    TasksModule,
    RelationshipsModule,
    EvidenceModule,
    NotesModule,
    SearchModule,
    GraphModule,
    GeoModule,
    TimelineModule,
    RealtimeModule,
    AiModule,
  ],
  providers: [
    // Authentication first, then permission evaluation, for every request.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}