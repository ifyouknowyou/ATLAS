import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AdvancedDetectionService {
  async detectAnomalies(_orgId: string, _investigationId?: string) {
    throw new NotImplementedException('Advanced anomaly detection is not implemented');
  }

  async resolveEntities(_orgId: string, _baseEntityId: string) {
    throw new NotImplementedException('Advanced entity resolution is not implemented');
  }
}