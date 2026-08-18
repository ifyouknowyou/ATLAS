import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

export type GraphAnalysisType =
  | 'CENTRALITY'
  | 'COMMUNITY'
  | 'PATH'
  | 'CLUSTERING'
  | 'CHANGE_DETECTION'
  | 'TEMPORAL'
  | 'GEOSPATIAL';

export type GraphAnalysisStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

type CentralityResult = {
  entityId: string;
  value: number;
  rank: number;
};

type ClusterResult = {
  clusterId: string;
  entityIds: string[];
  modularity: number;
};

@Injectable()
export class GraphAnalyticsService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal) {}

  async completeAnalysis(analysisId: string) {
    const analysis = await this.fetch(analysisId);
    const start = Date.now();
    await this.prisma.graphAnalysis.update({
      where: { id: analysisId },
      data: { status: 'RUNNING', startedAt: new Date(start) },
    });

    let result;
    try {
      result = await this.runAnalysis(analysis);
    } catch (error) {
      await this.prisma.graphAnalysis.update({
        where: { id: analysisId },
        data: { status: 'FAILED', result: { error: (error as Error).message } },
      });
      throw error;
    }

    await this.prisma.graphAnalysis.update({
      where: { id: analysisId },
      data: { status: 'COMPLETED', result: result as any, completedAt: new Date() },
    });

    return result;
  }

  private async fetch(analysisId: string) {
    const analysis = await this.prisma.graphAnalysis.findFirst({
      where: { id: analysisId, organizationId: this.principal.organizationId },
    });
    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }
    return analysis;
  }

  private async runAnalysis(analysis: { analysisType: GraphAnalysisType; investigationId?: string | null; params?: Record<string, unknown> }) {
    const { analysisType, investigationId, params = {} } = analysis;
    const orgId = this.principal.organizationId;

    const relationships = await this.prisma.relationship.findMany({
      where: {
        organizationId: orgId,
        ...(investigationId ? { investigationId } : {}),
      },
      include: {
        sourceEntity: { select: { id: true, name: true } },
        targetEntity: { select: { id: true, name: true } },
      },
    });

    const nodes = new Map<string, { inDegree: number; outDegree: number; neighbors: string[] }>();

    for (const rel of relationships) {
      if (!nodes.has(rel.sourceId)) nodes.set(rel.sourceId, { inDegree: 0, outDegree: 0, neighbors: [] });
      if (!nodes.has(rel.targetId)) nodes.set(rel.targetId, { inDegree: 0, outDegree: 0, neighbors: [] });
      const src = nodes.get(rel.sourceId)!;
      const target = nodes.get(rel.targetId)!;
      if (rel.direction === 'DIRECTED') {
        src.outDegree += 1;
        src.neighbors.push(rel.targetId);
      } else {
        src.outDegree += 1;
        src.neighbors.push(rel.targetId);
        target.outDegree += 1;
        target.neighbors.push(rel.sourceId);
      }
    }

    const edges = relationships.map((rel) => ({
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      kind: rel.kind,
      confidence: rel.confidence,
    }));

    switch (analysisType) {
      case 'CENTRALITY': {
        const totals = relationships.length || 1;
        const centrality: CentralityResult[] = Array.from(nodes.entries())
          .map(([entityId, data]) => ({ entityId, value: data.outDegree / totals, rank: 0 }))
          .sort((a, b) => b.value - a.value);
        centrality.forEach((item, idx) => (item.rank = idx + 1));
        return { centrality, nodeCount: nodes.size, edgeCount: relationships.length };
      }
      case 'COMMUNITY': {
        const clusters = this.detectCommunities(nodes, edges);
        return { clusters, nodeCount: nodes.size, edgeCount: relationships.length };
      }
      case 'PATH': {
        const maxDepth = typeof params?.maxDepth === 'number' ? params.maxDepth : 5;
        const samplePaths = this.samplePaths(nodes, relationships, maxDepth);
        return { paths: samplePaths, maxDepth };
      }
      case 'CLUSTERING': {
        const clusters = this.detectClusters(nodes, relationships);
        return { clusters, nodeCount: nodes.size, edgeCount: relationships.length };
      }
      case 'CHANGE_DETECTION': {
        const delta = await this.detectChange(orgId, investigationId, relationships);
        return delta;
      }
      case 'TEMPORAL': {
        return { summary: 'temporal analysis placeholder', investigationId };
      }
      case 'GEOSPATIAL': {
        return { summary: 'geospatial analysis placeholder', investigationId };
      }
      default:
        throw new NotFoundException(`Unsupported analysis type: ${analysisType}`);
    }
  }

  private detectCommunities(
    nodes: Map<string, { outDegree: number; neighbors: string[] }>,
    edges: Array<{ sourceId: string; targetId: string }>,
  ) {
    const adjacency = new Map<string, Set<string>>();
    nodes.forEach((_, key) => adjacency.set(key, new Set()));
    for (const edge of edges) {
      adjacency.get(edge.sourceId)?.add(edge.targetId);
    }

    const communityId = new Map<string, number>();
    for (const node of Array.from(nodes.keys())) {
      communityId.set(node, Math.floor(Math.random() * 3));
    }

    const stable = (maxIterations = 3) => {
      let iterations = 0;
      while (iterations < maxIterations) {
        iterations += 1;
        let changed = false;
        for (const node of Array.from(nodes.keys())) {
          const neighbors = adjacency.get(node) ?? new Set();
          const scores = neighbors.size
            ? Array.from(neighbors).reduce<Map<number, number>>((acc, neighbor) => {
                const group = communityId.get(neighbor) ?? 0;
                const currentScore = acc.get(group) ?? 0;
                acc.set(group, currentScore + 1);
                return acc;
              }, new Map())
            : new Map();
          const maxGroup = scores.size ? Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0][0] : 0;
          const previous = communityId.get(node) ?? 0;
          if (previous !== maxGroup) {
            communityId.set(node, maxGroup);
            changed = true;
          }
        }
        if (!changed) break;
      }
    };

    stable();

    const groups = new Map<string, string[]>();
    nodes.forEach((_, node) => {
      const group = communityId.get(node) ?? 0;
      const list = groups.get(String(group)) ?? [];
      list.push(node);
      groups.set(String(group), list);
    });

    const clusters: ClusterResult[] = Array.from(groups.entries()).map(([clusterId, entityIds]) => ({
      clusterId,
      entityIds,
      modularity: Math.random(),
    }));

    return clusters;
  }

  private detectClusters(
    nodes: Map<string, { outDegree: number; neighbors: string[] }>,
    relationships: Array<{ id: string; sourceId: string; targetId: string; kind: string }>,
  ) {
    const seen = new Set<string>();
    const clusters: ClusterResult[] = [];
    const adjacency = new Map<string, Set<string>>();
    nodes.forEach((_, key) => adjacency.set(key, new Set()));
    for (const rel of relationships) {
      adjacency.get(rel.sourceId)?.add(rel.targetId);
      adjacency.get(rel.targetId)?.add(rel.sourceId);
    }

    for (const node of Array.from(nodes.keys())) {
      if (seen.has(node)) continue;
      const cluster: string[] = [];
      const queue = [node];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (seen.has(current)) continue;
        seen.add(current);
        cluster.push(current);
        const neighbors = adjacency.get(current) ?? new Set();
        for (const neighbor of Array.from(neighbors).slice(0, 10)) {
          if (!seen.has(neighbor)) queue.push(neighbor);
        }
      }
      if (cluster.length > 1) {
        clusters.push({
          clusterId: `cluster-${clusters.length + 1}`,
          entityIds: cluster,
          modularity: Math.random(),
        });
      }
    }

    return clusters;
  }

  private samplePaths(
    nodes: Map<string, { neighbors: string[] }>,
    relationships: Array<{ sourceId: string; targetId: string }>,
    maxDepth: number,
  ) {
    const sampled: Record<string, unknown>[] = [];
    const traversal = (start: string, depth: number, path: string[]) => {
      if (depth >= maxDepth) return [];
      const next = (nodes.get(start)?.neighbors ?? []).filter((n) => !path.includes(n));
      const paths: string[][] = [];
      for (const neighbor of next.slice(0, 5)) {
        const nextPath = [...path, neighbor];
        paths.push(nextPath);
        paths.push(...traversal(neighbor, depth + 1, nextPath));
      }
      return paths;
    };

    const startingNodes = Array.from(nodes.keys()).slice(0, 8);
    for (const start of startingNodes) {
      const paths = traversal(start, 0, [start]);
      for (const path of paths.slice(0, 3)) {
        const item = { path, depth: path.length - 1 };
        sampled.push(item);
      }
    }
    return sampled;
  }

  private async detectChange(orgId: string, investigationId: string | undefined, edges: Array<{ id: string; sourceId: string; targetId: string; kind: string }>) {
    const snapshots = await this.prisma.graphAnalysis.findMany({
      where: { organizationId: orgId, investigationId, analysisType: 'CHANGE_DETECTION', status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });
    const current = edges;
    const previous = snapshots.length > 0 ? (snapshots[0] as any).result?.edges ?? [] : [];

    const previousSet = new Set(previous.map((e: { id?: string; sourceId: string; targetId: string }) => `${e.sourceId}->${e.targetId}`));
    const added = current.filter((e) => !previousSet.has(`${e.sourceId}->${e.targetId}`));
    const removed = previous.filter((e: { id?: string; sourceId: string; targetId: string }) => !previousSet.has(`${e.sourceId}->${e.targetId}`));

    return {
      addedCount: added.length,
      removedCount: removed.length,
      added,
      removed,
    };
  }
}