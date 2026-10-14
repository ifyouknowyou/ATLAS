'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Activity, ArrowUpRight, Radio } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';
import { AtlasScene } from '@/features/scenes/AtlasScene';

type AlertRecord = {
  id: string;
  title: string;
  description?: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  createdAt: string;
  investigationId?: string | null;
};

type WatchlistRecord = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { items?: number };
};

const severityStyle: Record<AlertRecord['severity'], string> = {
  CRITICAL: 'border-danger/50 text-danger',
  HIGH: 'border-amber-signal/50 text-amber-signal',
  MEDIUM: 'border-sky-300/40 text-sky-300',
  LOW: 'border-slate-tech/40 text-slate-tech',
};

export default function IntelligenceAlertsPage() {
  const token = useAuth((state) => state.token);
  const canUpdate = useAuth((state) => state.has('alert.update'));
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('');
  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<AlertRecord[]>('/alerts', token),
    enabled: Boolean(token),
  });
  const watchlistsQuery = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => api.get<WatchlistRecord[]>('/watchlists', token),
    enabled: Boolean(token),
  });
  const action = useMutation({
    mutationFn: ({ id, dismiss }: { id: string; dismiss: boolean }) =>
      api.post(`/alerts/${id}/${dismiss ? 'dismiss' : 'acknowledge'}`, dismiss ? { reason: 'Dismissed from alert console' } : {}, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const allAlerts = useMemo(() => alertsQuery.data ?? [], [alertsQuery.data]);
  const alerts = useMemo(
    () => severityFilter ? allAlerts.filter((alert) => alert.severity === severityFilter) : allAlerts,
    [allAlerts, severityFilter],
  );
  const counts = useMemo(() => ({
    CRITICAL: allAlerts.filter((alert) => alert.severity === 'CRITICAL').length,
    HIGH: allAlerts.filter((alert) => alert.severity === 'HIGH').length,
    MEDIUM: allAlerts.filter((alert) => alert.severity === 'MEDIUM').length,
    LOW: allAlerts.filter((alert) => alert.severity === 'LOW').length,
  }), [allAlerts]);
  const activeCount = allAlerts.filter((alert) => !['DISMISSED', 'RESOLVED'].includes(alert.status)).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div>
          <div className="mono-label flex items-center gap-2 text-amber-signal"><Radio className="h-3.5 w-3.5" /> THREAT MONITOR / LIVE FEED</div>
          <h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">ALERTS & WATCHLISTS</h1>
        </div>
        <label className="mono-label flex items-center gap-2">
          SEVERITY
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="tech-input w-auto py-1.5 text-xs">
            <option value="">ALL LEVELS</option>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => <option key={severity}>{severity}</option>)}
          </select>
        </label>
      </header>

      <section className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => (
          <button key={severity} type="button" onClick={() => setSeverityFilter(severityFilter === severity ? '' : severity)} className={`panel flex items-center justify-between px-3 py-2 text-left ${severityFilter === severity ? 'border-phosphor-faint/70' : ''}`}>
            <span className={`font-mono text-[10px] tracking-widest ${severityStyle[severity].split(' ').at(-1)}`}>{severity}</span>
            <span className="font-mono text-lg text-slate-100">{alertsQuery.isLoading ? '—' : counts[severity]}</span>
          </button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Panel title="ALERT RADAR" actions={<span className="mono-label">{activeCount} ACTIVE SIGNALS</span>}>
          <AtlasScene
            kind="radar"
            records={alerts.map((alert) => ({ id: alert.id, label: alert.title, category: alert.severity, status: alert.status }))}
            className="h-[320px]"
          />
          <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-tech"><Activity className="h-3 w-3 text-amber-signal" /> alert distribution · actual records</div>
        </Panel>

        <Panel title="WATCHLIST OVERVIEW" className="max-h-[390px] overflow-y-auto">
          {watchlistsQuery.isLoading ? <Spinner label="Loading watchlists" /> : watchlistsQuery.isError ? <p className="text-xs text-amber-signal">Watchlists are unavailable.</p> : (watchlistsQuery.data ?? []).length === 0 ? <EmptyState title="NO WATCHLISTS" detail="No watchlists are available to your account." /> : (
            <div className="space-y-1">
              {(watchlistsQuery.data ?? []).map((watchlist) => (
                <Link key={watchlist.id} href={`/watchlists?id=${encodeURIComponent(watchlist.id)}`} className="flex items-center gap-2 border-b border-void-line/60 py-2 hover:text-phosphor">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{watchlist.name}</span>
                  <span className="font-mono text-[10px] text-slate-tech">{watchlist._count?.items ?? '—'}</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-tech" />
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel title="ALERT FEED" actions={<span className="mono-label">{alerts.length} RECORDS</span>}>
        {alertsQuery.isLoading ? <Spinner label="Loading alerts" /> : alertsQuery.isError ? <EmptyState title="ALERT FEED UNAVAILABLE" detail="The alert service could not be reached. Refresh to retry." /> : alerts.length === 0 ? <EmptyState title="NO ALERTS" detail="No alert records match this filter." /> : (
          <div className="divide-y divide-void-line/60">
            {alerts.map((alert) => (
              <article key={alert.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-widest ${severityStyle[alert.severity]}`}>{alert.severity}</span>
                    <StatusBadge tone={alert.status === 'OPEN' ? 'amber' : alert.status === 'DISMISSED' ? 'neutral' : 'signal'}>{alert.status}</StatusBadge>
                    <span className="font-mono text-[10px] text-slate-tech">{formatWhen(alert.createdAt)}</span>
                  </div>
                  <h2 className="mt-1 font-mono text-sm text-slate-100">{alert.title}</h2>
                  {alert.description && <p className="mt-1 text-xs text-slate-tech">{alert.description}</p>}
                </div>
                {canUpdate && alert.status === 'OPEN' && <div className="flex gap-2">
                  <button type="button" disabled={action.isPending} onClick={() => action.mutate({ id: alert.id, dismiss: false })} className="tech-button px-2 py-1 text-[10px]">ACKNOWLEDGE</button>
                  <button type="button" disabled={action.isPending} onClick={() => action.mutate({ id: alert.id, dismiss: true })} className="tech-button-danger px-2 py-1 text-[10px]">DISMISS</button>
                </div>}
              </article>
            ))}
          </div>
        )}
        {action.isError && <p role="alert" className="mt-3 font-mono text-xs text-danger">{action.error instanceof Error ? action.error.message : 'Alert update failed'}</p>}
      </Panel>
    </div>
  );
}
