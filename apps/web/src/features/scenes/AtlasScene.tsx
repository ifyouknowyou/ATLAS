'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { List, RotateCcw } from 'lucide-react';

export type AtlasSceneKind =
  | 'terrain'
  | 'cylinder'
  | 'radar'
  | 'analytics'
  | 'columns'
  | 'archive'
  | 'timeline'
  | 'systems'
  | 'workflow'
  | 'constellation';

export interface AtlasSceneRecord {
  id: string;
  label: string;
  category?: string;
  status?: string;
  value?: number;
  occurredAt?: string;
}

const SceneCanvas = dynamic(() => import('./AtlasSceneCanvas'), {
  ssr: false,
  loading: () => <div className="h-full min-h-64 animate-pulse bg-phosphor-dim/5" aria-label="Loading 3D data scene" />,
});

export function AtlasScene({
  kind,
  records,
  className = '',
  onSelect,
}: {
  kind: AtlasSceneKind;
  records: AtlasSceneRecord[];
  className?: string;
  onSelect?: (record: AtlasSceneRecord) => void;
}) {
  const [selected, setSelected] = useState<AtlasSceneRecord | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const sceneRecords = records.slice(0, 80);
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  return (
    <div className={`relative isolate overflow-hidden rounded-lg border border-void-line bg-[#050b13] ${className}`}>
      <SceneCanvas
        kind={kind}
        records={sceneRecords}
        resetKey={resetKey}
        onSelect={(record) => {
          setSelected(record);
          onSelect?.(record);
        }}
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded border border-void-line/70 bg-[#050b13]/75 px-2 py-1 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-glow" />
        <span className="mono-label text-[8px]">
          3D DATA FIELD · {sceneRecords.length}{records.length > sceneRecords.length ? ` / ${records.length}` : ''} RECORDS
        </span>
      </div>
      <button
        type="button"
        onClick={() => setResetKey((current) => current + 1)}
        className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded border border-void-line/70 bg-[#050b13]/75 px-2 py-1 font-mono text-[8px] text-slate-tech backdrop-blur hover:border-phosphor-faint/40 hover:text-phosphor focus-visible:outline focus-visible:outline-2 focus-visible:outline-phosphor"
        aria-label="Reset 3D camera"
      >
        <RotateCcw className="h-3 w-3" /> RESET VIEW
      </button>
      <button
        type="button"
        onClick={() => setListOpen((open) => !open)}
        className="absolute right-3 top-10 z-10 flex items-center gap-1 rounded border border-void-line/70 bg-[#050b13]/75 px-2 py-1 font-mono text-[8px] text-slate-tech backdrop-blur hover:border-phosphor-faint/40 hover:text-phosphor focus-visible:outline focus-visible:outline-2 focus-visible:outline-phosphor"
        aria-expanded={listOpen}
      >
        <List className="h-3 w-3" /> DATA INDEX
      </button>
      {listOpen && (
        <div className="absolute right-3 top-[4.5rem] z-20 max-h-[65%] w-64 max-w-[70%] overflow-y-auto rounded border border-void-line bg-[#050b13]/95 p-2 shadow-panel backdrop-blur">
          {sceneRecords.length ? sceneRecords.map((record) => (
            <button key={record.id} type="button" onClick={() => { setSelected(record); onSelect?.(record); }} className="flex w-full items-center gap-2 border-b border-void-line/50 px-2 py-2 text-left last:border-0 hover:bg-void-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-phosphor">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor" />
              <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-100">{record.label}</span>
              {record.category && <span className="max-w-20 truncate font-mono text-[8px] text-slate-tech">{record.category}</span>}
            </button>
          )) : <p className="px-2 py-4 text-center font-mono text-[9px] text-slate-tech">NO RECORDS AVAILABLE</p>}
        </div>
      )}
      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 rounded border border-phosphor-faint/30 bg-[#050b13]/85 px-3 py-2 backdrop-blur">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor" />
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{selected.label}</span>
          {selected.category && <span className="font-mono text-[9px] text-slate-tech">{selected.category}</span>}
          <button type="button" onClick={() => setSelected(null)} className="font-mono text-[9px] text-slate-tech hover:text-phosphor" aria-label="Clear selected record">CLEAR</button>
        </div>
      )}
      {!listOpen && <ul className="sr-only" aria-label="Scene records">
        {records.map((record) => (
          <li key={record.id}>
            <button type="button" onClick={() => { setSelected(record); onSelect?.(record); }}>
              {record.label}{record.category ? `, ${record.category}` : ''}
            </button>
          </li>
        ))}
      </ul>}
    </div>
  );
}
