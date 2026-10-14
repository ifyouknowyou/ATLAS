'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, ShieldCheck, ServerCog } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';
import { AtlasScene } from '@/features/scenes/AtlasScene';

type SystemHealth = Record<string, 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'>;
type AuditRecord = Record<string, unknown> & { id: string; createdAt: string };

export default function AdministrationPage() {
  const token = useAuth((state) => state.token);
  const isAdmin = useAuth((state) => state.has('settings.manage'));
  const operations = useQuery({
    queryKey: ['admin-operations'],
    queryFn: () => api.get<SystemHealth>('/admin/operations', token),
    enabled: Boolean(token && isAdmin),
    refetchInterval: 30_000,
  });
  const audit = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get<AuditRecord[]>('/admin/audit', token),
    enabled: Boolean(token && isAdmin),
  });

  if (!isAdmin) return <EmptyState title="ADMINISTRATOR ACCESS REQUIRED" detail="This console is restricted to authorized administrators. API authorization remains authoritative." />;
  const services = Object.entries(operations.data ?? {});

  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
      <div><div className="mono-label flex items-center gap-2 text-phosphor"><ServerCog className="h-3.5 w-3.5" /> PLATFORM CONTROL / RESTRICTED</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">ADMINISTRATION</h1></div>
      <StatusBadge tone={operations.data && Object.values(operations.data).some((status) => status !== 'HEALTHY') ? 'amber' : 'signal'}>{operations.isLoading ? 'CHECKING' : operations.isError ? 'STATUS UNAVAILABLE' : 'OPERATIONS'}</StatusBadge>
    </header>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]">
      <Panel title="API-REPORTED OPERATIONS" actions={<span className="mono-label">REFRESH · 30S</span>}>
        {operations.isLoading ? <Spinner label="Checking system health" /> : operations.isError ? <EmptyState title="OPERATIONS UNAVAILABLE" detail="System health could not be loaded. Access may be restricted." /> : <>
          <AtlasScene kind="systems" records={services.map(([service, status]) => ({ id: service, label: service, category: 'SYSTEM SERVICE', status }))} className="h-[300px]" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {services.map(([service, status]) => <div key={service} className="flex items-center gap-3 rounded border border-void-line/60 bg-void-raised/30 p-3">
              <span className="text-phosphor">{service === 'database' ? <Database className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</span>
              <span className="min-w-0 flex-1 font-mono text-xs uppercase text-slate-100">{service}</span>
              <StatusBadge tone={status === 'HEALTHY' ? 'signal' : status === 'UNHEALTHY' ? 'danger' : 'amber'}>{status}</StatusBadge>
            </div>)}
          </div>
        </>}
      </Panel>

      <Panel title="AUDIT TRAIL" actions={<span className="mono-label">{audit.data?.length ?? 0} EVENTS</span>}>
        {audit.isLoading ? <Spinner label="Loading audit trail" /> : audit.isError ? <EmptyState title="AUDIT UNAVAILABLE" detail="Audit records could not be loaded. Access may be restricted." /> : !audit.data?.length ? <EmptyState title="NO AUDIT EVENTS" detail="No audit records are available." /> : <div className="max-h-[460px] space-y-1 overflow-y-auto pr-1">
          {audit.data.slice(0, 100).map((record) => <article key={record.id} className="rounded border border-void-line/50 px-2.5 py-2">
            <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-phosphor" /><span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-100">{String(record.action ?? record.eventType ?? 'AUDIT EVENT')}</span><span className="shrink-0 font-mono text-[9px] text-slate-tech">{formatWhen(record.createdAt)}</span></div>
            <div className="mt-1 truncate pl-5 font-mono text-[9px] text-slate-tech">{[record.actorId, record.resourceType, record.resourceId].filter(Boolean).map(String).join(' · ') || 'Details not provided'}</div>
          </article>)}
          {audit.data.length > 100 && <p className="pt-2 font-mono text-[9px] text-slate-tech">Showing latest 100 of {audit.data.length} records returned.</p>}
        </div>}
      </Panel>
    </section>
  </div>;
}
