'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { cn } from '@/lib/cn';
import type { GraphEdge, GraphNode } from './layout';
import { nodeColor } from './layout';
import { useGraph } from './store';

const GraphScene = dynamic(() => import('./GraphCanvas').then((m) => m.GraphScene), {
  ssr: false,
});

export function InvestigationGraph({
  nodes,
  edges,
  className,
  entityHref,
  onSelectNode,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  entityHref?: (id: string) => string;
  onSelectNode?: (id: string | null) => void;
}) {
  const selectedId = useGraph((s) => s.selectedId);
  const setSelected = useGraph((s) => s.setSelected);
  const [webgl] = useState(() => supportsWebGL());
  const [showLegend, setShowLegend] = useState(true);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const linked = selected
    ? edges.filter((e) => e.sourceId === selected.id || e.targetId === selected.id).length
    : 0;

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-lg border border-void-line bg-radial-void', className)}>
      {webgl ? (
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <GraphScene nodeInputs={nodes} edgeInputs={edges} onSelectNode={onSelectNode} />
        </Canvas>
      ) : (
        <SvgGraph nodes={nodes} edges={edges} onSelect={(id) => { setSelected(id); onSelectNode?.(id); }} />
      )}

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-phosphor animate-pulse-slow" />
        <span className="mono-label">INVESTIGATION VIEW · PREVIEW</span>
      </div>

      {showLegend && (
        <div className="pointer-events-auto absolute right-4 top-4 rounded border border-void-line bg-void/80 p-3 text-[10px] backdrop-blur">
          <div className="mono-label mb-2">TYPE KEY</div>
          {['PERSON', 'ORGANIZATION', 'INFRA', 'LOCATION', 'OTHER'].map((k) => (
            <div key={k} className="flex items-center gap-2 py-0.5">
              <span className="h-2 w-2 rounded-full" style={{ background: nodeColor(k) }} />
              <span className="font-mono text-slate-tech">{k}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowLegend(false)}
            className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-slate-tech hover:text-phosphor"
          >
            <EyeOff className="h-3 w-3" /> HIDE LABELS
          </button>
        </div>
      )}

      {selected && (
        <div className="pointer-events-auto absolute inset-x-4 bottom-4 rounded border border-phosphor-faint/40 bg-void/85 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mono-label text-phosphor">SELECTED ENTITY</div>
              <div className="mt-1 font-mono text-lg text-slate-100">{selected.name}</div>
              <div className="mt-1 font-mono text-[11px] text-slate-tech">
                {selected.type} · CONFIDENCE {selected.confidence}% · {linked} RELATIONSHIPS
              </div>
            </div>
            <div className="flex gap-2">
              {entityHref && (
                <Link href={entityHref(selected.id)} className="tech-button px-2 py-1">
                  OPEN ENTITY
                </Link>
              )}
              <button type="button" className="tech-button px-2 py-1" onClick={() => setSelected(null)}>
                RESET VIEW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function supportsWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Non-3D alternative: a readable 2D force-ring graph. */
function SvgGraph({
  nodes,
  edges,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelect: (id: string | null) => void;
}) {
  const radius = 130;
  const positions = nodes.map((node, index) => {
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { node, x: 200 + Math.cos(angle) * radius, y: 170 + Math.sin(angle) * radius };
  });
  const byId = new Map(positions.map((p) => [p.node.id, p]));

  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 400 340" className="h-full w-full">
        {edges.map((edge) => {
          const a = byId.get(edge.sourceId);
          const b = byId.get(edge.targetId);
          if (!a || !b) return null;
          return (
            <line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#3f9b91"
              strokeOpacity={0.45}
              strokeWidth={1}
            />
          );
        })}
        {positions.map(({ node, x, y }) => (
          <g key={node.id} className="cursor-pointer" onClick={() => onSelect(node.id)}>
            <circle cx={x} cy={y} r={6 + (node.confidence / 100) * 4} fill={nodeColor(node.type)} fillOpacity={0.85} />
            <text x={x + 10} y={y + 4} fill="#8aa3c2" fontSize={10} fontFamily="monospace">
              {node.name}
            </text>
          </g>
        ))}
      </svg>
      <span className="mono-label">2D FALLBACK — WEBGL OFFLINE</span>
    </div>
  );
}

export type { GraphNode, GraphEdge };