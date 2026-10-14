'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, Radar, Target } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';

type WatchlistRecord = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
};

type WatchlistItem = {
  id: string;
  entityId?: string | null;
  value?: string | null;
  createdAt: string;
  entity?: { id: string; name: string; type: string } | null;
};

export default function WatchlistsPage() {
  const token = useAuth((state) => state.token);
  const canCreate = useAuth((state) => state.has('watchlist.create'));
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const lists = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => api.get<WatchlistRecord[]>('/watchlists', token),
    enabled: Boolean(token),
  });
  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get('id');
    if (requestedId) setSelectedId(requestedId);
  }, []);
  const selected = lists.data?.find((item) => item.id === selectedId) ?? lists.data?.[0];
  const items = useQuery({
    queryKey: ['watchlist-items', selected?.id],
    queryFn: () => api.get<WatchlistItem[]>(`/watchlists/${selected?.id}/items`, token),
    enabled: Boolean(token && selected?.id),
  });
  const create = useMutation({
    mutationFn: () => api.post<WatchlistRecord>('/watchlists', { name: name.trim(), description: description.trim() || undefined }, token),
    onSuccess: (created) => {
      setName('');
      setDescription('');
      setSelectedId(created.id);
      void client.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
      <div><div className="mono-label flex items-center gap-2 text-phosphor"><Radar className="h-3.5 w-3.5" /> COLLECTION / MONITORING</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">WATCHLISTS</h1></div>
    </header>

    <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Panel title="WATCHLIST INDEX">
        {lists.isLoading ? <Spinner label="Loading watchlists" /> : lists.isError ? <EmptyState title="WATCHLISTS UNAVAILABLE" detail="The watchlist service could not be reached." /> : !lists.data?.length ? <EmptyState title="NO WATCHLISTS" detail="Create a watchlist to organize monitored entities and indicators." /> : <div className="space-y-1">
          {lists.data.map((list) => <button type="button" key={list.id} onClick={() => setSelectedId(list.id)} className={`w-full rounded border-l-2 px-3 py-2 text-left ${selected?.id === list.id ? 'border-phosphor bg-phosphor-dim/10' : 'border-transparent hover:bg-void-raised'}`}><span className="block truncate font-mono text-xs text-slate-100">{list.name}</span><span className="mt-1 block font-mono text-[9px] text-slate-tech">{formatWhen(list.createdAt)}</span></button>)}
        </div>}
        {canCreate && <form className="mt-4 space-y-2 border-t border-void-line pt-3" onSubmit={(event) => { event.preventDefault(); if (name.trim()) create.mutate(); }}>
          <label className="mono-label block" htmlFor="watchlist-name">NEW WATCHLIST</label>
          <input id="watchlist-name" value={name} onChange={(event) => setName(event.target.value)} className="tech-input" placeholder="Watchlist name" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="tech-input min-h-16 resize-y" placeholder="Description (optional)" aria-label="Watchlist description" />
          <button type="submit" disabled={!name.trim() || create.isPending} className="tech-button-primary w-full py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> CREATE</button>
          {create.isError && <p role="alert" className="text-xs text-danger">{create.error instanceof Error ? create.error.message : 'Could not create watchlist'}</p>}
        </form>}
      </Panel>

      <Panel title={selected?.name ?? 'WATCHLIST DETAIL'} actions={selected ? <StatusBadge tone="signal">ACTIVE</StatusBadge> : undefined}>
        {!selected ? <EmptyState title="SELECT A WATCHLIST" detail="Choose a watchlist to inspect its tracked items." /> : items.isLoading ? <Spinner label="Loading tracked items" /> : items.isError ? <EmptyState title="ITEMS UNAVAILABLE" detail="Tracked items could not be loaded." /> : !items.data?.length ? <EmptyState title="NO TRACKED ITEMS" detail={selected.description || 'This watchlist does not contain any items yet.'} /> : <div className="grid gap-2 sm:grid-cols-2">
          {items.data.map((item) => <article key={item.id} className="flex items-center gap-3 rounded border border-void-line/60 bg-void-raised/30 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-phosphor-faint/25 text-phosphor"><Target className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1"><h2 className="truncate font-mono text-xs text-slate-100">{item.entity?.name ?? item.value ?? item.entityId ?? 'Unlabeled item'}</h2><p className="mt-1 font-mono text-[9px] text-slate-tech">{item.entity?.type ?? 'INDICATOR'} · {formatWhen(item.createdAt)}</p></div>
            {item.entity?.id && <a href={`/entities/${item.entity.id}`} className="rounded border border-void-line p-1.5 text-slate-tech hover:text-phosphor" aria-label={`Open ${item.entity.name}`}><Eye className="h-3.5 w-3.5" /></a>}
          </article>)}
        </div>}
      </Panel>
    </section>
  </div>;
}
