'use client';

import { useCallback } from 'react';
import type { GlobeNode } from '../data/demoNodes';
import { useGlobe, hoveredNode } from '../hooks/useGlobeState';

/**
 * DOM overlay companion to the 3D scene: coordinates readout, selection
 * details and demo-data disclaimer.
 */
export function GlobeHud({ nodes }: { nodes: GlobeNode[] }) {
  const selectedId = useGlobe((s) => s.selectedId);
  const hoveredId = useGlobe((s) => s.hoveredId);
  const setSelected = useGlobe((s) => s.setSelected);

  const hovered = hoveredNode(nodes, hoveredId);
  const selected = hoveredNode(nodes, selectedId);

  const clear = useCallback(() => setSelected(null), [setSelected]);

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-phosphor animate-pulse-slow shadow-glow" />
        <span className="mono-label">GLOBE-01 · AUTHORIZED GEOINT FEED</span>
      </div>

      {hovered && !selected && (
        <HoverCard node={hovered} />
      )}

      {selected && (
        <div className="pointer-events-auto absolute inset-x-4 bottom-4 rounded border border-phosphor-faint/40 bg-void/85 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mono-label text-phosphor">SELECTED SIGNAL</div>
              <div className="mt-1 font-mono text-lg text-slate-100">{selected.name}</div>
              <div className="mt-1 font-mono text-[11px] text-slate-tech">
                {selected.type} · {formatCoordinate(selected.latitude, 'N', 'S')} /{' '}
                {formatCoordinate(selected.longitude, 'E', 'W')}
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded border border-void-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-signal">
                LIVE
              </span>
              <button
                type="button"
                className="tech-button px-2 py-1"
                onClick={clear}
                aria-label="Clear selection"
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HoverCard({ node }: { node: GlobeNode }) {
  const setHovered = useGlobe((s) => s.setHovered);
  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-4 rounded border border-void-line bg-void/85 px-3 py-2 backdrop-blur"
      onMouseEnter={() => setHovered(node.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="font-mono text-xs text-slate-200">{node.name}</div>
      <div className="mt-0.5 font-mono text-[10px] text-slate-tech">
        {node.type} · {node.latitude.toFixed(2)}, {node.longitude.toFixed(2)}
      </div>
    </div>
  );
}

function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}°${value < 0 ? negative : positive}`;
}