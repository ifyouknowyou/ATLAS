'use client';

import { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { TimelinePanel } from './TimelinePanel';
import { TimelineViewport } from './TimelineViewport';

export function TimelineWorkspace({ investigationId }: { investigationId?: string }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [windowHours, setWindowHours] = useState(168);
  const range = useMemo(() => windowHours
    ? { from: new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString(), to: new Date().toISOString() }
    : {}, [windowHours]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div><div className="mono-label flex items-center gap-2 text-phosphor"><Activity className="h-3.5 w-3.5" /> TEMPORAL INTELLIGENCE / EVENT STREAM</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">CHRONOLOGY</h1></div>
        <label className="mono-label flex items-center gap-2">TIME WINDOW
          <select value={windowHours} onChange={(event) => setWindowHours(Number(event.target.value))} className="tech-input w-auto py-1.5 text-xs">
            <option value={24}>LAST 24 HOURS</option><option value={168}>LAST 7 DAYS</option><option value={720}>LAST 30 DAYS</option><option value={0}>ALL EVENTS</option>
          </select>
        </label>
      </header>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <TimelinePanel investigationId={investigationId} from={range.from} to={range.to} onSelectEvent={setSelectedEventId} selectedEventId={selectedEventId} />
        <Panel title="TEMPORAL EVENT FIELD" actions={<span className="mono-label">LIVE RECORDS · {windowHours ? `${windowHours / 24}D WINDOW` : 'FULL RANGE'}</span>}>
          <TimelineViewport
            investigationId={investigationId}
            from={range.from}
            to={range.to}
            onSelectEvent={setSelectedEventId}
            selectedEventId={selectedEventId}
          />
        </Panel>
      </div>
    </div>
  );
}
