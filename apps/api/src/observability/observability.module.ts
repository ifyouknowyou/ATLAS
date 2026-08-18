import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { StructuredLoggerService } from './structured-logger.service';
import { RequestTrackerMiddleware } from './request-tracker.middleware';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule],
  providers: [StructuredLoggerService, HealthService],
  exports: [StructuredLoggerService],
  controllers: [HealthController],
})
export class ObservabilityModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTrackerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}