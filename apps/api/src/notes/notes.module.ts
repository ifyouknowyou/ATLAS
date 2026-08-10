import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { InvestigationsModule } from '../investigations/investigations.module';
import { ActivityModule } from '../common/activity.service';

@Module({
  imports: [InvestigationsModule, ActivityModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}