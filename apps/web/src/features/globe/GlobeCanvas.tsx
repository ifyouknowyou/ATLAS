'use client';

import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';

/**
 * R3F canvas entry point. Imported lazily via next/dynamic so Three.js stays
 * out of the main application bundle.
 */
export default function GlobeCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.4, 5.2], fov: 42, near: 0.1, far: 220 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <Scene />
    </Canvas>
  );
}