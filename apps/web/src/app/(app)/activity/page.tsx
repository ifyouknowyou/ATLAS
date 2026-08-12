'use client';

import { useState } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import { useRealtimeStore } from '@/lib/realtime-store';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

const FILTERS = ['ALL', 'EVIDENCE', 'REPORTS', 'COLLABORATION', 'INVESTIGATION', 'AI'] as const;

/**
 * Live activity feed (§45). Consumes the SSE stream's `activity` events, which
 * the CollaborationEventsService broadcasts as changes happen. Filter groups
 * map event types to buckets client-side; the stream is the source of truth.
 */
export default function ActivityPage() {
  const activity = useRealtimeStore((s) => s.activity);
  const connectionState = useRealtimeStore((s) => s.connectionState);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');

  const bucket = (type: string): (typeof FILTERS)[number] => {
    if (/EVIDENCE/.test(type)) return 'EVIDENCE';
    if (/REPORT/.test(type)) return 'REPORTS';
    if (/COMMENT|MENTION|PRESENCE|COLLABORATION|MEMBER/.test(type)) return 'COLLABORATION';
    if (/INVESTIGATION|ENTITY|RELATIONSHIP|TASK|NOTE/.test(type)) return 'INVESTIGATION';
    if (/AI/.test(type)) return 'AI';
    return 'ALL';
  };

  const items = activity.filter((m) => {
    if (filter === 'ALL') return true;
    return bucket(m.message ?? '') === filter;
  });

  return (
    <div className="space-y-4">
      <Panel
        title="ACTIVITY FEED"
        actions={
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  filter === f ? 'bg-phosphor-dim/20 text-phosphor' : 'text-slate-tech hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        {connectionState === 'offline' && (
          <p className="mb-2 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            Live updates offline — showing events received so far.
          </p>
        )}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <ActivityIcon className="h-6 w-6 text-slate-tech" />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              No activity yet
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((m) => (
              <li key={`${m.id}-${m.createdAt}`} className="flex items-center gap-3 rounded border border-void-line/50 px-3 py-2">
                <StatusBadge tone="neutral">{m.type}</StatusBadge>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-200">
                  {m.message ?? m.type}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-slate-tech/60">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
