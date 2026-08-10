'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances, Line } from '@react-three/drei';
import { globeArcs, globeNodes } from '../data/demoNodes';
import { useGlobe } from '../hooks/useGlobeState';
import { arcPoints, nodeSurfacePosition } from '../systems/geometry';

/**
 * Selectable entity markers (instanced octahedra) + curved connection arcs.
 * Interaction updates a shared zustand store so the DOM HUD can react without
 * re-rendering the whole scene.
 */
export function MarkerField() {
  const selectedId = useGlobe((s) => s.selectedId);
  const setHovered = useGlobe((s) => s.setHovered);
  const setSelected = useGlobe((s) => s.setSelected);

  const markers = useMemo(
    () =>
      globeNodes.map((node) => ({
        node,
        position: nodeSurfacePosition(node),
      })),
    [],
  );

  const arcs = useMemo(
    () =>
      globeArcs
        .map((arc) => {
          const from = globeNodes.find((n) => n.id === arc.source);
          const to = globeNodes.find((n) => n.id === arc.target);
          if (!from || !to) return null;
          return arcPoints(
            nodeSurfacePosition(from),
            nodeSurfacePosition(to),
          );
        })
        .filter((points): points is THREE.Vector3[] => points !== null),
    [],
  );

  return (
    <group>
      {/* Connection arcs */}
      {arcs.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#3f9b91"
          transparent
          opacity={0.4}
          lineWidth={1}
        />
      ))}

      {/* Instance markers */}
      <Instances limit={markers.length} range={markers.length}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
        {markers.map(({ node, position }) => {
          const active = node.id === selectedId;
          return (
            <Instance
              key={node.id}
              position={position}
              scale={active ? 0.085 : 0.062}
              color={active ? '#b7ffe8' : '#4fd8c8'}
              onClick={(event) => {
                event.stopPropagation();
                setSelected(active ? null : node.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(node.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHovered(null);
                document.body.style.cursor = 'auto';
              }}
            />
          );
        })}
      </Instances>
    </group>
  );
}