import { create } from 'zustand';

/** Selection/hover state shared between the 3D scene and the DOM context panel. */
interface GraphState {
  hoveredId: string | null;
  selectedId: string | null;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
}

export const useGraph = create<GraphState>((set) => ({
  hoveredId: null,
  selectedId: null,
  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),
}));