import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [PrismaModule, RealtimeModule],
  exports: [AlertsService],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}