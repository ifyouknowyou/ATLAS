'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCreateEntity, useEntities } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { confidenceLabel } from '@/lib/presentation';

const TYPES = ['PERSON', 'ORGANIZATION', 'DOMAIN', 'IP_ADDRESS', 'LOCATION', 'DEVICE', 'ACCOUNT', 'DOCUMENT', 'EVENT', 'OTHER'];

export function EntitiesTab({ id }: { id: string }) {
  const query = useEntities({ investigationId: id, limit: 200 });
  const [creating, setCreating] = useState(false);

  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <Panel title="CASE ENTITIES" actions={
      <Button variant="primary" onClick={() => setCreating(true)}>
        <Plus className="h-4 w-4" /> ADD ENTITY
      </Button>
    }>
      {creating && <EntityCreateForm id={id} onDone={() => setCreating(false)} />}

      {query.isLoading ? (
        <Spinner label="Reading entities" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
          No entities mapped in this case yet
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((entity) => (
            <Link
              key={String(entity.id)}
              href={`/entities/${String(entity.id)}`}
              className="rounded border border-void-line p-3 transition-colors hover:border-phosphor-faint/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs text-slate-100">{String(entity.name)}</span>
                <StatusBadge tone="neutral">{String(entity.type)}</StatusBadge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-tech">
                  CONF {Number(entity.confidence ?? 0)}% · {confidenceLabel(Number(entity.confidence ?? 0))}
                </span>
                {entity.status === 'ARCHIVED' ? (
                  <StatusBadge tone="amber">ARCHIVED</StatusBadge>
                ) : (
                  <StatusBadge tone="signal">ACTIVE</StatusBadge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

function EntityCreateForm({ id, onDone }: { id: string; onDone: () => void }) {
  const create = useCreateEntity();
  const [name, setName] = useState('');
  const [type, setType] = useState('PERSON');
  const [description, setDescription] = useState('');
  const [confidence, setConfidence] = useState('50');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        name,
        description: description || undefined,
        type,
        confidence: Number(confidence),
        investigationId: id,
      });
      setName('');
      setDescription('');
      setConfidence('50');
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create entity');
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mb-4 rounded border border-void-line bg-void-raised/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Field label="NAME" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <label className="block">
          <span className="mono-label block">TYPE</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="tech-input mt-1.5">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mono-label block">CONFIDENCE {confidence}%</span>
          <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(e.target.value)}
            className="mt-3 w-full accent-[#4fd8c8]" />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mono-label block">DESCRIPTION</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          className="tech-input mt-1.5 min-h-[60px]" placeholder="Analytical notes…" />
      </label>
      {error && (
        <div className="mt-3 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
          {error}
        </div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" onClick={onDone}>CANCEL</Button>
        <Button type="submit" variant="primary" disabled={create.isPending}>
          {create.isPending ? 'SAVING…' : 'SAVE ENTITY'}
        </Button>
      </div>
    </form>
  );
}