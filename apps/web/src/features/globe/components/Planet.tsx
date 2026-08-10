'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { atmosphereFragmentShader, atmosphereVertexShader } from '../shaders/atmosphere';
import {
  GLOBE_RADIUS,
  latitudeRingPoints,
  meridianPoints,
} from '../systems/geometry';

const GRID_COLOR = new THREE.Color('#4fd8c8');

/** The planet core + tech grid lattice + fresnel atmosphere. */
export function Planet() {
  const coreGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 32);
    return geo;
  }, []);

  const wireGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 1.002, 8);
    geo.deleteAttribute('uv');
    return geo;
  }, []);

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          uColor: { value: new THREE.Color('#4fd8c8') },
          uIntensity: { value: 0.9 },
        },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  const latticeLines = useMemo(() => toLatticeLines(), []);

  return (
    <group>
      {/* Core */}
      <mesh geometry={coreGeometry}>
        <meshStandardMaterial color="#0a1e30" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Dataviz lattice */}
      <mesh geometry={wireGeometry}>
        <meshBasicMaterial
          color={GRID_COLOR}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Latitude + meridian guides */}
      <primitive object={latticeLines} />

      {/* Fresnel atmosphere */}
      <mesh
        scale={1.13}
        material={atmosphereMaterial}
      >
        <icosahedronGeometry args={[GLOBE_RADIUS, 32]} />
      </mesh>
    </group>
  );
}

function latLngLines(): Float32Array[] {
  const rings: THREE.Vector3[][] = [];
  for (const angle of [-60, -30, 0, 30, 60]) {
    rings.push(latitudeRingPoints(angle));
  }
  for (const angle of [0, 60, 120]) {
    rings.push(meridianPoints(angle));
  }
  return rings.map((points) => toPositionArray(points));
}

function toPositionArray(points: THREE.Vector3[]): Float32Array {
  const flat = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    flat[i * 3] = p.x;
    flat[i * 3 + 1] = p.y;
    flat[i * 3 + 2] = p.z;
  });
  return flat;
}

function toLatticeLines(): THREE.LineSegments {
  const rings = latLngLines();
  const total = rings.reduce((sum, ring) => sum + ring.length, 0);
  const positions = new Float32Array(total);
  const indices: number[] = [];

  let offset = 0;
  let vertexCount = 0;
  for (const ring of rings) {
    positions.set(ring, offset);
    offset += ring.length;
    const points = ring.length / 3;
    for (let i = 0; i < points - 1; i += 1) {
      indices.push(vertexCount + i, vertexCount + i + 1);
    }
    vertexCount += points;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  const material = new THREE.LineBasicMaterial({
    color: GRID_COLOR,
    transparent: true,
    opacity: 0.22,
  });
  return new THREE.LineSegments(geometry, material);
}