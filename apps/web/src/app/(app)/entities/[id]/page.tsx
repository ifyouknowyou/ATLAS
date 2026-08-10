'use client';

import Link from 'next/link';
import { ArrowLeft, Link2 } from 'lucide-react';
import { useEntity, useEvidence } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { confidenceLabel, formatWhen } from '@/lib/presentation';

export default function EntityProfilePage({ params }: { params: { id: string } }) {
  return <EntityProfile id={params.id} />;
}

function EntityProfile({ id }: { id: string }) {
  const { data, isLoading } = useEntity(id);
  const entity = data as
    | (Record<string, unknown> & {
        id: string;
        type: string;
        name: string;
        displayName?: string | null;
        description?: string | null;
        summary?: string | null;
        status: string;
        confidence: number;
        uri?: string | null;
        tags?: string[];
        properties?: Record<string, unknown> | null;
        latitude?: number | null;
        longitude?: number | null;
        createdAt: string;
        updatedAt: string;
        investigation?: { id: string; title: string } | null;
        outgoingRelationships?: Array<Record<string, unknown>>;
        incomingRelationships?: Array<Record<string, unknown>>;
        notes?: Array<Record<string, unknown>>;
      })
    | undefined;

  const investigationId = entity?.investigation?.id;
  const evidence = useEvidence({ investigationId, limit: 20 });

  if (isLoading) return <Spinner label="Loading entity" />;
  if (!entity) {
    return (
      <div className="panel flex flex-col items-center gap-2 py-16 text-center">
        <span className="mono-label">ENTITY NOT FOUND</span>
        <span className="text-sm text-slate-tech">This entity is not accessible to your organization.</span>
      </div>
    );
  }

  const relationships = [
    ...((entity.outgoingRelationships ?? []) as Array<Record<string, unknown>>),
    ...((entity.incomingRelationships ?? []) as Array<Record<string, unknown>>),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={investigationId ? `/investigations/${investigationId}?tab=ENTITIES` : '/entities'}
        className="flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-tech hover:text-phosphor"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> ENTITIES
      </Link>

      {/* Identity header */}
      <header className="panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">{entity.type}</StatusBadge>
          <StatusBadge tone={entity.status === 'ARCHIVED' ? 'amber' : 'signal'}>{entity.status}</StatusBadge>
          <span className="ml-auto font-mono text-[10px] text-slate-tech/70">
            UPDATED {formatWhen(entity.updatedAt)}
          </span>
        </div>
        <h1 className="mt-3 font-mono text-xl tracking-wide text-slate-100">
          {entity.displayName ?? entity.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-tech">
          <span>CONFIDENCE {entity.confidence}% · {confidenceLabel(entity.confidence)}</span>
          {entity.uri && <span className="truncate">{entity.uri}</span>}
          {entity.latitude != null && entity.longitude != null && (
            <span>{entity.latitude.toFixed(2)}, {entity.longitude.toFixed(2)}</span>
          )}
        </div>
        {entity.description && <p className="mt-3 max-w-3xl text-sm text-slate-tech">{entity.description}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attributes */}
        <Panel title="ATTRIBUTES">
          <dl className="space-y-2">
            <Attribute label="IDENTIFIER" value={entity.name} />
            <Attribute label="TYPE" value={entity.type} />
            <Attribute label="STATUS" value={entity.status} />
            <Attribute label="CONFIDENCE" value={`${entity.confidence}%`} />
            {entity.tags && entity.tags.length > 0 && (
              <div className="flex items-center justify-between py-1">
                <dt className="mono-label">TAGS</dt>
                <dd className="flex gap-1">
                  {entity.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] text-phosphor-dim">#{t}</span>
                  ))}
                </dd>
              </div>
            )}
            {entity.properties &&
              Object.entries(entity.properties as Record<string, unknown>).map(([key, value]) => (
                <Attribute key={key} label={key.toUpperCase()} value={String(value)} />
              ))}
          </dl>
        </Panel>

        {/* Relationships */}
        <Panel title="RELATIONSHIPS" className="lg:col-span-2">
          {relationships.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              No relationships recorded
            </p>
          ) : (
            <div className="space-y-1">
              {relationships.map((rel) => (
                <div key={String(rel.id)} className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-phosphor-dim" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">
                    {describeRelationship(entity.id, rel)}
                  </span>
                  <StatusBadge tone="neutral">{String(rel.kind ?? '')}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Investigations + evidence + notes */}
        <Panel title="INVESTIGATIONS">
          {entity.investigation ? (
            <Link
              href={`/investigations/${entity.investigation.id}`}
              className="flex items-center gap-2 rounded border border-void-line px-3 py-2 hover:border-phosphor-faint/40"
            >
              <span className="font-mono text-xs text-slate-100">{entity.investigation.title}</span>
            </Link>
          ) : (
            <p className="py-4 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              Not linked to a case
            </p>
          )}
          <div className="mt-3">
            <div className="mono-label mb-2">CASE EVIDENCE</div>
            {(evidence.data?.items ?? []).slice(0, 5).map((ev) => (
              <div key={String(ev.id)} className="py-1 font-mono text-[10px] text-slate-tech">
                {String(ev.name)}
              </div>
            ))}
          </div>
        </Panel>

        {/* Notes */}
        <Panel title="NOTES" className="lg:col-span-2">
          {(entity.notes ?? []).length === 0 ? (
            <p className="py-6 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              No notes attached
            </p>
          ) : (
            (entity.notes ?? []).map((note) => (
              <article key={String(note.id)} className="rounded border border-void-line/60 p-3">
                <div className="font-mono text-xs text-slate-100">{String(note.title)}</div>
                <span className="mt-1 block font-mono text-[10px] text-slate-tech/70">{String(note.visibility)}</span>
              </article>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <dt className="mono-label">{label}</dt>
      <dd className="max-w-[60%] truncate font-mono text-[11px] text-slate-200">{value}</dd>
    </div>
  );
}

function describeRelationship(entityId: string, rel: Record<string, unknown>): string {
  const source = rel.source as { id: string; name: string } | undefined;
  const target = rel.target as { id: string; name: string } | undefined;
  if (!source || !target) return '—';
  return `${source.id === entityId ? target.name : source.name} · ${String(rel.kind ?? '')}`;
}