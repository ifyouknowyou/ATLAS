import * as THREE from 'three';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: string;
  confidence: number;
}

/**
 * Deterministic layout: distribute nodes over a fibonacci sphere so positions
 * are stable across renders (no non-deterministic graph force in Phase 2).
 */
export function layoutNodes(nodes: GraphNode[], radius = 3.2): Map<string, THREE.Vector3> {
  const positions = new Map<string, THREE.Vector3>();
  const total = Math.max(nodes.length, 1);
  const golden = Math.PI * (3 - Math.sqrt(5));
  nodes.forEach((node, index) => {
    const y = 1 - (index / (total - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    positions.set(
      node.id,
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius),
    );
  });
  return positions;
}

/** Node marker color keyed by entity type (consistent with EntityType). */
export function nodeColor(type: string): string {
  switch (type) {
    case 'PERSON':
      return '#e8b64c';
    case 'ORGANIZATION':
      return '#4fd8c8';
    case 'DOMAIN':
    case 'IP_ADDRESS':
      return '#79b8ff';
    case 'LOCATION':
      return '#9b8cff';
    case 'DEVICE':
    case 'ACCOUNT':
      return '#ff9d76';
    default:
      return '#8aa3c2';
  }
}

/** Marker size scales mildly with confidence (analytical assessment, not truth). */
export function nodeScale(confidence: number): number {
  return 0.14 + (confidence / 100) * 0.1;
}