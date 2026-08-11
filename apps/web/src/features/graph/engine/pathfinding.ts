import type { GraphData } from '../types';

export interface PathResult {
  nodeIds: string[];
  found: boolean;
  hops: number;
}

/**
 * Bounded BFS shortest path (unweighted) between two nodes.
 * Returns empty + found:false on a miss. Never implies causality — it is a
 * structural property of the given edges only (§13).
 */
export function shortestPath(
  data: GraphData,
  sourceId: string,
  targetId: string,
  maxHops = 4,
): PathResult {
  if (sourceId === targetId) {
    return { nodeIds: [sourceId], found: true, hops: 0 };
  }
  const adj = adjacency(data);
  const parent = new Map<string, string>();
  const visited = new Set<string>([sourceId]);
  const frontier = [sourceId];
  let found = false;

  outer: for (let hop = 1; hop <= maxHops; hop += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbor of adj.get(id) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        parent.set(neighbor, id);
        if (neighbor === targetId) {
          found = true;
          break outer;
        }
        next.push(neighbor);
      }
    }
    frontier.length = 0;
    frontier.push(...next);
  }

  if (!found) return { nodeIds: [], found: false, hops: 0 };

  const path: string[] = [targetId];
  let cursor = targetId;
  while (cursor !== sourceId && parent.has(cursor)) {
    cursor = parent.get(cursor)!;
    path.unshift(cursor);
  }
  return { nodeIds: path, found: true, hops: path.length - 1 };
}

/** Neighborhood preview within `depth` hops (client-side; server is truth). */
export function neighborhood(
  data: GraphData,
  centerId: string,
  depth = 1,
): { nodeIds: string[]; edgeIds: string[]; truncated: boolean } {
  const adj = adjacency(data);
  const visited = new Set<string>([centerId]);
  const frontier = [centerId];
  for (let hop = 0; hop < depth; hop += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const nid of adj.get(id) ?? []) {
        if (!visited.has(nid)) {
          visited.add(nid);
          next.push(nid);
        }
      }
    }
    frontier.length = 0;
    frontier.push(...next);
  }
  const edgeIds = data.edges
    .filter((e) => visited.has(e.sourceId) && visited.has(e.targetId))
    .map((e) => e.id);
  return { nodeIds: [...visited], edgeIds, truncated: false };
}

function adjacency(data: GraphData): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of data.nodes) adj.set(node.id, []);
  for (const edge of data.edges) {
    adj.get(edge.sourceId)?.push(edge.targetId);
    adj.get(edge.targetId)?.push(edge.sourceId);
  }
  return adj;
}