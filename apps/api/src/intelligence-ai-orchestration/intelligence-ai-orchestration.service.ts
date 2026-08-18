import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';
import { IntelligenceAnalyticsService } from '../intelligence-analytics/intelligence-analytics.service';
import { GraphAnalyticsService } from '../intelligence-analytics/graph-analytics.service';
import { AnomalyDetectionService } from '../intelligence-analytics/anomaly-detection.service';
import { EntityResolutionService } from '../intelligence-analytics/entity-resolution.service';
import { AdvancedDetectionService } from '../intelligence-analytics/advanced-detection.service';
import { JobQueueService } from '../jobs/job-queue.service';
import { RulesService } from '../rules/rules.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { JsonValue, InputJsonValue } from '@prisma/client/runtime/library';

export type OrchestrationTaskType =
  | 'THREAT_ANALYSIS'
  | 'NETWORK_INVESTIGATION'
  | 'ENTITY_PROFILING'
  | 'ANOMALY_HUNTING'
  | 'PREDICTIVE_ANALYTICS'
  | 'INCIDENT_RESPONSE'
  | 'COMPLIANCE_CHECK';

export type OrchestrationStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface OrchestrationContext {
  investigationId?: string;
  entityIds?: string[];
  timeRange?: { start: Date; end: Date };
  params?: InputJsonValue;
}

export interface OrchestrationResult {
  taskId: string;
  status: OrchestrationStatus;
  results: Record<string, any>;
  metadata?: InputJsonValue;
  error?: string;
}

