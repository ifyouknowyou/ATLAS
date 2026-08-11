import { Module } from '@nestjs/common';
import { InvestigationsModule } from '../investigations/investigations.module';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [InvestigationsModule],
  controllers: [GraphController],
  providers: [GraphService],
})
export class GraphModule {}
