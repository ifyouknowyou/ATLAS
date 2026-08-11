'use client';
import { Focus, Pause, Play } from 'lucide-react';
import { GRAPH_LAYOUTS } from '@atlas/shared';
import type { GraphLayout } from '@atlas/shared';
import { useGraphStore } from '../store';
import { Button } from '@/components/ui/Button';

interface GraphToolbarProps {
  onFit?: () => void;
  onToggleSim?: () => void;
}

/** Compact toolbar: layout switcher, fit, pause/resume. */
export function GraphToolbar({ onFit, onToggleSim }: GraphToolbarProps) {
  const layoutKind = useGraphStore((s) => s.layoutKind);
  const setLayout = useGraphStore((s) => s.setLayout);
  const simRunning = useGraphStore((s) => s.simRunning);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="mono-label text-slate-tech">LAYOUT</span>
        <select
          value={layoutKind}
          onChange={(e) => setLayout(e.target.value as GraphLayout)}
          className="tech-input h-8 border-void-line bg-void-raised font-mono text-[11px] uppercase tracking-widest text-phosphor focus:border-phosphor-faint/50 focus:outline-none"
          aria-label="Graph layout"
        >
          {GRAPH_LAYOUTS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <Button variant="default" onClick={onFit} title="Fit graph to view" aria-label="Fit graph">
        <Focus className="h-3.5 w-3.5" />
        <span className="mono-label">FIT</span>
      </Button>
      <Button
        variant="default"
        onClick={onToggleSim}
        title={simRunning ? 'Pause simulation' : 'Resume simulation'}
        aria-label={simRunning ? 'Pause simulation' : 'Resume simulation'}
      >
        {simRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        <span className="mono-label">{simRunning ? 'PAUSE' : 'PLAY'}</span>
      </Button>
    </div>
  );
}