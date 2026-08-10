'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useCreateEvidence, useEvidence } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { classificationTone, formatWhen } from '@/lib/presentation';

const TYPES = ['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'ARCHIVE', 'WEB_ARTIFACT', 'LOG', 'DATASET', 'OTHER'];

export default function EvidencePage() {
  const has = useAuth((s) => s.has);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const query = useEvidence({
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    limit: 60,
  });

  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl tracking-wide text-slate-100">EVIDENCE</h1>
          <p className="mt-1 text-sm text-slate-tech">
            Metadata + integrity records. Files and chain-of-custody arrive in Phase 5.
          </p>
        </div>
        {has('evidence.create') && (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> ADD EVIDENCE
          </Button>
        )}
      </header>

      {showCreate && <EvidenceCreateDialog onClose={() => setShowCreate(false)} />}

      <Panel title="EVIDENCE WORKSPACE">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-tech/60" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence…" className="tech-input pl-9" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="tech-input w-auto py-1.5 text-xs" aria-label="Filter by type">
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="tech-input w-auto py-1.5 text-xs" aria-label="Filter by status">
            <option value="">Any status</option>
            {['PENDING', 'AVAILABLE', 'ARCHIVED', 'RESTRICTED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto font-mono text-[11px] text-slate-tech/70">{query.data?.total ?? 0} RECORDS</span>
        </div>

        {query.isLoading ? (
          <div className="mt-4"><Spinner label="Reading evidence" /></div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">No evidence records match</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-void-line">
                  {['TITLE', 'TYPE', 'STATUS', 'CLASS', 'HASH', 'COLLECTED'].map((h) => (
                    <th key={h} className="mono-label px-3 py-2 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={String(ev.id)} className="border-b border-void-line/50 hover:bg-void-raised">
                    <td className="px-3 py-3">
                      <div className="font-mono text-xs text-slate-100">{String(ev.name)}</div>
                      {String(ev.description ?? '') && <div className="mt-0.5 max-w-md truncate text-[11px] text-slate-tech">{String(ev.description)}</div>}
                    </td>
                    <td className="px-3 py-3"><StatusBadge tone="neutral">{String(ev.kind)}</StatusBadge></td>
                    <td className="px-3 py-3">
                      <StatusBadge tone={ev.status === 'AVAILABLE' ? 'signal' : ev.status === 'PENDING' ? 'neutral' : 'amber'}>
                        {String(ev.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-3"><StatusBadge tone={classificationTone(String(ev.classification))}>{String(ev.classification)}</StatusBadge></td>
                    <td className="px-3 py-3 font-mono text-[10px] text-slate-tech">
                      {ev.hash ? String(ev.hash).slice(0, 10) + '…' : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-[10px] text-slate-tech">{ev.collectedAt ? formatWhen(String(ev.collectedAt)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function EvidenceCreateDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateEvidence();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hash, setHash] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        title,
        description: description || undefined,
        hash: hash || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add evidence');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="panel-title mb-4">NEW EVIDENCE RECORD</h2>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <Field label="TITLE" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
          <label className="block">
            <span className="mono-label block">DESCRIPTION</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="tech-input mt-1.5 min-h-[70px]" />
          </label>
          <Field
            label="SHA-256 HASH (OPTIONAL)"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="64-character hex digest"
          />
          {error && (
            <div className="rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose}>CANCEL</Button>
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? 'SAVING…' : 'ADD EVIDENCE'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}