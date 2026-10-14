'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { damp3 } from 'maath/easing';
import * as THREE from 'three';
import type { GlobeNode } from '../data/demoNodes';
import { useGlobe } from '../hooks/useGlobeState';
import { GLOBE_RADIUS, nodeDirection } from '../systems/geometry';

/**
 * Gently flies the orbit-controls target toward the selected node when a
 * marker is clicked, and back to the pole when deselected. Cheap damped
 * easing only — no per-frame allocation.
 */
export function CameraFocus({
  controls,
  nodes,
}: {
  controls: React.RefObject<OrbitControlsImpl | null>;
  nodes: GlobeNode[];
}) {
  const selectedId = useGlobe((s) => s.selectedId);
  const look = useRef(new THREE.Vector3(0, 0, 0));

  const node = selectedId ? nodes.find((item) => item.id === selectedId) : null;
  useEffect(() => {
    if (node) {
      look.current.copy(nodeDirection(node)).multiplyScalar(GLOBE_RADIUS * 0.55);
    } else {
      look.current.set(0, 0, 0);
    }
  }, [node]);

  useFrame((_, delta) => {
    const target = controls.current?.target;
    if (!target) return;
    damp3(target, look.current, 2.5, delta);
  }, 50);

  return null;
}