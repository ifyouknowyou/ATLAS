import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WatchlistsService } from './watchlists.service';
import { WatchlistsController } from './watchlists.controller';

@Module({
  imports: [PrismaModule],
  exports: [WatchlistsService],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
})
export class WatchlistsModule {}