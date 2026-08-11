import { Module } from '@nestjs/common';
import { InvestigationsModule } from '../investigations/investigations.module';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [InvestigationsModule],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}