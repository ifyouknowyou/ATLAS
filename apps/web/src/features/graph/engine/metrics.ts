import type { GraphData } from '../types';

/** Bounding box of node positions in world units. */
export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsOf(nodes: Array<{ x: number; y: number }>): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  }
  if (!Number.isFinite(minX)) {
    return { minX: -1, minY: -1, maxX: 1, maxY: 1 };
  }
  return { minX, minY, maxX, maxY };
}

export function centerOf(bounds: Bounds): { x: number; y: number } {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/** Largest component size — drives clustering decisions. */
export function largestComponentSize(data: GraphData): number {
  const adj = adjacencyOf(data);
  const visited = new Set<string>();
  let largest = 0;
  for (const node of data.nodes) {
    if (visited.has(node.id)) continue;
    const stack = [node.id];
    let size = 0;
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      size += 1;
      for (const nid of adj.get(id) ?? []) {
        if (!visited.has(nid)) stack.push(nid);
      }
    }
    if (size > largest) largest = size;
  }
  return largest;
}

export function adjacencyOf(data: GraphData): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of data.nodes) adj.set(node.id, []);
  for (const edge of data.edges) {
    adj.get(edge.sourceId)?.push(edge.targetId);
    adj.get(edge.targetId)?.push(edge.sourceId);
  }
  return adj;
}

export function degreeOf(data: GraphData, nodeId: string): number {
  let degree = 0;
  for (const edge of data.edges) {
    if (edge.sourceId === nodeId || edge.targetId === nodeId) degree += 1;
  }
  return degree;
}

/** Counts by entity type (drives filter panel + legend). */
export function typeCounts(data: GraphData): Map<string, number> {
  const counts = new Map<string, number>();
  for (const node of data.nodes) {
    counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
  }
  return counts;
}