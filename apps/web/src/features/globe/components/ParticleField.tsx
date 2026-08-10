'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shellPoints } from '../systems/geometry';

const PARTICLE_COUNT = 260;

/** Sparse orbital particle shell (additive, throttled by GPU). */
export function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(
    () => shellPoints(PARTICLE_COUNT, 2.1, 3.1, 7),
    [],
  );

  useFrame((state) => {
    const points = ref.current;
    if (!points) return;
    // Slow drift — kept deterministic and cheap.
    points.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#7fd8cc"
        size={0.018}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}