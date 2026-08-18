import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';
import { JobQueueService } from '../jobs/job-queue.service';

export type AnomalyType =
  | 'TEMPORAL_SPIKE'
  | 'TEMPORAL_DROP'
  | 'RELATIONSHIP_DENSITY'
  | 'DEGREE_ANOMALY'
  | 'CLUSTERING_COEFFICIENT'
  | 'PATTERN_DEVIATION'
  | 'GEOSPATIAL_OUTLIER'
  | 'ATTRIBUTE_DRIFT';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'FALSE_POSITIVE'
  | 'RESOLVED';

@Injectable()
export class AnomalyDetectionService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest, private readonly jobQueueService: JobQueueService) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  async detect(orgId: string, investigationId?: string) {
    return this.prisma.anomaly.findMany({
      where: { organizationId: orgId, investigationId, severity: { in: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async enqueue(orgId: string, investigationId: string, anomalyType: AnomalyType, context: Record<string, unknown>) {
    const job = await this.jobQueueService.enqueue({
      kind: 'ANOMALY_DETECTION',
      payload: { orgId, investigationId, anomalyType, context },
      organizationId: orgId,
      investigationId: investigationId,
    });
    return job;
  }

  async markReviewed(id: string, status: AnomalyStatus) {
    const anomaly = await this.prisma.anomaly.findFirst({
      where: { id, organizationId: this.principal.organizationId },
    });
    if (!anomaly) {
      throw new NotFoundException('Anomaly not found');
    }
    return this.prisma.anomaly.update({
      where: { id },
      data: {
        status,
        reviewedById: this.principal.userId,
        resolvedAt: new Date(),
      },
    });
  }
}