'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreateRelationship, useEntities, useRelationships } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';

const TYPES = [
  'ASSOCIATED_WITH', 'OWNS', 'WORKS_FOR', 'LOCATED_AT', 'USES', 'CONTROLS',
  'CONNECTED_TO', 'MEMBER_OF', 'RELATED_TO', 'OBSERVED_WITH', 'CUSTOM',
] as const;

export function RelationshipsTab({ id }: { id: string }) {
  const query = useRelationships({ investigationId: id, limit: 300 });
  const [creating, setCreating] = useState(false);

  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <Panel
      title="CASE RELATIONSHIPS"
      actions={
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> LINK ENTITIES
        </Button>
      }
    >
      {creating && <RelationshipCreateForm id={id} onDone={() => setCreating(false)} />}

      {query.isLoading ? (
        <Spinner label="Reading relationships" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
          No relationships mapped in this case yet
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((rel) => {
            const source = rel.source as { id: string; name: string; type: string };
            const target = rel.target as { id: string; name: string; type: string };
            return (
              <div key={String(rel.id)} className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">
                  {source.name}
                  <span className="mx-2 text-phosphor-dim">↔</span>
                  {target.name}
                </span>
                <StatusBadge tone="neutral">{String(rel.kind)}</StatusBadge>
                <span className="font-mono text-[10px] text-slate-tech">CONF {Number(rel.confidence ?? 0)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function RelationshipCreateForm({ id, onDone }: { id: string; onDone: () => void }) {
  const create = useCreateRelationship();
  const entities = useEntities({ investigationId: id, limit: 300 });
  const options = (entities.data?.items ?? []) as Array<{ id: string; name: string; type: string }>;

  const [type, setType] = useState<(typeof TYPES)[number]>('ASSOCIATED_WITH');
  const [direction, setDirection] = useState('UNDIRECTED');
  const [confidence, setConfidence] = useState('50');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sourceOptions = options.filter((e) => e.name.toLowerCase().includes(sourceQuery.toLowerCase()));
  const targetOptions = options.filter(
    (e) => e.name.toLowerCase().includes(targetQuery.toLowerCase()) && e.id !== source,
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!source || !target || source === target) {
      setError('Choose two distinct entities');
      return;
    }
    try {
      await create.mutateAsync({
        sourceEntityId: source,
        targetEntityId: target,
        type,
        direction,
        confidence: Number(confidence),
        investigationId: id,
      });
      setSource('');
      setTarget('');
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create relationship');
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mb-4 rounded border border-void-line bg-void-raised/60 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Selector label="SOURCE ENTITY" query={sourceQuery} setQuery={setSourceQuery} value={source} setValue={setSource} options={sourceOptions} />
        <Selector label="TARGET ENTITY" query={targetQuery} setQuery={setTargetQuery} value={target} setValue={setTarget} options={targetOptions} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mono-label block">TYPE</span>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="tech-input mt-1.5">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mono-label block">DIRECTION</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="tech-input mt-1.5">
            <option value="UNDIRECTED">UNDIRECTED</option>
            <option value="DIRECTED">DIRECTED</option>
          </select>
        </label>
        <label className="block">
          <span className="mono-label block">CONFIDENCE {confidence}%</span>
          <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(e.target.value)}
            className="mt-3 w-full accent-[#4fd8c8]" />
        </label>
      </div>
      {error && (
        <div className="mt-3 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" onClick={onDone}>CANCEL</Button>
        <Button type="submit" variant="primary" disabled={create.isPending}>
          {create.isPending ? 'LINKING…' : 'CREATE RELATIONSHIP'}
        </Button>
      </div>
    </form>
  );
}

function Selector({
  label,
  query,
  setQuery,
  value,
  setValue,
  options,
}: {
  label: string;
  query: string;
  setQuery: (v: string) => void;
  value: string;
  setValue: (v: string) => void;
  options: Array<{ id: string; name: string; type: string }>;
}) {
  const selected = options.find((o) => o.id === value);
  return (
    <div>
      <span className="mono-label block">{label}</span>
      {selected ? (
        <div className="mt-1.5 flex items-center justify-between rounded-md border border-void-line bg-void-raised px-3 py-2">
          <span className="truncate font-mono text-xs text-slate-100">{selected.name}</span>
          <button type="button" onClick={() => setValue('')} className="font-mono text-[10px] text-slate-tech hover:text-danger">
            CHANGE
          </button>
        </div>
      ) : (
        <>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entities…" className="tech-input mt-1.5 text-xs" />
          {query && (
            <ul className="mt-1 max-h-32 overflow-y-auto rounded border border-void-line bg-void-raised">
              {options.slice(0, 12).map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setValue(o.id)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-void-panel"
                  >
                    <span className={cn('truncate', value === o.id ? 'text-phosphor' : 'text-slate-200')}>{o.name}</span>
                    <span className="font-mono text-[9px] text-slate-tech/70">{o.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}