'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCreateEntity, useEntities } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { confidenceLabel } from '@/lib/presentation';

const TYPES = ['PERSON', 'ORGANIZATION', 'DOMAIN', 'IP_ADDRESS', 'LOCATION', 'DEVICE', 'ACCOUNT', 'DOCUMENT', 'EVENT', 'OTHER'];

export default function EntitiesPage() {
  const has = useAuth((s) => s.has);
  const [type, setType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const query = useEntities({
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    limit: 60,
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl tracking-wide text-slate-100">ENTITIES</h1>
          <p className="mt-1 text-sm text-slate-tech">
            Persons, organizations, infrastructure and artifacts under analysis.
          </p>
        </div>
        {has('entity.create') && (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> ADD ENTITY
          </Button>
        )}
      </header>

      {showCreate && <EntityCreateDialog onClose={() => setShowCreate(false)} />}

      <Panel title="ENTITY REGISTER">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono-label">TYPE</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="tech-input w-auto py-1.5 text-xs" aria-label="Filter by type">
            <option value="">Any type</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="mono-label">STATUS</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="tech-input w-auto py-1.5 text-xs" aria-label="Filter by status">
            <option value="">Any status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <span className="ml-auto font-mono text-[11px] text-slate-tech/70">{query.data?.total ?? 0} ENTITIES</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {query.isLoading ? (
            <div className="col-span-full"><Spinner label="Reading entities" /></div>
          ) : (query.data?.items ?? []).length === 0 ? (
            <p className="col-span-full py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              No entities match
            </p>
          ) : (
            (query.data?.items ?? []).map((entity) => {
              const row = entity as {
                id: string;
                name: string;
                type: string;
                description?: string | null;
                status: string;
                confidence: number;
                tags?: string[];
              };
              return (
                <Link
                  key={row.id}
                  href={`/entities/${row.id}`}
                  className="rounded border border-void-line p-3 transition-colors hover:border-phosphor-faint/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs text-slate-100">{row.name}</span>
                    <StatusBadge tone="neutral">{row.type}</StatusBadge>
                  </div>
                  {row.description && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-tech">{row.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-tech">
                      CONF {row.confidence}% · {confidenceLabel(row.confidence)}
                    </span>
                    <StatusBadge tone={row.status === 'ARCHIVED' ? 'amber' : 'signal'}>{row.status}</StatusBadge>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Panel>
    </div>
  );
}

function EntityCreateDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateEntity();
  const [name, setName] = useState('');
  const [type, setType] = useState('PERSON');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const created = await create.mutateAsync({
        name,
        type,
        description: description || undefined,
      });
      onClose();
      if (created && typeof created === 'object' && 'id' in created) {
        window.location.href = `/entities/${String((created as { id: string }).id)}`;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create entity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="panel-title mb-4">NEW ENTITY</h2>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <Field label="NAME" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          <label className="block">
            <span className="mono-label block">TYPE</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="tech-input mt-1.5">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mono-label block">DESCRIPTION</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="tech-input mt-1.5 min-h-[80px]" />
          </label>
          {error && (
            <div className="rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose}>CANCEL</Button>
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? 'CREATING…' : 'CREATE ENTITY'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}