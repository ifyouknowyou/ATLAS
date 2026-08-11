import { Module } from '@nestjs/common';
import { InvestigationsModule } from '../investigations/investigations.module';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

@Module({
  imports: [InvestigationsModule],
  controllers: [GeoController],
  providers: [GeoService],
})
export class GeoModule {}