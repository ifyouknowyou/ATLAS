'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEvidence } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function EvidenceTab({ id }: { id: string }) {
  const query = useEvidence({ investigationId: id, limit: 300 });
  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <Panel title="CASE EVIDENCE">
      {query.isLoading ? (
        <Spinner label="Reading evidence" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
          No evidence metadata in this case yet
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((ev) => (
            <div key={String(ev.id)} className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{String(ev.name)}</span>
              <span className="hidden font-mono text-[10px] text-slate-tech/70 md:inline">
                {String(ev.mimeType ?? '—')} · {Number(ev.size ?? 0).toLocaleString()}B
              </span>
              <StatusBadge tone="neutral">{String(ev.kind)}</StatusBadge>
              <StatusBadge tone={ev.status === 'AVAILABLE' ? 'signal' : ev.status === 'PENDING' ? 'neutral' : 'amber'}>
                {String(ev.status)}
              </StatusBadge>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}