import type { GraphData } from '../../types';

/**
 * Hierarchical layout: BFS levels (topological-ish) stacked vertically with
 * horizontal distribution per level. Deterministic and stable.
 */
export function hierarchicalLayout(
  data: GraphData,
  width: number,
  height: number,
  rootId?: string | null,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (data.nodes.length === 0) return positions;

  const root = resolveRoot(data, rootId);
  const adj = adjacency(data);
  const level = new Map<string, number>([[root, 0]]);
  const order: string[] = [root];
  let frontier = [root];
  let maxLevel = 0;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      const l = level.get(id)!;
      for (const neighbor of adj.get(id) ?? []) {
        if (level.has(neighbor)) continue;
        level.set(neighbor, l + 1);
        if (l + 1 > maxLevel) maxLevel = l + 1;
        order.push(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }

  // Disconnected nodes go to a fallback bottom level so every node is placed.
  for (const node of data.nodes) {
    if (!level.has(node.id)) {
      level.set(node.id, maxLevel + 1);
      order.push(node.id);
    }
  }

  const byLevel = new Map<number, string[]>();
  for (const id of order) {
    const l = level.get(id)!;
    const list = byLevel.get(l) ?? [];
    list.push(id);
    byLevel.set(l, list);
  }

  const top = height * 0.1;
  const bottom = height * 0.9;
  const levels = maxLevel === 0 ? 1 : maxLevel + 1;
  for (const [l, ids] of byLevel) {
    const y = top + (l / Math.max(levels - 1, 1)) * (bottom - top);
    const xInset = width * 0.08;
    const usable = width - xInset * 2;
    ids.forEach((id, i) => {
      const x =
        ids.length === 1
          ? width / 2
          : xInset + (i / (ids.length - 1)) * usable;
      positions.set(id, { x, y });
    });
  }
  return positions;
}

function resolveRoot(data: GraphData, rootId?: string | null): string {
  if (rootId && data.nodes.some((n) => n.id === rootId)) return rootId;
  let hub = data.nodes[0].id;
  let maxDegree = -1;
  for (const node of data.nodes) {
    const degree = data.edges.filter((e) => e.sourceId === node.id || e.targetId === node.id).length;
    if (degree > maxDegree) {
      maxDegree = degree;
      hub = node.id;
    }
  }
  return hub;
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