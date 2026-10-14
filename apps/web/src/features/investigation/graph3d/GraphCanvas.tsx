'use client';

import {
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
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
    confidence: number;
  }>;
}

export function GraphScene({ nodeInputs, edgeInputs }: SceneInput) {
  const controls = useRef<OrbitControlsImpl>(null);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const selectedId = useGraph((s) => s.selectedId);
  const setHovered = useGraph((s) => s.setHovered);
  const setSelected = useGraph((s) => s.setSelected);

  const nodes = useMemo<GraphNode[]>(
    () => nodeInputs.map((node) => ({ ...node })),
    [nodeInputs],
  );
  const edges = useMemo<GraphEdge[]>(
    () => edgeInputs.map((edge) => ({ ...edge })),
    [edgeInputs],
  );

  const positions = useMemo(() => layoutNodes(nodes), [nodes]);

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
      {edges.map((edge) => {
        const source = positions.get(edge.sourceId);
        const target = positions.get(edge.targetId);
        if (!source || !target) return null;
        return (
          <Line
            key={edge.id}
            points={[source, target]}
            color="#3f9b91"
            lineWidth={1}
            transparent
            opacity={0.45}
          />
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