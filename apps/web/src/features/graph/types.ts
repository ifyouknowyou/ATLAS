import type { GraphLayout, RelationshipType, EntityType } from '@atlas/shared';

export type { GraphLayout }; // re-export so engine modules import from ./types

/** A node rendered in the 2D graph engine. */
export interface GraphNode {
  id: string;
  name: string;
  type: EntityType | string;
  confidence: number;
  latitude?: number | null;
  longitude?: number | null;
  investigationId?: string | null;
  tags?: string[];
  /** Layout-computed position (world units, centered on origin). */
  x: number;
  y: number;
  /** d3-force fixed flag (dragging pins a node in place). */
  fx?: number | null;
  fy?: number | null;
}

/** An edge rendered in the 2D graph engine. */
export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipType | string;
  confidence: number;
}

/** Full engine dataset. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Filter dimensions shared with FilterPanel. */
export interface FilterState {
  entityTypes: Set<string>;
  relationshipTypes: Set<string>;
  investigationId?: string | null;
  geoRegion?: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
}

/** A clustering partition of nodes. */
export interface Cluster {
  id: string;
  label: string;
  nodeIds: string[];
  color?: string;
}

/** Viewport transform for the renderer. */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

/** Simulation status surfaced to the UI. */
export interface SimStatus {
  running: boolean;
  tick: number;
  iteration: number;
}

/** Result of a layout computation. */
export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
}

export interface EngineCallbacks {
  onPositions?: (nodes: Array<{ id: string; x: number; y: number }>) => void;
  onStatus?: (status: SimStatus) => void;
  onTick?: (tick: number) => void;
}