'use client';
import { useGraphStore } from '../store';

/** Bottom status strip: counts, sim state, truncation warning. */
export function GraphStatusBar() {
  const data = useGraphStore((s) => s.data);
  const simRunning = useGraphStore((s) => s.simRunning);
  const truncated = false;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-void-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-tech">
      <span>
        NODES <span className="text-phosphor">{data.nodes.length}</span> · EDGES{' '}
        <span className="text-phosphor">{data.edges.length}</span>
      </span>
      <span className="flex items-center gap-2">
        {simRunning ? (
          <span className="flex items-center gap-1 text-amber-signal">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-signal" />
            SIMULATING
          </span>
        ) : (
          <span className="text-slate-tech">STATIC</span>
        )}
        {truncated && <span className="text-amber-signal">TRUNCATED</span>}
      </span>
    </div>
  );
}