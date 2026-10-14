'use client';

import { Canvas } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { ComponentRef } from 'react';
import * as THREE from 'three';
import type { AtlasSceneKind, AtlasSceneRecord } from './AtlasScene';

const COLORS = {
  cyan: '#4fd8c8',
  blue: '#78b8ff',
  amber: '#e8b64c',
  red: '#e05b5b',
  green: '#64d69b',
  muted: '#253b50',
};

export default function AtlasSceneCanvas({
  kind,
  records,
  resetKey,
  onSelect,
}: {
  kind: AtlasSceneKind;
  records: AtlasSceneRecord[];
  resetKey: number;
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => {
    if (resetKey > 0) controls.current?.reset();
  }, [resetKey]);

  return (
    <Canvas
      camera={{ position: [0, 5, 12], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      fallback={<div className="grid h-full min-h-64 place-items-center p-6 text-center font-mono text-xs text-slate-tech">3D RENDERING UNAVAILABLE · USE THE RECORD LIST</div>}
    >
      <color attach="background" args={['#050b13']} />
      <fog attach="fog" args={['#050b13', 15, 34]} />
      <ambientLight intensity={0.9} />
      <pointLight position={[4, 7, 5]} color={kind === 'radar' ? COLORS.amber : COLORS.cyan} intensity={34} distance={24} />
      <pointLight position={[-7, 1, -4]} color={COLORS.blue} intensity={12} distance={22} />
      <GridFloor />
      <SceneContent kind={kind} records={records} onSelect={onSelect} />
      <OrbitControls ref={controls} enableDamping dampingFactor={0.08} minDistance={6} maxDistance={20} />
    </Canvas>
  );
}

function GridFloor() {
  return (
    <group position={[0, -2, 0]}>
      <gridHelper args={[24, 24, '#21404f', '#142838']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial color="#07111b" transparent opacity={0.76} />
      </mesh>
    </group>
  );
}

function SceneContent({ kind, records, onSelect }: {
  kind: AtlasSceneKind;
  records: AtlasSceneRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  const positions = useMemo(() => layoutRecords(kind, records), [kind, records]);

  if (kind === 'terrain') {
    return <Terrain records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'cylinder') {
    return <Cylinder records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'radar') {
    return <RadarScene records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'analytics') {
    return <Analytics records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'columns') {
    return <Analytics records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'archive') {
    return <Archive records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'timeline') {
    return <Timeline records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'systems') {
    return <Systems records={records} positions={positions} onSelect={onSelect} />;
  }
  if (kind === 'workflow') {
    return <Workflow records={records} positions={positions} onSelect={onSelect} />;
  }
  return <Constellation records={records} positions={positions} onSelect={onSelect} />;
}

type PositionedRecord = { record: AtlasSceneRecord; point: [number, number, number] };

function layoutRecords(kind: AtlasSceneKind, records: AtlasSceneRecord[]): PositionedRecord[] {
  const count = Math.max(records.length, 1);
  const dates = records.map((record) => Date.parse(record.occurredAt ?? '')).filter(Number.isFinite);
  const minDate = dates.length ? Math.min(...dates) : 0;
  const maxDate = dates.length ? Math.max(...dates) : 1;

  return records.map((record, index) => {
    const angle = (index / count) * Math.PI * 2;
    const ring = 1.3 + (index % 4) * 0.62;
    let point: [number, number, number];
    switch (kind) {
      case 'terrain':
        point = [((index % 9) - 4) * 1.05, 0.15 + Math.sin(index * 1.7) * 0.7, (Math.floor(index / 9) - 2) * 1.05];
        break;
      case 'cylinder':
      case 'constellation':
        point = [Math.cos(angle) * ring, ((index % 5) - 2) * 0.66, Math.sin(angle) * ring];
        break;
      case 'radar':
        point = [Math.cos(angle) * ring, 0.08, Math.sin(angle) * ring];
        break;
      case 'analytics':
        point = [((index % 12) - 5.5) * 0.62, 0, (Math.floor(index / 12) - 2) * 1.05];
        break;
      case 'columns':
        point = [(index - (count - 1) / 2) * 1.45, 0, 0];
        break;
      case 'archive':
        point = [((index % 7) - 3) * 1.05, Math.sin(index * 0.65) * 0.36, (Math.floor(index / 7) - 2) * 1.5];
        break;
      case 'timeline': {
        const time = Date.parse(record.occurredAt ?? '');
        const x = Number.isFinite(time) && maxDate > minDate ? ((time - minDate) / (maxDate - minDate) - 0.5) * 12 : ((index / Math.max(count - 1, 1)) - 0.5) * 12;
        point = [x, (index % 5) * 0.55, ((index % 3) - 1) * 1.35];
        break;
      }
      case 'systems':
        point = [Math.cos(angle) * 3, (index % 2) * 0.8, Math.sin(angle) * 3];
        break;
      case 'workflow':
        point = [(index - (count - 1) / 2) * 1.8, Math.sin(index * 0.7) * 0.6, 0];
        break;
    }
    return { record, point };
  });
}

function RecordNode({ item, color, onSelect, size = 0.13 }: {
  item: PositionedRecord;
  color: string;
  onSelect: (record: AtlasSceneRecord) => void;
  size?: number;
}) {
  return (
    <group position={item.point}>
      <mesh
        onClick={(event) => { event.stopPropagation(); onSelect(item.record); }}
        onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <sphereGeometry args={[size * 1.7, 16, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <mesh scale={2.7}>
        <sphereGeometry args={[size, 12, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} />
      </mesh>
      <Html distanceFactor={14} position={[0.12, 0.2, 0]} center>
        <span className="pointer-events-none max-w-32 truncate rounded bg-[#050b13]/80 px-1 font-mono text-[8px] text-slate-300">{item.record.label}</span>
      </Html>
    </group>
  );
}

function Terrain({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  const geometry = useMemo(() => {
    const mesh = new THREE.PlaneGeometry(12, 8, 40, 28);
    const points = mesh.attributes.position;
    for (let index = 0; index < points.count; index += 1) {
      const x = points.getX(index);
      const y = points.getY(index);
      points.setZ(index, Math.sin(x * 0.7) * 0.18 + Math.cos(y * 0.9) * 0.22 + Math.sin((x + y) * 0.35) * 0.14);
    }
    mesh.computeVertexNormals();
    return mesh;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
        <meshStandardMaterial color="#0b2530" wireframe transparent opacity={0.56} emissive="#0c4b50" emissiveIntensity={0.26} />
      </mesh>
      {positions.map((item, index) => (
        <group key={item.record.id}>
          <Line points={[[item.point[0], -0.72, item.point[2]], item.point]} color={COLORS.cyan} transparent opacity={0.38} lineWidth={1} />
          <RecordNode item={item} color={colorFor(item.record, index)} onSelect={onSelect} />
        </group>
      ))}
      {records.length === 0 && <EmptySceneLabel label="NO INVESTIGATION RECORDS" />}
    </group>
  );
}

function Cylinder({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1.45, 1.45, 4.5, 48, 1, true]} />
        <meshBasicMaterial color={COLORS.blue} transparent opacity={0.055} side={THREE.DoubleSide} wireframe />
      </mesh>
      {[1.2, 2.25].map((y) => <mesh key={y} rotation={[Math.PI / 2, 0, 0]} position={[0, y - 2.25, 0]}><torusGeometry args={[2.2, 0.012, 6, 80]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.42} /></mesh>)}
      {positions.map((item, index) => <RecordNode key={item.record.id} item={item} color={colorFor(item.record, index)} onSelect={onSelect} size={0.11} />)}
      {records.length === 0 && <EmptySceneLabel label="NO INTELLIGENCE RECORDS" />}
    </group>
  );
}

function RadarScene({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {[1.3, 2.6, 3.9].map((radius) => <mesh key={radius}><ringGeometry args={[radius - 0.008, radius + 0.008, 96]} /><meshBasicMaterial color={COLORS.amber} transparent opacity={0.24} side={THREE.DoubleSide} /></mesh>)}
      <mesh position={[0, 0, -0.02]}><circleGeometry args={[4, 64]} /><meshBasicMaterial color="#120e08" transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
      {positions.map((item, index) => (
        <group key={item.record.id} position={[item.point[0], item.point[2], 0]} rotation={[Math.PI / 2, 0, 0]}>
          <RecordNode item={{ ...item, point: [0, 0, 0] }} color={colorFor(item.record, index)} onSelect={onSelect} size={0.12} />
        </group>
      ))}
      {records.length === 0 && <EmptySceneLabel label="NO ALERT SIGNALS" />}
    </group>
  );
}

function Analytics({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  const maximum = Math.max(1, ...records.map((record) => record.value ?? 1));
  return (
    <group>
      {positions.map((item, index) => {
        const height = 0.35 + ((item.record.value ?? 1) / maximum) * 3.7;
        return (
          <group key={item.record.id} position={[item.point[0], 0, item.point[2]]}>
            <mesh position={[0, height / 2 - 1.3, 0]} onClick={(event) => { event.stopPropagation(); onSelect(item.record); }}>
              <boxGeometry args={[0.32, height, 0.5]} />
              <meshStandardMaterial color={colorFor(item.record, index)} emissive={colorFor(item.record, index)} emissiveIntensity={0.44} metalness={0.52} roughness={0.32} />
            </mesh>
            <Html distanceFactor={15} position={[0, height - 0.85, 0]} center><span className="pointer-events-none font-mono text-[8px] text-slate-300">{item.record.value ?? 1}</span></Html>
            <Html distanceFactor={14} position={[0, -1.3, 0]} center><span className="pointer-events-none max-w-20 truncate font-mono text-[8px] text-slate-tech">{item.record.label}</span></Html>
          </group>
        );
      })}
      {records.length === 0 && <EmptySceneLabel label="NO ANALYTICS RECORDS" />}
    </group>
  );
}

function Archive({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group>
      {[0, 1, 2].map((level) => <mesh key={level} position={[0, -1.25 + level * 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.6 - level * 0.22, 0.018, 6, 72]} /><meshBasicMaterial color={COLORS.blue} transparent opacity={0.36} /></mesh>)}
      {positions.map((item, index) => <group key={item.record.id} position={item.point} rotation={[0, (index % 5) * 0.09 - 0.2, 0]}>
        <mesh onClick={(event) => { event.stopPropagation(); onSelect(item.record); }}>
          <boxGeometry args={[0.72, 0.95, 0.08]} />
          <meshStandardMaterial color={colorFor(item.record, index)} emissive={colorFor(item.record, index)} emissiveIntensity={0.18} metalness={0.3} roughness={0.48} />
        </mesh>
        <Html distanceFactor={13} position={[0, -0.62, 0]} center><span className="pointer-events-none max-w-24 truncate rounded bg-[#050b13]/80 px-1 font-mono text-[8px] text-slate-300">{item.record.label}</span></Html>
      </group>)}
      {records.length === 0 && <EmptySceneLabel label="NO EVIDENCE RECORDS" />}
    </group>
  );
}

function Timeline({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  const lanes = [...new Set(records.map((record) => record.category || 'EVENT'))];
  return (
    <group>
      {lanes.slice(0, 5).map((lane, index) => {
        const z = (index - (Math.min(lanes.length, 5) - 1) / 2) * 1.35;
        return <group key={lane}><Line points={[[-6, -1.3, z], [6, -1.3, z]]} color={COLORS.blue} transparent opacity={0.48} lineWidth={1} /><Html distanceFactor={14} position={[-6.1, -1.08, z]}><span className="pointer-events-none font-mono text-[8px] text-slate-tech">{lane}</span></Html></group>;
      })}
      {positions.map((item, index) => <group key={item.record.id}><Line points={[[item.point[0], -1.28, item.point[2]], item.point]} color={COLORS.cyan} transparent opacity={0.34} lineWidth={1} /><RecordNode item={item} color={colorFor(item.record, index)} onSelect={onSelect} size={0.1} /></group>)}
      {records.length === 0 && <EmptySceneLabel label="NO TIMELINE EVENTS" />}
    </group>
  );
}

function Systems({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group>
      <mesh><icosahedronGeometry args={[0.9, 1]} /><meshStandardMaterial color={COLORS.blue} emissive={COLORS.blue} emissiveIntensity={0.36} wireframe /></mesh>
      {[2, 3.4].map((radius) => <mesh key={radius} rotation={[Math.PI / 2, 0, radius * 0.12]}><torusGeometry args={[radius, 0.012, 6, 96]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} /></mesh>)}
      {positions.map((item, index) => <group key={item.record.id}><Line points={[[0, 0, 0], item.point]} color={colorFor(item.record, index)} transparent opacity={0.44} lineWidth={1} /><RecordNode item={item} color={colorFor(item.record, index)} onSelect={onSelect} size={0.14} /></group>)}
      {records.length === 0 && <EmptySceneLabel label="NO SYSTEM STATUS DATA" />}
    </group>
  );
}

function Workflow({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group>
      {positions.slice(0, -1).map((item, index) => <Line key={item.record.id} points={[item.point, positions[index + 1].point]} color={COLORS.cyan} transparent opacity={0.6} lineWidth={1.4} />)}
      {positions.map((item, index) => <group key={item.record.id} position={item.point}>
        <mesh onClick={(event) => { event.stopPropagation(); onSelect(item.record); }}><boxGeometry args={[1.15, 0.58, 0.22]} /><meshStandardMaterial color={colorFor(item.record, index)} emissive={colorFor(item.record, index)} emissiveIntensity={0.26} transparent opacity={0.92} /></mesh>
        <Html distanceFactor={13} position={[0, 0.55, 0]} center><span className="pointer-events-none max-w-24 truncate rounded bg-[#050b13]/80 px-1 font-mono text-[8px] text-slate-200">{item.record.label}</span></Html>
      </group>)}
      {records.length === 0 && <EmptySceneLabel label="NO WORKFLOW STEPS" />}
    </group>
  );
}

function Constellation({ records, positions, onSelect }: {
  records: AtlasSceneRecord[];
  positions: PositionedRecord[];
  onSelect: (record: AtlasSceneRecord) => void;
}) {
  return (
    <group>
      <mesh><sphereGeometry args={[0.52, 24, 20]} /><meshStandardMaterial color={COLORS.amber} emissive={COLORS.amber} emissiveIntensity={0.68} /></mesh>
      {positions.map((item, index) => <group key={item.record.id}>
        <Line points={[[0, 0, 0], item.point]} color={COLORS.cyan} transparent opacity={0.42} lineWidth={1} />
        <RecordNode item={item} color={colorFor(item.record, index)} onSelect={onSelect} size={0.14} />
      </group>)}
      {records.length === 0 && <EmptySceneLabel label="NO RELATIONSHIPS" />}
    </group>
  );
}

function EmptySceneLabel({ label }: { label: string }) {
  return <Html center><span className="rounded border border-void-line bg-[#050b13]/90 px-3 py-2 font-mono text-[9px] tracking-widest text-slate-tech">{label}</span></Html>;
}

function colorFor(record: AtlasSceneRecord, index: number) {
  const status = `${record.status ?? ''} ${record.category ?? ''}`.toUpperCase();
  if (status.includes('CRITICAL') || status.includes('UNHEALTHY')) return COLORS.red;
  if (status.includes('HIGH') || status.includes('WARNING') || status.includes('DEGRADED')) return COLORS.amber;
  if (status.includes('HEALTHY') || status.includes('COMPLETED') || status.includes('VERIFIED')) return COLORS.green;
  return [COLORS.cyan, COLORS.blue, COLORS.amber][index % 3];
}
