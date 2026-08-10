import { create } from 'zustand';
import type { GlobeNode } from '../data/demoNodes';

/**
 * Globe interaction state: which node is hovered / selected. Kept outside the
 * React-Three-Fiber tree so DOM HUD and the canvas share it without re-renders.
 */
interface GlobeState {
  hoveredId: string | null;
  selectedId: string | null;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
}

export const useGlobe = create<GlobeState>((set) => ({
  hoveredId: null,
  selectedId: null,
  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),
}));

export function hoveredNode(nodes: GlobeNode[], id: string | null) {
  return nodes.find((n) => n.id === id) ?? null;
}