import { create } from 'zustand';
import type { GraphData, GraphEdge, GraphLayout, GraphNode, Viewport } from './types';
import { emptyFilter, type FilterState } from './engine/filters';
import { IDENTITY_VIEWPORT } from './renderer/viewport';

interface GraphState {
  data: GraphData;
  layoutKind: GraphLayout;
  filterState: FilterState;
  viewport: Viewport;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  hoveredId: string | null;
  collapsedClusterIds: Set<string>;
  simRunning: boolean;
  tick: number;
  // Actions
  setData: (data: GraphData) => void;
  applyDelta: (delta: {
    addedNodes?: GraphNode[];
    removedNodeIds?: string[];
    updatedNodes?: GraphNode[];
    addedEdges?: GraphEdge[];
    removedEdgeIds?: string[];
  }) => void;
  setLayout: (layout: GraphLayout) => void;
  setFilters: (filter: FilterState) => void;
  toggleFilter: (kind: 'entityTypes' | 'relationshipTypes', value: string) => void;
  selectNode: (id: string, additive?: boolean) => void;
  setHover: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;
  fitToContent: (viewport: Viewport) => void;
  centerOn: (id: string | null) => void;
  isolateNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  hideNode: (id: string) => void;
  hideRelationship: (id: string) => void;
  setSimRunning: (running: boolean) => void;
  setTick: (tick: number) => void;
  reset: () => void;
}

const INITIAL_DATA: GraphData = { nodes: [], edges: [] };

export const useGraphStore = create<GraphState>((set, get) => ({
  data: INITIAL_DATA,
  layoutKind: 'force',
  filterState: emptyFilter(),
  viewport: { ...IDENTITY_VIEWPORT },
  selectedNodeIds: [],
  selectedEdgeIds: [],
  hoveredId: null,
  collapsedClusterIds: new Set<string>(),
  simRunning: false,
  tick: 0,

  setData: (data) => set({ data }),

  applyDelta: (delta) => {
    const current = get().data;
    const nodes = current.nodes.filter((n) => !delta.removedNodeIds?.includes(n.id));
    const addedNodes = delta.addedNodes ?? [];
    const updated = nodes.map((n) => {
      const upd = delta.updatedNodes?.find((u) => u.id === n.id);
      return upd ? { ...n, ...upd } : n;
    });
    const mergedNodes = [...updated, ...addedNodes.filter((a) => !nodes.some((n) => n.id === a.id))];
    const edges = current.edges.filter((e) => !delta.removedEdgeIds?.includes(e.id));
    const addedEdges = (delta.addedEdges ?? []).filter(
      (e) => !edges.some((x) => x.id === e.id) && mergedNodes.some((n) => n.id === e.sourceId) && mergedNodes.some((n) => n.id === e.targetId),
    );
    set({ data: { nodes: mergedNodes, edges: [...edges, ...addedEdges] } });
  },

  setLayout: (layout) => set({ layoutKind: layout }),

  setFilters: (filter) => set({ filterState: filter }),

  toggleFilter: (kind, value) => {
    const filter = get().filterState;
    const next = new Set(filter[kind]);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    set({ filterState: { ...filter, [kind]: next } });
  },

  selectNode: (id, additive = false) => {
    const current = get().selectedNodeIds;
    if (additive) {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      set({ selectedNodeIds: next });
    } else {
      set({ selectedNodeIds: current.length === 1 && current[0] === id ? [] : [id] });
    }
  },

  setHover: (id) => set({ hoveredId: id }),

  setViewport: (viewport) => set({ viewport }),

  fitToContent: (viewport) => set({ viewport }),

  centerOn: () => {
    // Centering needs canvas pixel dimensions; handled by GraphCanvas which
    // computes the new viewport and calls setViewport directly.
  },

  isolateNode: (id) => {
    const { data, filterState } = get();
    const adj = new Set<string>();
    for (const edge of data.edges) {
      if (edge.sourceId === id) adj.add(edge.targetId);
      if (edge.targetId === id) adj.add(edge.sourceId);
    }
    // Keep the node + its direct neighbors.
    const nodes = data.nodes.filter((n) => n.id === id || adj.has(n.id));
    const ids = new Set(nodes.map((n) => n.id));
    const edges = data.edges.filter((e) => ids.has(e.sourceId) && ids.has(e.targetId));
    set({ data: { nodes, edges }, filterState });
  },

  expandNode: () => {
    // Handled by the viewport via neighborhood fetch; keep selection.
  },

  collapseNode: (id) => {
    const collapsed = new Set(get().collapsedClusterIds);
    collapsed.add(id);
    set({ collapsedClusterIds: collapsed });
  },

  hideNode: (id) => {
    const { data } = get();
    const nodes = data.nodes.filter((n) => n.id !== id);
    const edges = data.edges.filter((e) => e.sourceId !== id && e.targetId !== id);
    set({ data: { nodes, edges } });
  },

  hideRelationship: (id) => {
    const { data } = get();
    set({ data: { nodes: data.nodes, edges: data.edges.filter((e) => e.id !== id) } });
  },

  setSimRunning: (running) => set({ simRunning: running }),
  setTick: (tick) => set({ tick }),

  reset: () =>
    set({
      data: INITIAL_DATA,
      layoutKind: 'force',
      filterState: emptyFilter(),
      viewport: { ...IDENTITY_VIEWPORT },
      selectedNodeIds: [],
      selectedEdgeIds: [],
      hoveredId: null,
      simRunning: false,
      tick: 0,
    }),
}));