'use client';

import { useDashboard } from '@/lib/queries';
import { MetricTile } from '@/components/ui/MetricTile';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { InvestigationGraph } from '../graph3d/GraphViewport';
import { formatWhen } from '@/lib/presentation';

export function OverviewTab({ id }: { id: string }) {
  const { data, isLoading } = useDashboard(id);

  if (isLoading || !data) {
    return <Spinner label="Assembling overview" />;
  }

  const counts = data.counts ?? {};
  const nodes = (data.graph?.nodes ?? []).map((n) => ({
    id: String(n.id),
    name: String(n.name),
    type: String(n.type ?? 'OTHER'),
    confidence: Number(n.confidence ?? 0),
  }));
  const edges = (data.graph?.edges ?? []).map((e) => ({
    id: String(e.id),
    sourceId: String(e.sourceId),
    targetId: String(e.targetId),
    kind: String(e.kind),
    confidence: Number(e.confidence ?? 0),
  }));
  const activity = data.recentActivity ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="ENTITIES" value={counts.entities ?? 0} hint="mapped subjects" />
        <MetricTile label="RELATIONSHIPS" value={counts.relationships ?? 0} hint="typed links" />
        <MetricTile label="EVIDENCE" value={counts.evidence ?? 0} hint="metadata records" />
        <MetricTile label="TASKS" value={counts.tasks ?? 0} hint="work items" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvestigationGraph
            nodes={nodes}
            edges={edges}
            className="h-[430px]"
            entityHref={(nodeId) => `/entities/${nodeId}`}
          />
        </div>

        <Panel title="RECENT ACTIVITY" className="flex flex-col">
          <div className="flex-1 space-y-2">
            {activity.length === 0 ? (
              <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
                No activity yet
              </p>
            ) : (
              activity.map((event: Record<string, unknown>) => (
                <div key={String(event.id)} className="flex items-start gap-3 border-b border-void-line/40 py-2 last:border-0">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-200">{String(event.message)}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-tech/70">
                      {formatWhen(String(event.createdAt))} ·{' '}
                      {(event.user as { displayName?: string } | null)?.displayName ?? 'system'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}