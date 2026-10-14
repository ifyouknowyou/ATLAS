import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';
import { GraphAnalyticsService } from './graph-analytics.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { EntityResolutionService } from './entity-resolution.service';
import { JobQueueService } from '../jobs/job-queue.service';

export interface TriggerAnalysisDto {
  investigationId?: string;
  analysisType:
    | 'CENTRALITY'
    | 'COMMUNITY'
    | 'PATH'
    | 'CLUSTERING'
    | 'CHANGE_DETECTION'
    | 'TEMPORAL'
    | 'GEOSPATIAL';
  params?: Prisma.InputJsonValue;
}

@Injectable()
export class IntelligenceAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    private readonly graph: GraphAnalyticsService,
    private readonly anomaly: AnomalyDetectionService,
    private readonly resolution: EntityResolutionService,
    private readonly jobQueueService: JobQueueService,
  ) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  listAnalyses(investigationId?: string) {
    const where: Record<string, unknown> = {
      organizationId: this.principal.organizationId,
      ...(investigationId ? { investigationId } : {}),
    };
    return this.prisma.graphAnalysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async triggerAnalysis(dto: TriggerAnalysisDto) {
    const orgId = this.principal.organizationId;
    const analysis = await this.prisma.graphAnalysis.create({
      data: {
        organizationId: orgId,
        investigationId: dto.investigationId,
        analysisType: dto.analysisType,
        parameters: dto.params ?? {},
        status: 'QUEUED',
      },
    });

    await this.jobQueueService.enqueue({
      kind: 'GRAPH_ANALYSIS',
      payload: { analysisId: analysis.id, organizationId: orgId, investigationId: dto.investigationId, analysisType: dto.analysisType, params: dto.params },
      organizationId: orgId,
      investigationId: dto.investigationId,
    });

    return analysis;
  }

  listAnomalies(filters: { investigationId?: string; status?: string }) {
    return this.prisma.anomaly.findMany({
      where: {
        organizationId: this.principal.organizationId,
        ...(filters.investigationId ? { investigationId: filters.investigationId } : {}),
        ...(filters.status ? { status: filters.status as 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED' } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewAnomaly(id: string, status: string) {
    const where = { id, organizationId: this.principal.organizationId };
    const current = await this.prisma.anomaly.findFirst({ where });
    if (!current) {
      throw new NotFoundException('Anomaly not found');
    }

    return this.prisma.anomaly.update({
      where: { id },
      data: {
        status: status as 'UNDER_REVIEW' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED',
        reviewedById: this.principal.userId,
        reviewedAt: new Date(),
      },
    });
  }

  listMatches(status?: string) {
    return this.prisma.entityMatchCandidate.findMany({
      where: {
        organizationId: this.principal.organizationId,
        ...(status ? { status: status as 'PENDING' | 'CONFIRMED_MERGE' | 'REJECTED' | 'IGNORED' } : {}),
      },
      orderBy: { similarityScore: 'desc' },
    });
  }
}