'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BarChart3, Play, Radar } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useInvestigations } from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';

type AnalysisRecord = {
  id: string;
  analysisType: string;
  status: string;
  investigationId?: string | null;
  createdAt: string;
};

const analysisTypes = ['CENTRALITY', 'COMMUNITY', 'PATH', 'CLUSTERING', 'CHANGE_DETECTION', 'TEMPORAL', 'GEOSPATIAL'];

export default function IntelligenceAnalyticsPage() {
  const token = useAuth((state) => state.token);
  const canCreate = useAuth((state) => state.has('analytics.create'));
  const client = useQueryClient();
  const investigations = useInvestigations({ limit: 100 });
  const [investigationId, setInvestigationId] = useState('');
  const [analysisType, setAnalysisType] = useState(analysisTypes[0]);
  const analyses = useQuery({
    queryKey: ['intelligence-analyses'],
    queryFn: () => api.get<AnalysisRecord[]>('/intelligence/analyses', token),
    enabled: Boolean(token),
    refetchInterval: 15_000,
  });
  const trigger = useMutation({
    mutationFn: () =>
      api.post<AnalysisRecord>('/intelligence/analyses', {
        analysisType,
        ...(investigationId ? { investigationId } : {}),
      }, token),
    onSuccess: () => client.invalidateQueries({ queryKey: ['intelligence-analyses'] }),
  });
  const rows = useMemo(() => analyses.data ?? [], [analyses.data]);
  const counts = useMemo(() => analysisTypes.map((type) => ({
    type,
    count: rows.filter((row) => row.analysisType === type).length,
  })), [rows]);
  const maximum = Math.max(1, ...counts.map((item) => item.count));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div>
          <div className="mono-label flex items-center gap-2 text-phosphor"><Radar className="h-3.5 w-3.5" /> INTELLIGENCE / ANALYTICS</div>
          <h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">ANALYTICAL OPERATIONS</h1>
        </div>
        {canCreate && <button type="button" disabled={trigger.isPending} onClick={() => trigger.mutate()} className="tech-button-primary px-3 py-2 text-xs disabled:opacity-50">
          <Play className="h-3.5 w-3.5" /> {trigger.isPending ? 'QUEUEING…' : 'RUN ANALYSIS'}
        </button>}
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel title="ANALYSIS ACTIVITY" actions={<span className="mono-label">{rows.length} RUNS</span>}>
          {analyses.isLoading ? <Spinner label="Loading analysis history" /> : analyses.isError ? <EmptyState title="ANALYTICS UNAVAILABLE" detail="Analysis history could not be loaded." /> : rows.length === 0 ? <EmptyState title="NO ANALYSIS RUNS" detail="Choose a supported analysis and queue the first run." /> : (
            <div className="divide-y divide-void-line/60">
              {rows.map((row) => <article key={row.id} className="grid gap-2 py-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0"><h2 className="truncate font-mono text-xs text-slate-100">{row.analysisType.replaceAll('_', ' ')}</h2><p className="mt-1 truncate font-mono text-[9px] text-slate-tech">{row.investigationId ? `CASE ${row.investigationId}` : 'ORGANIZATION SCOPE'} · {formatWhen(row.createdAt)}</p></div>
                <StatusBadge tone={row.status === 'COMPLETED' ? 'signal' : row.status === 'FAILED' ? 'danger' : 'amber'}>{row.status}</StatusBadge>
                <span className="font-mono text-[9px] text-slate-tech">{row.id.slice(0, 8)}</span>
              </article>)}
            </div>
          )}
        </Panel>

        <Panel title="RUN CONFIGURATION">
          <label className="mb-3 block">
            <span className="mono-label mb-1 block">ANALYSIS TYPE</span>
            <select value={analysisType} onChange={(event) => setAnalysisType(event.target.value)} className="tech-input">
              {analysisTypes.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mono-label mb-1 block">INVESTIGATION SCOPE</span>
            <select value={investigationId} onChange={(event) => setInvestigationId(event.target.value)} className="tech-input">
              <option value="">Organization-wide</option>
              {(investigations.data?.items ?? []).map((investigation) => <option key={investigation.id} value={investigation.id}>{investigation.title}</option>)}
            </select>
          </label>
          {investigations.isError && <p className="mt-2 text-xs text-amber-signal">Investigation list unavailable; organization-wide runs remain available.</p>}
          {trigger.isError && <p role="alert" className="mt-3 text-xs text-danger">{trigger.error instanceof Error ? trigger.error.message : 'Could not queue analysis'}</p>}
          <div className="mt-4 flex items-center gap-2 border-t border-void-line pt-3 font-mono text-[9px] uppercase tracking-widest text-slate-tech"><Activity className="h-3.5 w-3.5 text-phosphor" /> Backend analysis queue</div>
        </Panel>
      </section>

      <Panel title="ANALYSIS DISTRIBUTION">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {counts.map(({ type, count }) => <div key={type} className="rounded border border-void-line/60 bg-void-raised/40 p-2">
            <div className="mb-2 flex items-center justify-between"><span className="truncate font-mono text-[8px] text-slate-tech">{type.replaceAll('_', ' ')}</span><BarChart3 className="h-3 w-3 text-phosphor" /></div>
            <div className="font-mono text-lg text-slate-100">{analyses.isLoading ? '—' : count}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-void-line"><div className="h-full bg-phosphor/70 transition-[width]" style={{ width: `${(count / maximum) * 100}%` }} /></div>
          </div>)}
        </div>
      </Panel>
    </div>
  );
}
