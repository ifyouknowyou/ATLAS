/**
 * Fictional demo nodes for the 3D intelligence globe.
 *
 * Clear-marker: this entire dataset is invented (mirrors the API's fictional
 * "Meridian" seed universe). No real coordinates of real people.
 */
export interface GlobeNode {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

export interface GlobeArc {
  source: string;
  target: string;
}

export const DEMO_MARKER = 'demo';

export const globeNodes: GlobeNode[] = [
  { id: 'n1', name: 'L. Moreau', type: 'PERSON', latitude: 48.8566, longitude: 2.3522 },
  { id: 'n2', name: 'K. Varga', type: 'PERSON', latitude: 47.4979, longitude: 19.0402 },
  { id: 'n3', name: 'Meridian Ventures', type: 'ORGANIZATION', latitude: 51.5072, longitude: -0.1276 },
  { id: 'n4', name: 'meridian-ventures.example', type: 'DOMAIN', latitude: 40.7128, longitude: -74.006 },
  { id: 'n5', name: '203.0.113.86', type: 'IP_ADDRESS', latitude: 35.6762, longitude: 139.6503 },
  { id: 'n6', name: 'Harbour View Complex', type: 'LOCATION', latitude: 52.52, longitude: 13.405 },
  { id: 'n7', name: 'securemail.example', type: 'ACCOUNT', latitude: 1.3521, longitude: 103.8198 },
  { id: 'n8', name: 'South marker', type: 'IP_ADDRESS', latitude: -33.8688, longitude: 151.2093 },
];

export const globeArcs: GlobeArc[] = [
  { source: 'n1', target: 'n2' },
  { source: 'n4', target: 'n3' },
  { source: 'n1', target: 'n5' },
  { source: 'n2', target: 'n5' },
  { source: 'n7', target: 'n3' },
  { source: 'n6', target: 'n2' },
  { source: 'n5', target: 'n8' },
];

/** WGS84 lat/lng to unit-sphere position (y-up). */
export function latLngToVector3(latitude: number, longitude: number): {
  x: number;
  y: number;
  z: number;
} {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180;
  const x = Math.cos(lat) * Math.cos(lng);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lng);
  return { x, y, z };
}