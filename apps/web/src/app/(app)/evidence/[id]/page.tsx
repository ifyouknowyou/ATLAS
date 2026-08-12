'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import {
  useEvidenceDetail,
  useEvidenceVersions,
  useEvidenceAccessHistory,
  useEvidenceAnnotations,
  useEvidenceLinks,
  useEvidenceProcessing,
  useArchiveEvidence,
  useProcessEvidence,
} from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ClassificationBadge } from '@/components/ui/ClassificationBadge';
import { EvidenceViewer } from '@/features/evidence/EvidenceViewer';
import { CommentComposer } from '@/features/collaboration/CommentComposer';
import { usePresence } from '@/lib/use-presence';

type Tab = 'annotations' | 'context' | 'comments';

/**
 * Evidence detail — 3-panel layout per §55: METADATA | PREVIEW | CONTEXT,
 * with a chain-of-custody/activity footer and live presence.
 */
export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const has = useAuth((s) => s.has);
  const { data: evidence, isLoading, isError } = useEvidenceDetail(id);
  const { data: versions } = useEvidenceVersions(id);
  const { data: history } = useEvidenceAccessHistory(id);
  const { data: annotations } = useEvidenceAnnotations(id);
  const { data: links } = useEvidenceLinks(id);
  const { data: processing } = useEvidenceProcessing(id);
  const archive = useArchiveEvidence(id);
  const process = useProcessEvidence(id);
  const { activeUsers } = usePresence({ resourceType: 'EVIDENCE', resourceId: id });
  const [tab, setTab] = useState<Tab>('annotations');

  if (isLoading) return <Spinner label="Loading evidence" />;
  if (isError || !evidence) return notFound();

  const status = String(evidence.status ?? 'PENDING');

  const download = () => {
    api.download(`/evidence/${id}/download`, useAuth.getState().token).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = String(evidence.name ?? 'evidence');
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/evidence" className="tech-button" aria-label="Back to evidence vault">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div>
            <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-slate-100">
              {String(evidence.name)}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge tone={status === 'AVAILABLE' ? 'signal' : status === 'ARCHIVED' ? 'neutral' : 'amber'}>
                {status}
              </StatusBadge>
              <ClassificationBadge classification={String(evidence.classification)} />
              {activeUsers.length > 0 && (
                <span className="font-mono text-[10px] text-phosphor">
                  ● {activeUsers.length} ACTIVE NOW
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {has('evidence.download') && status !== 'ARCHIVED' && (
            <Button onClick={download}>
              <Download className="h-3.5 w-3.5" /> DOWNLOAD
            </Button>
          )}
          {has('evidence.update') && (
            <Button onClick={() => archive.mutate(status !== 'ARCHIVED')}>
              {status === 'ARCHIVED' ? 'RESTORE' : 'ARCHIVE'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_280px]">
        {/* METADATA */}
        <Panel title="EVIDENCE METADATA">
          <dl className="space-y-2 font-mono text-[11px]">
            {(
              [
                ['Hash', evidence.hash ? String(evidence.hash) : '—'],
                ['MIME', evidence.mimeType ?? '—'],
                ['Size', evidence.size ? `${Number(evidence.size).toLocaleString()}B` : '—'],
                ['Source', evidence.source ?? '—'],
                ['Reference', evidence.reference ?? '—'],
                ['Uploaded', new Date(String(evidence.createdAt)).toLocaleString()],
              ] as Array<[string, string]>
            ).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 border-b border-void-line/40 pb-1.5">
                <dt className="text-slate-tech/70">{k}</dt>
                <dd className="break-all text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 space-y-1">
            <p className="mono-label">LINKS ({links?.length ?? 0})</p>
            {links && links.length > 0 ? (
              links.map((l) => (
                <div key={String((l as { id: string }).id)} className="flex justify-between text-[11px]">
                  <span className="text-slate-tech">{String((l as { targetType: string }).targetType)}</span>
                  <span className="font-mono text-slate-300">{String((l as { targetId: string }).targetId).slice(0, 10)}…</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-tech/70">No linked resources</p>
            )}
          </div>
        </Panel>

        {/* PREVIEW */}
        <div className="space-y-3">
          <Panel title="PREVIEW" className="p-0">
            <div className="p-4">
              <EvidenceViewer id={id} />
            </div>
          </Panel>
          {has('evidence.process') && (
            <Panel title="PROCESSING" actions={
              <Button onClick={() => process.mutate('TEXT_EXTRACTION')}>
                <RefreshCw className="h-3.5 w-3.5" /> EXTRACT TEXT
              </Button>
            }>
              {processing && processing.length > 0 ? (
                <ul className="space-y-1">
                  {processing.map((j) => (
                    <li key={String((j as { id: string }).id)} className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-tech">{String((j as { kind: string }).kind)}</span>
                      <StatusBadge tone={(j as { status: string }).status === 'COMPLETED' ? 'signal' : (j as { status: string }).status === 'FAILED' ? 'danger' : 'amber'}>
                        {String((j as { status: string }).status)}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-tech/70">No processing jobs yet</p>
              )}
            </Panel>
          )}
        </div>

        {/* CONTEXT */}
        <Panel title="CONTEXT">
          <div className="mb-3 flex gap-1">
            {(['annotations', 'context', 'comments'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  tab === t ? 'bg-phosphor-dim/20 text-phosphor' : 'text-slate-tech hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'annotations' && (
            <div className="space-y-2">
              {annotations && annotations.length > 0 ? (
                annotations.map((a) => (
                  <div key={String((a as { id: string }).id)} className="rounded border border-void-line px-2 py-1.5 text-[11px]">
                    <span className="mr-2 font-mono text-slate-tech">{String((a as { type: string }).type)}</span>
                    <span className="text-slate-200">{String((a as { content?: string }).content ?? '')}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-tech/70">No annotations yet</p>
              )}
            </div>
          )}
          {tab === 'context' && (
            <div className="space-y-1 text-[11px] text-slate-tech">
              <p>Linked entities, timeline and AI analysis appear here in the workspace.</p>
              <p>Versions: {versions?.length ?? 0}</p>
              <p>Access events: {history?.length ?? 0}</p>
            </div>
          )}
          {tab === 'comments' && (
            <CommentComposer targetType="EVIDENCE" targetId={id} />
          )}
        </Panel>
      </div>

      {/* Chain of custody */}
      <Panel title="CHAIN OF CUSTODY / ACTIVITY">
        {history && history.length > 0 ? (
          <ol className="space-y-1.5">
            {history.map((e) => (
              <li key={String((e as { id: string }).id)} className="flex items-center gap-3 font-mono text-[11px]">
                <StatusBadge tone="neutral">{String((e as { action: string }).action)}</StatusBadge>
                <span className="text-slate-tech">
                  {new Date(String((e as { createdAt: string }).createdAt)).toLocaleString()}
                </span>
                <span className="text-slate-tech/60">by {(e as { actorType: string }).actorType}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-6 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No access events recorded
          </p>
        )}
      </Panel>
    </div>
  );
}
