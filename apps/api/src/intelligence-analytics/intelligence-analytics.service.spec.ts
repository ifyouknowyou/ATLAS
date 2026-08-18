import { Test } from '@nestjs/testing';
import { IntelligenceAnalyticsModule } from './intelligence-analytics.module';

describe('IntelligenceAnalyticsModule', () => {
  it('registers analytics providers', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [IntelligenceAnalyticsModule] }).compile();
    const graph = moduleRef.get('GraphAnalyticsService');
    expect(graph).toBeDefined();
  });
});