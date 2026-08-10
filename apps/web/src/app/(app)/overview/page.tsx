'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bot,
  FileText,
  Landmark,
  Radar,
} from 'lucide-react';
import { GlobeViewport } from '@/features/globe/GlobeViewport';
import { useAuth } from '@/lib/auth-store';
import { useInvestigations, useOrganization } from '@/lib/queries';
import { MetricTile } from '@/components/ui/MetricTile';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { statusTone, priorityTone, formatWhen } from '@/lib/presentation';

export default function OverviewPage() {
  const router = useRouter();
  const principal = useAuth((s) => s.principal);
  const org = useOrganization();
  const investigations = useInvestigations({ limit: 5 });

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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl tracking-wide text-slate-100">
            OVERVIEW
          </h1>
          <p className="mt-1 text-sm text-slate-tech">
            {principal ? `Signed in as ${principal.role.toLowerCase()} · ` : ''}
            Encryption-grade operations workspace for authorized intelligence
            work.
          </p>
        </div>
        <div className="mono-label flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-phosphor animate-pulse-slow" />
          LIVE TELEMETRY
        </div>
      </header>

      {/* Intelligence metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="ACTIVE CASES" value={counts.investigations ?? 0} busy={org.isLoading} hint="open across workspaces" />
        <MetricTile label="ENTITIES" value={counts.entities ?? 0} busy={org.isLoading} hint="persons · infra · orgs" />
        <MetricTile label="WORKSPACES" value={counts.workspaces ?? 0} busy={org.isLoading} hint="isolated org boundaries" />
        <MetricTile label="OPERATORS" value={counts.memberships ?? 0} busy={org.isLoading} hint="role-scoped members" />
      </section>

      {/* Hero 3D intelligence space + active cases */}
      <section className="grid gap-6 lg:grid-cols-3">
        <GlobeViewport className="h-[440px] lg:col-span-2" />

        <Panel title="ACTIVE INVESTIGATIONS" className="flex flex-col">
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
        </Panel>
      </section>

      {/* Boundary map for later phases */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </section>
    </div>
  );
}

type InvestigationRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
};