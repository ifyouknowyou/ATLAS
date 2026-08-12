'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEvidence } from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ClassificationBadge } from '@/components/ui/ClassificationBadge';
import { EvidenceDropzone } from '@/features/evidence/EvidenceDropzone';
import { cn } from '@/lib/cn';

const TYPES = ['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'ARCHIVE', 'WEB_ARTIFACT', 'LOG', 'DATASET', 'OTHER'];
const STATUSES = ['PENDING', 'AVAILABLE', 'ARCHIVED', 'RESTRICTED'];
const CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

interface EvidenceItem {
  id: string;
  name: string;
  kind: string;
  status: string;
  classification: string;
  hash?: string | null;
  mimeType?: string | null;
  size?: number | null;
  processingStatus?: string | null;
  investigationId?: string | null;
  createdAt: string;
}

/** Evidence Vault command center (§3). */
export default function EvidenceVaultPage() {
  const has = useAuth((s) => s.has);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [classification, setClassification] = useState('');
  const [limit, setLimit] = useState(60);

  const query = useEvidence({
    type: type || undefined,
    status: status || undefined,
    classification,
    q: q || undefined,
    limit,
  });

  const items = (query.data?.items ?? []) as unknown as EvidenceItem[];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-4">
      <Panel title="EVIDENCE VAULT" actions={<span className="mono-label">{total} RECORDS</span>}>
        {has('evidence.create') && (
          <EvidenceDropzone
            onUploaded={() => {
              // react-query invalidates ['evidence'] via the mutation.
            }}
          />
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-tech" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search evidence…"
              className="tech-input pl-9"
            />
          </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="tech-input">
            <option value="">ALL TYPES</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="tech-input">
            <option value="">ALL STATUS</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={classification} onChange={(e) => setClassification(e.target.value)} className="tech-input">
            <option value="">ALL CLASSIFICATION</option>
            {CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Panel>

      <Panel title="ALL EVIDENCE">
        {query.isLoading ? (
          <Spinner label="Reading evidence vault" />
        ) : items.length === 0 ? (
          <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No evidence matches the current filters
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="mono-label text-slate-tech/70">
                  <th className="pb-2 pr-3">EVIDENCE</th>
                  <th className="pb-2 pr-3">TYPE</th>
                  <th className="pb-2 pr-3">STATUS</th>
                  <th className="pb-2 pr-3">CLASSIFICATION</th>
                  <th className="pb-2 pr-3">INTEGRITY</th>
                  <th className="pb-2">SIZE</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id} className="border-t border-void-line/50">
                    <td className="py-2 pr-3">
                      <Link
                        href={`/evidence/${ev.id}`}
                        className="font-mono text-xs text-slate-100 hover:text-phosphor"
                      >
                        {ev.name}
                      </Link>
                      {ev.hash && (
                        <span className="ml-2 hidden font-mono text-[10px] text-slate-tech/60 md:inline">
                          {String(ev.hash).slice(0, 12)}…
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3"><StatusBadge tone="neutral">{ev.kind}</StatusBadge></td>
                    <td className="py-2 pr-3">
                      <StatusBadge tone={ev.status === 'AVAILABLE' ? 'signal' : ev.status === 'ARCHIVED' ? 'neutral' : ev.status === 'RESTRICTED' ? 'danger' : 'amber'}>
                        {ev.status}
                      </StatusBadge>
                    </td>
                    <td className="py-2 pr-3"><ClassificationBadge classification={ev.classification} /></td>
                    <td className={cn('py-2 pr-3 font-mono text-[10px] uppercase', ev.processingStatus === 'COMPLETED' ? 'text-phosphor' : ev.processingStatus ? 'text-amber-signal' : 'text-slate-tech/50')}>
                      {ev.processingStatus ?? '—'}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-slate-tech">
                      {Number(ev.size ?? 0).toLocaleString()}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > items.length && (
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setLimit((l) => l + 60)}
              className="tech-button"
            >
              LOAD MORE ({total - items.length} remaining)
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
