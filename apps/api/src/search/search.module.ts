import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { InvestigationsModule } from '../investigations/investigations.module';

@Module({
  imports: [InvestigationsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}