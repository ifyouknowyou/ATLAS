import { Test } from '@nestjs/testing';
import { IntelligenceAnalyticsModule } from './intelligence-analytics.module';
import { GraphAnalyticsService } from './graph-analytics.service';

describe('IntelligenceAnalyticsModule', () => {
  it('registers analytics providers', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [IntelligenceAnalyticsModule] }).compile();
    const graph = await moduleRef.resolve(GraphAnalyticsService);
    expect(graph).toBeDefined();
  });
});