'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { damp3 } from 'maath/easing';
import type { GraphEdge, GraphNode } from './layout';
import { layoutNodes, nodeColor, nodeScale } from './layout';
import { useGraph } from './store';

interface SceneInput {
  nodeInputs: Array<{
    id: string;
    name: string;
    type: string;
    confidence: number;
  }>;
  edgeInputs: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    kind: string;
  }>;
}

export function GraphScene({ nodeInputs, edgeInputs }: SceneInput) {
  const controls = useRef<OrbitControlsImpl>(null);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const selectedId = useGraph((s) => s.selectedId);
  const setHovered = useGraph((s) => s.setHovered);
  const setSelected = useGraph((s) => s.setSelected);

  const nodes = useMemo<GraphNode[]>(
    () =>
      nodeInputs.map((n) => ({ ...n })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeInputs.length],
  );
  const edges = useMemo<GraphEdge[]>(
    () => edgeInputs.map((e) => ({ ...e })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edgeInputs.length],
  );

  const positions = useMemo(() => layoutNodes(nodes), [nodes, nodes.length]);

  const lineSets = useMemo(
    () =>
      edges
        .map((edge) => {
          const a = positions.get(edge.sourceId);
          const b = positions.get(edge.targetId);
          if (!a || !b) return null;
          const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(4.1);
          const points: THREE.Vector3[] = [];
          for (let i = 0; i <= 24; i += 1) {
            const t = i / 24;
            const p = new THREE.Vector3()
              .copy(a)
              .multiplyScalar((1 - t) ** 2)
              .add(mid.clone().multiplyScalar(2 * (1 - t) * t))
              .add(b.clone().multiplyScalar(t * t));
            points.push(p);
          }
          return points;
        })
        .filter((p): p is THREE.Vector3[] => p !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edges.length, nodeInputs.length],
  );

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  useEffect(() => {
    if (selectedNode) {
      const p = positions.get(selectedNode.id);
      if (p) look.current.copy(p).multiplyScalar(0.72);
    } else {
      look.current.set(0, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useFrame((_, delta) => {
    const target = controls.current?.target;
    if (target) {
      damp3(target, look.current, 2.2, delta);
      controls.current?.update();
    }
  }, 50);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <Stars radius={70} depth={40} count={800} factor={2.6} fade speed={0.5} />

      {lineSets.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#3f9b91"
          transparent
          opacity={0.5}
          lineWidth={1}
        />
      ))}

      {nodes.map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;
        const selected = node.id === selectedId;
        return (
          <mesh
            key={node.id}
            position={position}
            scale={selected ? nodeScale(node.confidence) * 1.7 : nodeScale(node.confidence) * 1.4}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(selected ? null : node.id);
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
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color={nodeColor(node.type)}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Label sprites for high-count clarity are skipped in the 3D preview;
          the DOM context panel carries the resolution. */}

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan
        minDistance={2.5}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}