@Injectable()
export class IntelligenceAIOrchestrationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    private readonly analytics: IntelligenceAnalyticsService,
    private readonly graph: GraphAnalyticsService,
    private readonly anomaly: AnomalyDetectionService,
    private readonly resolution: EntityResolutionService,
    private readonly advanced: AdvancedDetectionService,
    private readonly jobQueue: JobQueueService,
    private readonly rules: RulesService,
    private readonly workflows: WorkflowsService,
  ) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  async orchestrate(
    taskType: OrchestrationTaskType,
    context: OrchestrationContext,
  ): Promise<OrchestrationResult> {
    const orgId = this.principal.organizationId;
    const taskId = `orchestration_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    try {
      // Enqueue the orchestration as a background job
      const { created } = await this.jobQueue.enqueue({
        kind: 'ORCHESTRATION_TASK',
        payload: {
          taskId,
          taskType,
          context,
          organizationId: orgId,
          triggeredById: this.principal.userId,
        },
        organizationId: orgId,
        investigationId: context.investigationId,
        createdById: this.principal.userId,
      });

      if (!created) {
        // If not created due to deduplication, return existing status
        return this.getOrchestrationStatus(taskId);
      }

      // For immediate execution in development/testing, we could run synchronously
      // In production, this would be handled by the job queue
      const result = await this.executeOrchestration(
        taskType,
        context,
        taskId,
      );

      return {
        taskId,
        status: 'COMPLETED',
        results: result,
        metadata: {
          orchestratedAt: new Date().toISOString(),
          organizationId: orgId,
        },
      };
    } catch (error) {
      return {
        taskId,
        status: 'FAILED',
        results: {},
        error: (error as Error).message,
      };
    }
  }

  private async executeOrchestration(
    taskType: OrchestrationTaskType,
    context: OrchestrationContext,
    taskId: string,
  ): Promise<Record<string, any>> {
    const orgId = this.principal.organizationId;

    switch (taskType) {
      case 'THREAT_ANALYSIS':
        return await this.performThreatAnalysis(context);
      case 'NETWORK_INVESTIGATION':
        return await this.performNetworkInvestigation(context);
      case 'ENTITY_PROFILING':
        return await this.performEntityProfiling(context);
      case 'ANOMALY_HUNTING':
        return await this.performAnomalyHunting(context);
      case 'PREDICTIVE_ANALYTICS':
        return await this.performPredictiveAnalytics(context);
      case 'INCIDENT_RESPONSE':
        return await this.performIncidentResponse(context);
      case 'COMPLIANCE_CHECK':
        return await this.performComplianceCheck(context);
      default:
        throw new Error(`Unknown orchestration task type: ${taskType}`);
    }
  }

  private async performThreatAnalysis(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Run entity resolution on key entities
    if ((context.entityIds?.length ?? 0) > 0) {
      const entityMatches = await Promise.all(
        context.entityIds!.map((entityId) =>
          this.resolution.findCandidates(entityId),
        ),
      );
      results.entityResolution = entityMatches;
    }

    // 2. Run graph analytics for threat detection
    const graphAnalysis = await this.analytics.triggerAnalysis({
      analysisType: 'COMMUNITY',
      investigationId: context.investigationId,
      params: {
        ...(context.params as Record<string, unknown>),
        threatDetection: true,
      },
    });
    results.threatGraphAnalysis = graphAnalysis;

    // 3. Run anomaly detection on network traffic
    const anomalies = await this.anomaly.detect(
      this.principal.organizationId,
      context.investigationId,
    );
    results.anomalies = anomalies;

    // 4. Apply intelligence rules for threat scoring
    // This would involve checking relevant rules and calculating threat scores

    return results;
  }

  private async performNetworkInvestigation(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Path analysis between entities
    if (context.entityIds && context.entityIds.length >= 2) {
      const pathAnalysis = await this.analytics.triggerAnalysis({
        analysisType: 'PATH',
        investigationId: context.investigationId,
        params: {
          sourceEntity: context.entityIds[0],
          targetEntity: context.entityIds[1],
          ...(context.params as Record<string, unknown>),
        },
      });
      results.pathAnalysis = pathAnalysis;
    }

    // 2. Centrality analysis to find key nodes
    const centralityAnalysis = await this.analytics.triggerAnalysis({
      analysisType: 'CENTRALITY',
      investigationId: context.investigationId,
      params: context.params,
    });
    results.centralityAnalysis = centralityAnalysis;

    // 3. Temporal analysis for activity patterns
    if (context.timeRange) {
      const temporalAnalysis = await this.analytics.triggerAnalysis({
        analysisType: 'TEMPORAL' as const,
        investigationId: context.investigationId,
        params: {
          timeRange: context.timeRange,
          ...(context.params as Record<string, unknown>),
        },
      });
      results.temporalAnalysis = temporalAnalysis;
    }

    return results;
  }

  private async performEntityProfiling(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    if (!context.entityIds?.length) {
      return results;
    }

    // Profile each entity
    const profiles = await Promise.all(
      context.entityIds.map(async (entityId) => {
        // 1. Get entity connections via graph analysis
        const connections = await this.analytics.triggerAnalysis({
          analysisType: 'COMMUNITY',
          params: { focusEntity: entityId },
        });

        // 2. Check for anomalies associated with entity
        const anomalies = await this.anomaly.detect(
          this.principal.organizationId,
          undefined, // investigationId - could filter by entity in future
        );

        // 3. Run entity resolution to find related entities
        const relatedEntities = await this.resolution.findCandidates(entityId);

        return {
          entityId,
          connections,
          anomalies,
          relatedEntities,
        };
      }),
    );

    results.entityProfiles = profiles;
    return results;
  }

  private async performAnomalyHunting(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Run advanced anomaly detection
    const anomalies = await this.advanced.detectAnomalies(
      this.principal.organizationId,
      context.investigationId,
    );
    results.advancedAnomalies = anomalies;

    // 2. Run graph clustering to find anomalous communities
    const clustering = await this.analytics.triggerAnalysis({
      analysisType: 'CLUSTERING',
      investigationId: context.investigationId,
      params: context.params,
    });
    results.communityClustering = clustering;

    // 3. Run temporal analysis to find temporal anomalies
    if (context.timeRange) {
      const temporal = await this.analytics.triggerAnalysis({
        analysisType: 'TEMPORAL',
        investigationId: context.investigationId,
        params: {
          anomalyDetection: true,
          timeRange: context.timeRange,
          ...(context.params as Record<string, unknown>),
        },
      });
      results.temporalAnalysis = temporal;
    }

    return results;
  }

  private async performPredictiveAnalytics(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // This would integrate with ML models for predictions
    // For now, we'll simulate with existing analytics

    // 1. Change detection to identify trends
    const changeDetection = await this.analytics.triggerAnalysis({
      analysisType: 'CHANGE_DETECTION',
      investigationId: context.investigationId,
      params: {
        predictive: true,
        ...(context.params as Record<string, unknown>),
      },
    });
    results.trendAnalysis = changeDetection;

    // 2. Path analysis for predicting future entity interactions
    if (context.entityIds && context.entityIds.length >= 2) {
      const pathPrediction = await this.analytics.triggerAnalysis({
        analysisType: 'PATH',
        investigationId: context.investigationId,
        params: {
          predictive: true,
          ...(context.params as Record<string, unknown>),
        },
      });
      results.pathPrediction = pathPrediction;
    }

    return results;
  }

  private async performIncidentResponse(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Immediate entity resolution for IOCs (Indicators of Compromise)
    if (context.entityIds && context.entityIds.length) {
      const iocResolution = await Promise.all(
        context.entityIds.map((entityId) =>
          this.resolution.findCandidates(entityId),
        ),
      );
      results.iocResolution = iocResolution;
    }

    // 2. Graph analysis to understand blast radius
    const blastRadius = await this.analytics.triggerAnalysis({
      analysisType: 'COMMUNITY',
      investigationId: context.investigationId,
      params: {
        blastRadius: true,
        ...(context.params as Record<string, unknown>),
      },
    });
    results.blastRadiusAnalysis = blastRadius;

    // 3. Temporal analysis for incident timeline
    if (context.timeRange) {
      const timeline = await this.analytics.triggerAnalysis({
        analysisType: 'TEMPORAL',
        investigationId: context.investigationId,
        params: {
          incidentTimeline: true,
          timeRange: context.timeRange,
          ...(context.params as Record<string, unknown>),
        },
      });
      results.incidentTimeline = timeline;
    }

    return results;
  }

  private async performComplianceCheck(
    context: OrchestrationContext,
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Check entity relationships against compliance rules
    // 2. Run analytics to detect policy violations
    // 3. Generate compliance report

    // For now, run a general community analysis
    const complianceScan = await this.analytics.triggerAnalysis({
      analysisType: 'COMMUNITY',
      investigationId: context.investigationId,
      params: {
        complianceCheck: true,
        ...(context.params as Record<string, unknown>),
      },
    });
    results.complianceScan = complianceScan;

    // Check relevant intelligence rules
    const rules = await this.rules.list(this.principal.organizationId);
    results.applicableRules = rules
      .filter((rule) => rule.isActive)
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
      }));

    return results;
  }

  async getOrchestrationStatus(taskId: string): Promise<OrchestrationResult> {
    // In a full implementation, this would check the job queue or database
    // For now, return a placeholder
    return {
      taskId,
      status: 'QUEUED',
      results: {},
      metadata: { checkedAt: new Date() },
    };
  }

  async listOrchestrations(
    organizationId?: string,
    limit = 100,
  ): Promise<Record<string, any>[]> {
    // This would query orchestration runs from database
    // For now, return empty array as placeholder
    return [];
  }
}