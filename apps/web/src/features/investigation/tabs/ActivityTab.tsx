'use client';

import { useActivity } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { formatWhen } from '@/lib/presentation';

export function ActivityTab({ id }: { id: string }) {
  const { data, isLoading } = useActivity(id, 100);
  const items = (data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <Panel title="INVESTIGATION ACTIVITY">
      {isLoading ? (
        <Spinner label="Reading activity" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
          No activity recorded
        </p>
      ) : (
        <div className="relative space-y-0">
          {items.map((event, index) => (
            <div key={String(event.id)} className="relative flex gap-3 pb-4">
              {index < items.length - 1 && (
                <span className="absolute left-[3px] top-3 h-full w-px bg-void-line" />
              )}
              <span className="relative z-10 mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor" />
              <div className="min-w-0">
                <div className="text-[11px] text-slate-200">{String(event.message)}</div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-tech/70">
                  {formatWhen(String(event.createdAt))} ·{' '}
                  {(event.user as { displayName?: string } | null)?.displayName ?? 'system'} ·{' '}
                  <span className="uppercase">{String(event.type)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}