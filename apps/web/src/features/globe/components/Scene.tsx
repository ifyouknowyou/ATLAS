'use client';

import { useRef } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Planet } from './Planet';
import { ParticleField } from './ParticleField';
import { MarkerField } from './MarkerField';
import { CameraFocus } from './CameraFocus';

/** The 3D intelligence-space scene. Rendered only inside the lazy canvas. */
export function Scene() {
  const controls = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} />
      <Stars radius={90} depth={50} count={1500} factor={3.2} fade speed={0.6} />

      <Planet />
      <ParticleField />
      <MarkerField />

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        minDistance={2.8}
        maxDistance={9}
        autoRotate
        autoRotateSpeed={0.45}
      />
      <CameraFocus controls={controls} />
    </>
  );
}