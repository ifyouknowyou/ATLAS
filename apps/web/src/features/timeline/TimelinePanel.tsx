'use client';
import { useMemo, useState } from 'react';
import { TIMELINE_EVENT_KINDS } from '@atlas/shared';
import type { TimelineRow } from '@/lib/queries';
import { useTimeline } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { kindColor } from './engine/timelineEngine';
import { formatWhen } from '@/lib/presentation';

interface TimelinePanelProps {
  investigationId?: string;
  onSelectEvent?: (eventId: string | null) => void;
}

/** Timeline filters + event detail list (§26/§27). */
export function TimelinePanel({ investigationId, onSelectEvent }: TimelinePanelProps) {
  const [activeKinds, setActiveKinds] = useState<Set<string>>(new Set());
  const { data, isLoading } = useTimeline({ investigationId, limit: 200 });
  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    if (activeKinds.size === 0) return items;
    return items.filter((e) => activeKinds.has(e.kind));
  }, [items, activeKinds]);

  const toggle = (kind: string) => {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  return (
    <Panel title="TIMELINE" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {TIMELINE_EVENT_KINDS.map((kind) => (
          <button
            key={kind}
            onClick={() => toggle(kind)}
            className={`mono-label rounded border px-1.5 py-0.5 text-[9px] ${
              activeKinds.has(kind)
                ? 'border-phosphor-faint bg-phosphor-faint/20 text-phosphor'
                : 'border-void-line text-slate-tech'
            }`}
          >
            {kind}
          </button>
        ))}
      </div>

      <div className="max-h-96 space-y-1 overflow-auto pr-1">
        {isLoading && <p className="font-mono text-[11px] text-slate-tech">LOADING</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="font-mono text-[11px] text-slate-tech">NO EVENTS</p>
        )}
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => onSelectEvent?.(e.id)}
            className="flex w-full items-start gap-2 rounded border border-void-line/60 px-2 py-1.5 text-left hover:border-phosphor-faint/40"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: kindColor(e.kind) }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] text-void">{e.title}</span>
              <span className="block font-mono text-[10px] text-slate-tech">{formatWhen(e.occurredAt)}</span>
            </span>
            <span className="mono-label text-[9px] text-slate-tech">{e.kind}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export type { TimelineRow };