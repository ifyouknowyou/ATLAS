import type { Cluster, GraphData } from '../../types';

/**
 * Topology clustering (Phase 3 §9).
 *
 * Louvain-lite: two-pass modularity optimization over the given edges.
 * It is an analytical visualization — "communities" derived from the graph,
 * never presented as proof of real-world association. When the graph is
 * sparse/disconnected, fall back to connected components so every cluster is
 * internally connected.
 */

export function clusterLouvain(data: GraphData): Cluster[] {
  if (data.nodes.length === 0) return [];

  const ids = data.nodes.map((n) => n.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  // Undirected adjacency with edge weights (confidence → weight).
  const adj: Array<Map<number, number>> = Array.from({ length: n }, () => new Map());
  for (const edge of data.edges) {
    const s = index.get(edge.sourceId);
    const t = index.get(edge.targetId);
    if (s == null || t == null) continue;
    const w = 0.5 + (edge.confidence / 100) * 0.5;
    adj[s].set(t, (adj[s].get(t) ?? 0) + w);
    adj[t].set(s, (adj[t].get(s) ?? 0) + w);
  }

  const communities = ids.map((_, i) => i);
  let improved = true;
  let passes = 0;
  // Pass 1: greedy local moves.
  while (improved && passes < 2) {
    improved = false;
    passes += 1;
    for (let node = 0; node < n; node += 1) {
      const weightsByCommunity = new Map<number, number>();
      let selfWeight = 0;
      for (const [neighbor, w] of adj[node]) {
        if (neighbor === node) selfWeight += w;
        else {
          const c = communities[neighbor];
          weightsByCommunity.set(c, (weightsByCommunity.get(c) ?? 0) + w);
        }
      }
      const current = communities[node];
      const currentWeight = weightsByCommunity.get(current) ?? selfWeight;
      let best = current;
      let bestGain = 0;
      for (const [c, w] of weightsByCommunity) {
        if (c === current) continue;
        const gain = w - currentWeight;
        if (gain > bestGain) {
          bestGain = gain;
          best = c;
        }
      }
      if (best !== current) {
        communities[node] = best;
        improved = true;
      }
    }
  }

  // Pass 2: relabel densely-connected communities deterministically.
  const labelByCommunity = new Map<number, number>();
  let nextLabel = 0;
  for (let i = 0; i < n; i += 1) {
    const c = communities[i];
    if (!labelByCommunity.has(c)) {
      labelByCommunity.set(c, nextLabel);
      nextLabel += 1;
    }
    communities[i] = labelByCommunity.get(c)!;
  }

  const groups = new Map<number, string[]>();
  communities.forEach((c, i) => {
    const list = groups.get(c) ?? [];
    list.push(ids[i]);
    groups.set(c, list);
  });

  return [...groups.entries()]
    .map(([c, nodeIds]) => ({
      id: `c${c}`,
      label: dominantLabel(data, nodeIds),
      nodeIds,
    }))
    .sort((a, b) => b.nodeIds.length - a.nodeIds.length);
}

/** Fallback: connected components, used for sparse/disconnected graphs. */
export function clusterConnectedComponents(data: GraphData): Cluster[] {
  const adj = new Map<string, string[]>();
  for (const node of data.nodes) adj.set(node.id, []);
  for (const edge of data.edges) {
    adj.get(edge.sourceId)?.push(edge.targetId);
    adj.get(edge.targetId)?.push(edge.sourceId);
  }
  const visited = new Set<string>();
  const clusters: Cluster[] = [];
  let id = 0;
  for (const node of data.nodes) {
    if (visited.has(node.id)) continue;
    const stack = [node.id];
    const group: string[] = [];
    while (stack.length > 0) {
      const nid = stack.pop()!;
      if (visited.has(nid)) continue;
      visited.add(nid);
      group.push(nid);
      for (const nb of adj.get(nid) ?? []) if (!visited.has(nb)) stack.push(nb);
    }
    clusters.push({ id: `cc${id}`, label: dominantLabel(data, group), nodeIds: group });
    id += 1;
  }
  return clusters.sort((a, b) => b.nodeIds.length - a.nodeIds.length);
}

/** Choose the best cluster label: dominant node type, else highest-degree node. */
function dominantLabel(data: GraphData, nodeIds: string[]): string {
  const typeCounts = new Map<string, number>();
  for (const id of nodeIds) {
    const node = data.nodes.find((x) => x.id === id);
    if (!node) continue;
    typeCounts.set(node.type, (typeCounts.get(node.type) ?? 0) + 1);
  }
  let bestType = 'OTHER';
  let bestCount = 0;
  for (const [type, count] of typeCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestType = type;
    }
  }
  if (bestCount > 1) return bestType;

  let hub: string | undefined;
  let maxDegree = -1;
  for (const id of nodeIds) {
    const node = data.nodes.find((x) => x.id === id);
    if (!node) continue;
    const degree = data.edges.filter((e) => e.sourceId === id || e.targetId === id).length;
    if (degree > maxDegree) {
      maxDegree = degree;
      hub = node.name;
    }
  }
  return hub ?? bestType;
}

/** Clusters with a size threshold; small groups merge into "OTHER". */
export function clusterGraph(data: GraphData, minClusterSize = 1): Cluster[] {
  const louvain = clusterLouvain(data);
  if (louvain.length <= 1) {
    const cc = clusterConnectedComponents(data);
    return cc.length > 1 ? cc : louvain;
  }
  const large = louvain.filter((c) => c.nodeIds.length >= minClusterSize);
  const small = louvain.filter((c) => c.nodeIds.length < minClusterSize);
  if (small.length === 0) return large;
  const merged: Cluster = {
    id: 'other',
    label: 'OTHER',
    nodeIds: small.flatMap((c) => c.nodeIds),
  };
  return [...large, merged].sort((a, b) => b.nodeIds.length - a.nodeIds.length);
}