import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';

export type EntityMatchStatus = 'PENDING' | 'CONFIRMED_MERGE' | 'REJECTED' | 'IGNORED';

interface MatchCandidate {
  id: string;
  baseEntityId: string;
  matchEntityId: string;
  similarityScore: number;
  matchFactors: { nameScore: number; attrScore: number; relScore: number; overallScore: number };
  status: EntityMatchStatus;
}

@Injectable()
export class EntityResolutionService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  async findCandidates(baseEntityId: string, limit = 25) {
    const orgId = this.principal.organizationId;
    const base = await this.prisma.entity.findFirst({ where: { id: baseEntityId, organizationId: orgId } });
    if (!base) {
      throw new NotFoundException('Entity not found');
    }
    const candidates = await this.prisma.entity.findMany({
      where: { organizationId: orgId, id: { not: baseEntityId } },
      take: limit,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        tags: true,
        properties: true,
      },
    });

    const results: MatchCandidate[] = candidates.map((entity) => ({
      id: `${baseEntityId}-${entity.id}`,
      baseEntityId,
      matchEntityId: entity.id,
      similarityScore: this.computeSimilarity(base, entity),
      matchFactors: this.computeFactors(base, entity),
      status: 'PENDING',
    }));

    const ordered = results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 50);

    await this.prisma.$transaction(
      ordered.map((candidate) =>
        this.prisma.entityMatchCandidate.upsert({
          where: { id: candidate.id },
          update: { similarityScore: candidate.similarityScore, matchFactors: candidate.matchFactors },
          create: {
            ...candidate,
            organizationId: orgId,
            matchFactors: candidate.matchFactors,
          },
        }),
      ),
    );

    return ordered;
  }

  async decide(candidateId: string, status: EntityMatchStatus) {
    const candidate = await this.prisma.entityMatchCandidate.findFirst({
      where: { id: candidateId, organizationId: this.principal.organizationId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    return this.prisma.entityMatchCandidate.update({
      where: { id: candidateId },
      data: {
        status,
        reviewedById: this.principal.userId,
        completedAt: new Date(),
      },
    });
  }

  private computeSimilarity(base: { name?: string; type?: string; tags?: unknown }, candidate: { name?: string; type?: string; tags?: unknown }) {
    const nameScore = this.similarStrings(base.name ?? '', candidate.name ?? '');
    const attrScore = 0.5;
    const relScore = 0.5;
    return nameScore * 0.5 + attrScore * 0.3 + relScore * 0.2;
  }

  private computeFactors(base: { name?: string; type?: string; tags?: unknown }, candidate: { name?: string; type?: string; tags?: unknown }) {
    const nameScore = this.similarStrings(base.name ?? '', candidate.name ?? '');
    return { nameScore, attrScore: 0.5, relScore: 0.5, overallScore: nameScore * 0.5 + 0.5 };
  }

  private similarStrings(a: string, b: string) {
    if (!a || !b) return 0;
    const matrix = buildMatrix(a, b);
    return matrix[a.length][b.length];
  }
}

function buildMatrix(a: string, b: string): number[][] {
  const matrix = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix;
}