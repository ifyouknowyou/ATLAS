'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, FileText, Plus, ShieldCheck } from 'lucide-react';
import { useReports, useReportTemplates, useCreateReportFromTemplate } from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ClassificationBadge } from '@/components/ui/ClassificationBadge';
import { ApiError } from '@/lib/api-client';
import { AtlasScene } from '@/features/scenes/AtlasScene';

interface ReportItem {
  id: string;
  title: string;
  status: string;
  classification: string;
  aiGenerated: boolean;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

/** Report builder landing — list reports + create from template (§21, §26). */
export default function ReportsPage() {
  const has = useAuth((s) => s.has);
  const reports = useReports();
  const templates = useReportTemplates();
  const createFromTemplate = useCreateReportFromTemplate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const items = (reports.data?.items ?? []) as ReportItem[];
  const publishedCount = items.filter((report) => report.status === 'PUBLISHED').length;
  const restrictedCount = items.filter((report) => ['CONFIDENTIAL', 'RESTRICTED'].includes(report.classification)).length;
  const statusCounts = items.reduce<Record<string, number>>((counts, report) => {
    counts[report.status] = (counts[report.status] ?? 0) + 1;
    return counts;
  }, {});

  const openPicker = () => {
    setTitle('');
    setTemplateId((templates.data as Array<{ id: string }> | undefined)?.[0]?.id ?? '');
    setError(null);
    setPickerOpen(true);
  };

  const submit = () => {
    if (!title.trim() || !templateId) return;
    createFromTemplate.mutate(
      { title: title.trim(), templateId },
      {
        onSuccess: (data) => {
          setPickerOpen(false);
          const id = (data as { id?: string }).id;
          if (id) window.location.href = `/reports/${id}`;
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : 'Failed to create report'),
      },
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div><div className="mono-label flex items-center gap-2 text-phosphor"><FileText className="h-3.5 w-3.5" /> DISSEMINATION / DOCUMENT CONTROL</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">REPORT ARCHIVE</h1></div>
        <span className="mono-label">{items.length} LOADED · {reports.data?.total ?? items.length} TOTAL</span>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <ReportMetric icon={<FileText className="h-4 w-4" />} label="LOADED REPORTS" value={reports.isLoading ? '—' : items.length} />
        <ReportMetric icon={<BarChart3 className="h-4 w-4" />} label="PUBLISHED" value={reports.isLoading ? '—' : publishedCount} />
        <ReportMetric icon={<ShieldCheck className="h-4 w-4" />} label="RESTRICTED CLASSIFICATION" value={reports.isLoading ? '—' : restrictedCount} />
      </section>
      {!reports.isLoading && !reports.isError && items.length > 0 && <Panel title="REPORT STATUS ANALYTICS" actions={<span className="mono-label">LIVE REPORT RECORDS</span>}>
        <AtlasScene
          kind="columns"
          records={Object.entries(statusCounts).map(([status, value]) => ({ id: status, label: status, category: 'REPORT STATUS', value, status }))}
          className="h-[340px]"
        />
      </Panel>}
      <Panel
        title="REPORTS"
        actions={
          has('report.create') && (
            <Button onClick={openPicker}>
              <Plus className="h-3.5 w-3.5" /> NEW REPORT
            </Button>
          )
        }
      >
        {reports.isLoading ? (
          <Spinner label="Loading reports" />
        ) : reports.isError ? (
          <p role="alert" className="py-12 text-center font-mono text-xs uppercase tracking-widest text-amber-signal">Report archive unavailable</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No reports yet — create one from a template
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2.5 transition-colors hover:border-phosphor-faint"
              >
                <FileText className="h-4 w-4 text-slate-tech" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">
                  {r.title}
                </span>
                <StatusBadge tone={r.status === 'PUBLISHED' ? 'signal' : r.status === 'DRAFT' ? 'neutral' : r.status === 'ARCHIVED' ? 'neutral' : 'amber'}>
                  {r.status}
                </StatusBadge>
                <ClassificationBadge classification={r.classification} />
                <span className="hidden font-mono text-[10px] text-slate-tech/70 md:inline">
                  v{r.currentVersion}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="CREATE REPORT FROM TEMPLATE" wide>
        <div className="space-y-3">
          <Field label="TITLE">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Report title"
              className="tech-input"
            />
          </Field>
          <Field label="TEMPLATE">
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="tech-input"
            >
              {(templates.data as Array<{ id: string; name: string }> | undefined)?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          {templates.isError && <p role="alert" className="text-xs text-danger">Report templates could not be loaded.</p>}
          {!templates.isLoading && !templates.isError && !(templates.data as Array<{ id: string }> | undefined)?.length && <p className="text-xs text-amber-signal">No templates are available for this account.</p>}
          {error && (
            <p className="rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={() => setPickerOpen(false)}>CANCEL</Button>
            <Button
              type="button"
              variant="primary"
              disabled={!title.trim() || !templateId || createFromTemplate.isPending}
              onClick={submit}
            >
              {createFromTemplate.isPending ? 'CREATING…' : 'CREATE REPORT'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ReportMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return <div className="panel flex items-center gap-3 p-3"><span className="text-phosphor">{icon}</span><div><div className="mono-label">{label}</div><div className="mt-1 font-mono text-xl text-slate-100">{value}</div></div></div>;
}
