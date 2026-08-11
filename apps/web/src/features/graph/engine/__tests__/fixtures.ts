import type { GraphData } from '../../types';

export const SMALL_GRAPH: GraphData = {
  nodes: [
    { id: 'n1', name: 'Alpha', type: 'PERSON', confidence: 80, x: 0, y: 0 },
    { id: 'n2', name: 'Beta', type: 'ORGANIZATION', confidence: 60, x: 0, y: 0 },
    { id: 'n3', name: 'Gamma', type: 'DOMAIN', confidence: 40, x: 0, y: 0 },
    { id: 'n4', name: 'Delta', type: 'PERSON', confidence: 20, x: 0, y: 0 },
  ],
  edges: [
    { id: 'e1', sourceId: 'n1', targetId: 'n2', kind: 'WORKS_FOR', confidence: 90 },
    { id: 'e2', sourceId: 'n2', targetId: 'n3', kind: 'CONTROLS', confidence: 70 },
    { id: 'e3', sourceId: 'n1', targetId: 'n3', kind: 'RELATED_TO', confidence: 50 },
  ],
};

export const DISCONNECTED_GRAPH: GraphData = {
  nodes: [
    { id: 'a1', name: 'A1', type: 'PERSON', confidence: 50, x: 0, y: 0 },
    { id: 'a2', name: 'A2', type: 'PERSON', confidence: 50, x: 0, y: 0 },
    { id: 'b1', name: 'B1', type: 'ORGANIZATION', confidence: 50, x: 0, y: 0 },
  ],
  edges: [{ id: 'ae1', sourceId: 'a1', targetId: 'a2', kind: 'RELATED_TO', confidence: 50 }],
};

export const GEO_GRAPH: GraphData = {
  nodes: [
    { id: 'g1', name: 'Budapest', type: 'LOCATION', confidence: 90, latitude: 47.4979, longitude: 19.0402, x: 0, y: 0 },
    { id: 'g2', name: 'London', type: 'LOCATION', confidence: 80, latitude: 51.5072, longitude: -0.1276, x: 0, y: 0 },
    { id: 'g3', name: 'Sydney', type: 'LOCATION', confidence: 70, latitude: -33.8688, longitude: 151.2093, x: 0, y: 0 },
  ],
  edges: [],
};