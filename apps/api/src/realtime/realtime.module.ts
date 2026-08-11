import { Global, Module } from '@nestjs/common';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';

/**
 * Realtime module (Phase 3).
 * @Global so ActivityService can broadcast deltas without an import cycle.
 * PrismaModule and JwtModule are already registered globally by their own
 * modules, so no explicit imports are needed here.
 */
@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}