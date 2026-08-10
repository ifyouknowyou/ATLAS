import * as THREE from 'three';
import type { GlobeNode } from '../data/demoNodes';
import { latLngToVector3 } from '../data/demoNodes';

export const GLOBE_RADIUS = 1.7;

/** Unit-normal direction for a node on the globe surface. */
export function nodeDirection(node: GlobeNode): THREE.Vector3 {
  const p = latLngToVector3(node.latitude, node.longitude);
  return new THREE.Vector3(p.x, p.y, p.z);
}

/** Surface position for a node, slightly lifted for crisp marker placement. */
export function nodeSurfacePosition(
  node: GlobeNode,
  lift = GLOBE_RADIUS * 1.02,
): THREE.Vector3 {
  return nodeDirection(node).multiplyScalar(lift);
}

/**
 * Quadratic bezier arc between two surface points, bulging outward above the
 * globe. Returns dense point samples suitable for a Line.
 */
export function arcPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  bulge = GLOBE_RADIUS * 1.35,
  segments = 48,
): THREE.Vector3[] {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(bulge);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const a = 1 - t;
    const point = new THREE.Vector3()
      .copy(from)
      .multiplyScalar(a * a)
      .add(mid.clone().multiplyScalar(2 * a * t))
      .add(to.clone().multiplyScalar(t * t));
    points.push(point);
  }
  return points;
}

/** Ring points for a latitude parallel at `angle` degrees. */
export function latitudeRingPoints(
  angleDeg: number,
  radius = GLOBE_RADIUS * 1.004,
  segments = 96,
): THREE.Vector3[] {
  const rad = (angleDeg * Math.PI) / 180;
  const ringRadius = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  return ring(ringRadius, y, segments);
}

/** Ring points for a meridian (great circle through the poles). */
export function meridianPoints(
  longitudeDeg: number,
  radius = GLOBE_RADIUS * 1.004,
  segments = 96,
): THREE.Vector3[] {
  const rad = (longitudeDeg * Math.PI) / 180;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const p = (i / segments) * Math.PI * 2;
    const x = Math.cos(p) * radius;
    const y = Math.sin(p) * radius;
    const z = 0;
    const v = new THREE.Vector3(x, y, z);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    points.push(v);
  }
  return points;
}

function ring(ringRadius: number, y: number, segments: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const p = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.cos(p) * ringRadius, y, Math.sin(p) * ringRadius),
    );
  }
  return points;
}

/** Random points on a shell for the ambient particle field. */
export function shellPoints(
  count: number,
  minRadius: number,
  maxRadius: number,
  salt = 0,
): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    // Deterministic pseudo-random (breaks replay nondeterminism cleanly).
    const r1 = frac(Math.sin(salt + i * 12.9898) * 43758.5453);
    const r2 = frac(Math.sin(salt + i * 78.233) * 12543.123);
    const theta = r1 * Math.PI * 2;
    const phi = Math.acos(2 * r2 - 1);
    const radius = minRadius + r2 * (maxRadius - minRadius);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
}

function frac(value: number): number {
  return value - Math.floor(value);
}