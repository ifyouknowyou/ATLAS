import type { GraphData } from '../../types';

/**
 * Radial layout: BFS depth rings around a root (defaults to highest-degree
 * node). Deterministic and stable across renders.
 */
export function radialLayout(
  data: GraphData,
  width: number,
  height: number,
  rootId?: string | null,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (data.nodes.length === 0) return positions;

  const root = resolveRoot(data, rootId);
  const adj = adjacency(data);
  const depth = new Map<string, number>([[root, 0]]);
  const order: string[] = [root];
  let frontier = [root];
  let maxDepth = 0;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      const d = depth.get(id)!;
      for (const neighbor of adj.get(id) ?? []) {
        if (depth.has(neighbor)) continue;
        depth.set(neighbor, d + 1);
        if (d + 1 > maxDepth) maxDepth = d + 1;
        order.push(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }

  // Disconnected nodes (no path from root) go to a fallback outer ring so the
  // layout still covers every node.
  for (const node of data.nodes) {
    if (!depth.has(node.id)) {
      depth.set(node.id, maxDepth + 1);
      order.push(node.id);
    }
  }

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.45;
  const rings = maxDepth === 0 ? 1 : maxDepth + 1;
  const byDepth = new Map<number, string[]>();
  for (const id of order) {
    const d = depth.get(id)!;
    const list = byDepth.get(d) ?? [];
    list.push(id);
    byDepth.set(d, list);
  }

  for (const [d, ids] of byDepth) {
    const radius = (d / Math.max(rings - 1, 1)) * maxRadius;
    const angleOffset = d % 2 === 0 ? 0 : Math.PI / ids.length;
    ids.forEach((id, i) => {
      const angle = angleOffset + (i / Math.max(ids.length, 1)) * Math.PI * 2;
      positions.set(id, {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
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