'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, Workflow } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';
import { AtlasScene } from '@/features/scenes/AtlasScene';
import { useEntities } from '@/lib/queries';

type AlertRow = { id: string; title: string; severity: string; status: string; createdAt: string };
type AnalysisRow = { id: string; analysisType: string; status: string; createdAt: string };
type WorkflowRow = { id: string; name: string; isPublished: boolean };

export default function IntelligenceOperationsPage() {
  const token = useAuth((state) => state.token);
  const canReadAlerts = useAuth((state) => state.has('alert.read'));
  const canReadAnalytics = useAuth((state) => state.has('analytics.read'));
  const canReadWorkflows = useAuth((state) => state.has('workflow.read'));
  const alerts = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<AlertRow[]>('/alerts', token),
    enabled: Boolean(token && canReadAlerts),
  });
  const analyses = useQuery({
    queryKey: ['intelligence-analyses'],
    queryFn: () => api.get<AnalysisRow[]>('/intelligence/analyses', token),
    enabled: Boolean(token && canReadAnalytics),
  });
  const workflows = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get<WorkflowRow[]>('/workflows', token),
    enabled: Boolean(token && canReadWorkflows),
  });
  const entities = useEntities({ limit: 80 });
  const activeAlerts = (alerts.data ?? []).filter((alert) => !['DISMISSED', 'RESOLVED'].includes(alert.status));
  const recentAnalysis = analyses.data?.slice(0, 5) ?? [];
  const entityRecords = (entities.data?.items ?? []).map((entity) => ({
    id: String(entity.id),
    label: String(entity.name ?? entity.displayName ?? 'Unnamed entity'),
    category: String(entity.type ?? 'UNKNOWN'),
    status: String(entity.status ?? ''),
  }));
  const entityCategories = entityRecords.reduce<Record<string, number>>((counts, entity) => {
    counts[entity.category] = (counts[entity.category] ?? 0) + 1;
    return counts;
  }, {});

  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
      <div><div className="mono-label flex items-center gap-2 text-phosphor"><Activity className="h-3.5 w-3.5" /> AUTHORIZED INTELLIGENCE SERVICES</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">INTELLIGENCE OPERATIONS</h1></div>
      <StatusBadge tone="signal">LIVE DATA</StatusBadge>
    </header>

    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryCard href={canReadAlerts ? '/intelligence/alerts' : undefined} icon={<AlertTriangle className="h-4 w-4" />} title="ALERTS" count={canReadAlerts ? alerts.data ? String(activeAlerts.length) : alerts.isLoading ? '—' : 'UNAVAILABLE' : 'RESTRICTED'} detail={alerts.isError ? 'Alert feed unavailable' : 'Unresolved signals'} tone="amber" />
      <SummaryCard href={canReadAnalytics ? '/intelligence/analytics' : undefined} icon={<BarChart3 className="h-4 w-4" />} title="ANALYTICS" count={canReadAnalytics ? analyses.data ? String(analyses.data.length) : analyses.isLoading ? '—' : 'UNAVAILABLE' : 'RESTRICTED'} detail="Recorded analysis runs" />
      <SummaryCard href={canReadWorkflows ? '/intelligence/workflows' : undefined} icon={<Workflow className="h-4 w-4" />} title="WORKFLOWS" count={canReadWorkflows ? workflows.data ? String(workflows.data.filter((workflow) => workflow.isPublished).length) : workflows.isLoading ? '—' : 'UNAVAILABLE' : 'RESTRICTED'} detail="Published automations" />
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
      <Panel title="INTELLIGENCE ORBITAL FIELD" actions={<span className="mono-label">{entityRecords.length} LOADED ENTITIES</span>}>
        <AtlasScene kind="cylinder" records={entityRecords} className="h-[360px]" />
      </Panel>
      <Panel title="ENTITY CATEGORIES">
        {entities.isLoading ? <Spinner label="Loading entity categories" /> : entities.isError ? <p role="status" className="py-6 text-center font-mono text-xs text-amber-signal">ENTITY DATA UNAVAILABLE</p> : Object.keys(entityCategories).length === 0 ? <p className="py-6 text-center font-mono text-xs text-slate-tech">NO ENTITY CATEGORIES</p> : <div className="space-y-2">{Object.entries(entityCategories).sort((a, b) => b[1] - a[1]).map(([category, count]) => <div key={category} className="flex items-center justify-between border-b border-void-line/50 pb-2"><span className="font-mono text-[10px] text-slate-tech">{category}</span><span className="font-mono text-sm text-slate-100">{count}</span></div>)}</div>}
      </Panel>
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]">
      <Panel title="ANALYSIS ACTIVITY" actions={canReadAnalytics ? <Link href="/intelligence/analytics" className="mono-label text-phosphor hover:text-slate-100">OPEN CONSOLE ↗</Link> : undefined}>
        {!canReadAnalytics ? <p className="py-8 text-center font-mono text-xs text-slate-tech">ANALYTICS ACCESS NOT GRANTED</p> : analyses.isLoading ? <Spinner label="Loading analysis history" /> : analyses.isError ? <p role="status" className="py-8 text-center font-mono text-xs text-amber-signal">ANALYSIS HISTORY UNAVAILABLE</p> : recentAnalysis.length === 0 ? <p className="py-8 text-center font-mono text-xs text-slate-tech">NO ANALYSIS RUNS RECORDED</p> : <div className="divide-y divide-void-line/60">{recentAnalysis.map((row) => <div key={row.id} className="flex flex-wrap items-center gap-3 py-2"><div className="min-w-0 flex-1"><div className="truncate font-mono text-xs text-slate-100">{row.analysisType.replaceAll('_', ' ')}</div><div className="mt-1 font-mono text-[9px] text-slate-tech">{formatWhen(row.createdAt)}</div></div><StatusBadge tone={row.status === 'COMPLETED' ? 'signal' : row.status === 'FAILED' ? 'danger' : 'amber'}>{row.status}</StatusBadge></div>)}</div>}
      </Panel>
      <Panel title="CURRENT ALERTS" actions={canReadAlerts ? <Link href="/intelligence/alerts" className="mono-label text-phosphor hover:text-slate-100">OPEN FEED ↗</Link> : undefined}>
        {!canReadAlerts ? <p className="py-8 text-center font-mono text-xs text-slate-tech">ALERT ACCESS NOT GRANTED</p> : alerts.isLoading ? <Spinner label="Loading alerts" /> : alerts.isError ? <p role="status" className="py-8 text-center font-mono text-xs text-amber-signal">ALERT FEED UNAVAILABLE</p> : activeAlerts.length === 0 ? <p className="py-8 text-center font-mono text-xs text-slate-tech">NO ACTIVE ALERTS</p> : <div className="space-y-1">{activeAlerts.slice(0, 6).map((alert) => <Link key={alert.id} href="/intelligence/alerts" className="flex items-center gap-2 rounded px-2 py-2 hover:bg-void-raised"><span className={`h-1.5 w-1.5 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-danger' : alert.severity === 'HIGH' ? 'bg-amber-signal' : 'bg-phosphor'}`} /><span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{alert.title}</span><span className="font-mono text-[9px] text-slate-tech">{formatWhen(alert.createdAt)}</span><ArrowUpRight className="h-3 w-3 text-slate-tech" /></Link>)}</div>}
      </Panel>
    </section>
  </div>;
}

function SummaryCard({ href, icon, title, count, detail, tone = 'signal' }: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  count: string;
  detail: string;
  tone?: 'signal' | 'amber';
}) {
  const content = <>
    <span className={`grid h-10 w-10 place-items-center rounded border ${tone === 'amber' ? 'border-amber-signal/30 text-amber-signal' : 'border-phosphor-faint/30 text-phosphor'}`}>{icon}</span>
    <span className="min-w-0 flex-1"><span className="mono-label block">{title}</span><span className="mt-1 block font-mono text-2xl text-slate-100">{count}</span><span className="text-[10px] text-slate-tech">{detail}</span></span>
    {href && <ArrowUpRight className="h-4 w-4 text-slate-tech transition-colors group-hover:text-phosphor" />}
  </>;
  return href
    ? <Link href={href} className="panel group flex items-center gap-3 p-4 transition-colors hover:border-phosphor-faint/50">{content}</Link>
    : <div className="panel flex items-center gap-3 p-4 opacity-70" aria-disabled="true">{content}</div>;
}
