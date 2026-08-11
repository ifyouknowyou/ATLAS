import type { FilterState, GraphData } from '../types';

export type { FilterState };

/** No-op default filter (nothing excluded). */
export function emptyFilter(): FilterState {
  return {
    entityTypes: new Set<string>(),
    relationshipTypes: new Set<string>(),
    investigationId: null,
    geoRegion: null,
  };
}

/** Whether a filter excludes anything (for "reset" affordances). */
export function isFiltering(filter: FilterState): boolean {
  return (
    filter.entityTypes.size > 0 ||
    filter.relationshipTypes.size > 0 ||
    filter.investigationId != null ||
    filter.geoRegion != null
  );
}

function nodePasses(node: { type: string; latitude?: number | null; longitude?: number | null; investigationId?: string | null }, filter: FilterState): boolean {
  if (filter.entityTypes.size > 0 && !filter.entityTypes.has(node.type)) {
    return false;
  }
  // When filtering by an investigation, keep org-level entities too (they are
  // shared context, matching the server's `listAccessWhere` semantics).
  if (
    filter.investigationId != null &&
    node.investigationId != null &&
    node.investigationId !== filter.investigationId
  ) {
    return false;
  }
  if (filter.geoRegion) {
    const lat = node.latitude;
    const lng = node.longitude;
    if (lat == null || lng == null) return false;
    if (lat < filter.geoRegion.minLat || lat > filter.geoRegion.maxLat || lng < filter.geoRegion.minLng || lng > filter.geoRegion.maxLng) {
      return false;
    }
  }
  return true;
}

/** Keep nodes that pass + edges whose endpoints both remain. */
export function applyFilters(data: GraphData, filter: FilterState): GraphData {
  if (
    filter.entityTypes.size === 0 &&
    filter.relationshipTypes.size === 0 &&
    filter.investigationId == null &&
    filter.geoRegion == null
  ) {
    return data;
  }
  const keep = new Set<string>();
  for (const node of data.nodes) {
    if (nodePasses(node, filter)) keep.add(node.id);
  }
  const nodes = data.nodes.filter((n) => keep.has(n.id));
  const edges = data.edges.filter((e) => {
    if (filter.relationshipTypes.size > 0 && !filter.relationshipTypes.has(e.kind)) return false;
    return keep.has(e.sourceId) && keep.has(e.targetId);
  });
  return { nodes, edges };
}

/** Connected components. Returns groups of node ids. */
export function connectedComponents(data: GraphData): Array<string[]> {
  const adj = new Map<string, string[]>();
  for (const node of data.nodes) adj.set(node.id, []);
  for (const edge of data.edges) {
    adj.get(edge.sourceId)?.push(edge.targetId);
    adj.get(edge.targetId)?.push(edge.sourceId);
  }
  const visited = new Set<string>();
  const components: Array<string[]> = [];
  for (const node of data.nodes) {
    if (visited.has(node.id)) continue;
    const stack = [node.id];
    const group: string[] = [];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      group.push(id);
      for (const nid of adj.get(id) ?? []) if (!visited.has(nid)) stack.push(nid);
    }
    components.push(group);
  }
  return components;
}

/** Filter to a geographic bounding box (nodes must carry lat/lon). */
export function filterByGeoRegion(
  data: GraphData,
  region: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): GraphData {
  const keep = new Set<string>();
  for (const node of data.nodes) {
    const lat = node.latitude;
    const lng = node.longitude;
    if (lat == null || lng == null) continue;
    if (lat >= region.minLat && lat <= region.maxLat && lng >= region.minLng && lng <= region.maxLng) {
      keep.add(node.id);
    }
  }
  return {
    nodes: data.nodes.filter((n) => keep.has(n.id)),
    edges: data.edges.filter((e) => keep.has(e.sourceId) && keep.has(e.targetId)),
  };
}