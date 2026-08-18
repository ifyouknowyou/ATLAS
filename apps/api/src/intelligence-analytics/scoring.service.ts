import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';

export type IntelligenceDimension =
  | 'analytical_confidence'
  | 'investigation_activity'
  | 'goodness_of_fit'
  | 'link_power'
  | 'fragmentation'
  | 'temporal_recency';

export interface IntelligenceScore {
  entityId: string;
  dimensions: Record<IntelligenceDimension, number>;
  overall: number;
}

@Injectable()
export class IntelligenceScoringService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  async score(entityId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, organizationId: this.principal.organizationId },
      include: { outgoingRelationships: true, incomingRelationships: true },
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    const analyticalConfidence = entity.confidence;
    const inLinks = (entity.incomingRelationships ?? []).length;
    const outLinks = (entity.outgoingRelationships ?? []).length;
    const fragmentation = this.measureFragmentation(entity.incomingRelationships ?? []);

    const dimensions = {
      analytical_confidence: analyticalConfidence,
      investigation_activity: Math.min(1, (entity.incomingRelationships?.length ?? 0) / 10),
      goodness_of_fit: 0.5,
      link_power: Math.min(1, (inLinks + outLinks) / 20),
      fragmentation,
      temporal_recency: 0.5,
    } as Record<IntelligenceDimension, number>;

    const overall =
      (dimensions.analytical_confidence +
        dimensions.investigation_activity +
        dimensions.goodness_of_fit +
        dimensions.link_power +
        dimensions.fragmentation +
        dimensions.temporal_recency) /
      6;

    return { entityId, dimensions, overall } satisfies IntelligenceScore;
  }

  private measureFragmentation(incomingRelationships: { investigationId: string | null }[]): number {
    const investigations = new Set(incomingRelationships.map((link) => link.investigationId).filter((id): id is string => id !== null));
    return investigations.size <= 1 ? 0.2 : 0.7;
  }
}