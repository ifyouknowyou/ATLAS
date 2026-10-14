'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bot,
  Database,
  FileText,
  Landmark,
  Radar,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { GlobeViewport } from '@/features/globe/GlobeViewport';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { useEntities, useInvestigations, useOrganization } from '@/lib/queries';
import { MetricTile } from '@/components/ui/MetricTile';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { statusTone, priorityTone, formatWhen } from '@/lib/presentation';

export default function OverviewPage() {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);
  const token = useAuth((s) => s.token);
  const canReadAlerts = useAuth((s) => s.has('alert.read'));
  const org = useOrganization();
  const investigations = useInvestigations({ limit: 5 });
  const entities = useEntities({ limit: 6 });
  const alerts = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<Array<{ status: string }>>('/alerts', token),
    enabled: Boolean(token && canReadAlerts),
  });

  const counts = (org.data?._count as
    | Record<string, number>
    | undefined) ?? {};

  const modules: Array<{
    title: string;
    phase: string;
    icon: React.ReactNode;
  }> = [
    { title: 'Relationship Graph', phase: 'PHASE 3', icon: <Radar /> },
    { title: 'Geospatial Map', phase: 'PHASE 3', icon: <Landmark /> },
    { title: 'AI Assistant', phase: 'PHASE 4', icon: <Bot /> },
    { title: 'Report Builder', phase: 'PHASE 5', icon: <FileText /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-void-line/70 pb-4">
        <div>
          <div className="mono-label flex items-center gap-2 text-phosphor">
            <span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-glow" />
            COMMAND CENTER / AUTHORIZED CHANNEL
          </div>
          <h1 className="mt-2 font-mono text-2xl tracking-wide text-slate-100">
            ATLAS COMMAND
          </h1>
          <p className="mt-1 text-sm text-slate-tech">
            {principal ? `Signed in as ${principal.role.toLowerCase()} · ` : ''}
            Encryption-grade operations workspace for authorized intelligence
            work.
          </p>
        </div>
        <div className="mono-label flex items-center gap-2">
          <span className="flex items-center gap-2 rounded border border-phosphor-faint/30 bg-phosphor-dim/10 px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-phosphor animate-pulse-slow" />
            LIVE TELEMETRY
          </span>
        </div>
      </header>

      {/* Intelligence metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="INVESTIGATIONS" value={counts.investigations ?? 0} busy={org.isLoading} hint="authorized case files" />
        <MetricTile label="ENTITIES" value={counts.entities ?? 0} busy={org.isLoading} hint="people · infrastructure · orgs" />
        <MetricTile label="SOURCES" value={counts.dataSources ?? counts.sources ?? 0} busy={org.isLoading} hint="connected intelligence feeds" />
        <MetricTile label="ACTIVE ALERTS" value={canReadAlerts ? alerts.data?.filter((alert) => !['DISMISSED', 'RESOLVED'].includes(alert.status)).length ?? '—' : '—'} busy={canReadAlerts && alerts.isLoading} hint={alerts.isError ? 'alert feed unavailable' : 'unresolved signals'} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <GlobeViewport className="atlas-command-globe min-h-[520px] xl:h-[560px]" />

        <div className="flex flex-col gap-4">
          <Panel title="MISSION REGISTER" className="flex min-h-[260px] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto">
            {investigations.isLoading ? (
              <Spinner />
            ) : (investigations.data?.items ?? []).length === 0 ? (
              <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
                No investigations yet
              </p>
            ) : (
              (investigations.data?.items ?? []).map((inv) => {
                const row = inv as InvestigationRow;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => router.push(`/investigations/${row.id}`)}
                    className="block w-full rounded border border-transparent px-2 py-2 text-left transition-colors hover:border-void-line hover:bg-void-raised"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs text-slate-100">
                        {row.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-tech/60" />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge tone={statusTone(row.status)}>
                        {row.status}
                      </StatusBadge>
                      <StatusBadge tone={priorityTone(row.priority)}>
                        {row.priority}
                      </StatusBadge>
                      <span className="ml-auto font-mono text-[10px] text-slate-tech/70">
                        {formatWhen(row.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
            </div>
            <button type="button" onClick={() => router.push('/investigations')} className="mt-3 flex items-center justify-between border-t border-void-line pt-3 font-mono text-[10px] uppercase tracking-widest text-phosphor hover:text-slate-100">
              OPEN CASE REGISTER <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Panel>
          <Panel title="SYSTEM SIGNAL" className="flex flex-1 flex-col justify-between">
            <div className="flex items-center gap-3 border-b border-void-line pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-phosphor-faint/30 bg-phosphor-dim/10"><ShieldCheck className="h-5 w-5 text-phosphor" /></div>
              <div><div className="font-mono text-sm text-slate-100">SECURITY ENFORCED</div><div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-tech">All access is audited</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4"><Signal icon={<Database />} label="DATA" value="SYNC" /><Signal icon={<Users />} label="OPS" value={String(counts.memberships ?? 0)} /></div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="TOP ENTITIES" className="lg:col-span-1">
          <div className="space-y-1">
            {(entities.data?.items ?? []).slice(0, 5).map((entity, index) => (
              <div key={String(entity.id)} className="flex items-center gap-3 border-b border-void-line/60 py-2 last:border-0">
                <span className="font-mono text-[10px] text-phosphor-dim">0{index + 1}</span>
                <div className="min-w-0 flex-1"><div className="truncate font-mono text-xs text-slate-100">{String(entity.name ?? entity.displayName ?? 'Unnamed entity')}</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-tech">{String(entity.type ?? 'UNKNOWN')}</div></div>
                <span className="font-mono text-[10px] text-amber-signal">{Number(entity.confidence ?? 0)}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="ANALYTICAL SURFACES" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
        {modules.map((m) => (
          <div
            key={m.title}
            className="panel flex items-center gap-3 p-4 transition-colors hover:border-phosphor-faint/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded border border-void-line bg-void-raised text-slate-tech">
              {m.icon}
            </div>
            <div>
              <div className="text-sm text-slate-200">{m.title}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-tech/70">
                {m.phase} delivery
              </div>
            </div>
          </div>
        ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-2 rounded border border-void-line/70 bg-void-raised/50 px-2.5 py-2"><span className="text-slate-tech">{icon}</span><span className="font-mono text-[9px] uppercase tracking-widest text-slate-tech">{label}</span><span className="ml-auto font-mono text-[10px] text-phosphor">{value}</span></div>;
}

type InvestigationRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
};