'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Archive,
  LayoutGrid,
  List,
  Plus,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useInvestigations, type InvestigationRow } from '@/lib/queries';
import { favorites, recentViewed } from '@/lib/favorites';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  classificationTone,
  formatWhen,
  priorityTone,
  statusTone,
} from '@/lib/presentation';
import { cn } from '@/lib/cn';
import { CreateInvestigationDialog } from '@/components/investigations/CreateInvestigationDialog';
import { AtlasScene } from '@/features/scenes/AtlasScene';

const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

export default function InvestigationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const has = useAuth((s) => s.has);
  const canCreate = has('investigation.create');

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [priority, setPriority] = useState(searchParams.get('priority') ?? '');
  const [classification, setClassification] = useState(searchParams.get('classification') ?? '');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [archived, setArchived] = useState(searchParams.get('archived') === 'true');
  const [view, setView] = useState<'table' | 'card'>('table');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => favorites.list());

  const PAGE_SIZE = 12;

  const query = useInvestigations({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(classification ? { classification } : {}),
    ...(archived ? { archived: true } : {}),
    sortBy,
    order,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const recent = recentViewed.list();

  // Keep critical query state shareable via the URL.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (classification) params.set('classification', classification);
    if (archived) params.set('archived', 'true');
    const next = params.toString();
    router.replace(`/investigations${next ? `?${next}` : ''}`, { scroll: false });
  }, [q, status, priority, classification, archived, router]);

  const openPage = (offset: number) => setPage(offset);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl tracking-wide text-slate-100">
            INVESTIGATIONS
          </h1>
          <p className="mt-1 text-sm text-slate-tech">
            Authorized case files, scoped to your organization and workspace.
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            NEW CASE
          </Button>
        )}
      </header>

      {/* Filters (URL-backed and shareable) */}
      <section className="panel flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-tech/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cases…"
            className="tech-input pl-9"
            aria-label="Search investigations"
          />
        </div>
        <Select value={status} onChange={setStatus} options={STATUSES} placeholder="Any status" />
        <Select value={priority} onChange={setPriority} options={PRIORITIES} placeholder="Any priority" />
        <Select value={classification} onChange={setClassification} options={CLASSIFICATIONS} placeholder="Any classification" />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="tech-input w-auto py-1.5 text-xs"
          aria-label="Sort by"
        >
          <option value="updatedAt">Last activity</option>
          <option value="createdAt">Created</option>
          <option value="title">Title</option>
        </select>
        <button type="button" className="tech-button px-2.5 py-1.5" onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}>
          {order === 'desc' ? '↓' : '↑'}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setArchived((v) => !v)}
            className={cn('tech-button px-2.5 py-1.5', archived && 'border-amber-signal/50 text-amber-signal')}
          >
            <Archive className="h-3.5 w-3.5" />
            {archived ? 'ARCHIVED' : 'ARCHIVE'}
          </button>
          <div className="flex border border-void-line rounded-md">
            <button type="button" aria-label="Table view" onClick={() => setView('table')}
              className={cn('p-2', view === 'table' ? 'text-phosphor' : 'text-slate-tech')}><List className="h-4 w-4" /></button>
            <button type="button" aria-label="Card view" onClick={() => setView('card')}
              className={cn('p-2', view === 'card' ? 'text-phosphor' : 'text-slate-tech')}><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
        <span className="w-full font-mono text-[11px] text-slate-tech/70">{total} RESULTS</span>
      </section>

      {/* Recently viewed (browser-local affordance) */}
      {recent.length > 0 && !archived && (
        <section className="flex items-center gap-2 overflow-x-auto">
          <span className="mono-label shrink-0">RECENT</span>
          {recent.map((id) => (
            <button key={id} type="button" onClick={() => router.push(`/investigations/${id}`)}
              className="shrink-0 rounded border border-void-line px-2 py-1 font-mono text-[10px] text-slate-tech hover:text-phosphor">
              {id.slice(0, 8)}
            </button>
          ))}
        </section>
      )}

      {!query.isLoading && items.length > 0 && !archived && (
        <section className="panel p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><div className="mono-label text-phosphor">INVESTIGATION TERRAIN</div><h2 className="mt-1 font-mono text-xs tracking-widest text-slate-100">CASE LANDSCAPE · AUTHORIZED RECORDS</h2></div>
            <span className="mono-label">{Math.min(items.length, 80)} VISIBLE / {total} MATCHES</span>
          </div>
          <AtlasScene
            kind="terrain"
            records={items.map((item) => ({ id: item.id, label: item.title, category: item.priority, status: item.status }))}
            className="h-[400px]"
            onSelect={(record) => openCase(record.id)}
          />
        </section>
      )}

      {query.isLoading ? (
        <Spinner label="Reading cases" />
      ) : items.length === 0 ? (
        <Panel title="CASE REGISTER">
          <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No cases match the current filters
          </p>
        </Panel>
      ) : view === 'table' ? (
        <InvestigationTable items={items} favs={favs} onToggleFav={toggleFav} onOpen={openCase} />
      ) : (
        <InvestigationCards items={items} favs={favs} onToggleFav={toggleFav} onOpen={openCase} />
      )}

      <Pagination total={total} page={page} pageSize={PAGE_SIZE} onPage={openPage} />

      {createOpen && <CreateInvestigationDialog onClose={() => setCreateOpen(false)} />}
    </div>
  );

  function toggleFav(id: string) {
    setFavs(favorites.toggle(id));
  }

  function openCase(id: string) {
    recentViewed.record(id);
    router.push(`/investigations/${id}`);
  }
}

// ---------------------------------------------------------------------------

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="tech-input w-auto py-1.5 text-xs"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Badges({ inv }: { inv: InvestigationRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone={statusTone(inv.status)}>{inv.status}</StatusBadge>
      <StatusBadge tone={priorityTone(inv.priority)}>{inv.priority}</StatusBadge>
      <StatusBadge tone={classificationTone(inv.classification)}>{inv.classification}</StatusBadge>
    </div>
  );
}

function InvestigationTable({
  items,
  favs,
  onToggleFav,
  onOpen,
}: {
  items: InvestigationRow[];
  favs: string[];
  onToggleFav: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-void-line">
            {['', 'CASE', 'STATUS', 'PRIORITY', 'CLASS', 'CASES', 'LAST ACTIVITY'].map((h) => (
              <th key={h} className="mono-label px-3 py-2 font-normal">{h || '★'}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => (
            <tr key={inv.id} className="cursor-pointer border-b border-void-line/50 transition-colors hover:bg-void-raised" onClick={() => onOpen(inv.id)}>
              <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                <button type="button" aria-label="Toggle favorite"
                  onClick={() => onToggleFav(inv.id)}
                  className={cn('text-slate-tech/50 hover:text-amber-signal', favs.includes(inv.id) && 'text-amber-signal')}>
                  <Star className="h-4 w-4" fill={favs.includes(inv.id) ? 'currentColor' : 'none'} />
                </button>
              </td>
              <td className="px-3 py-3">
                <div className="font-mono text-xs text-slate-100">{inv.title}</div>
                {inv.description && (
                  <div className="mt-0.5 max-w-md truncate text-[11px] text-slate-tech">{inv.description}</div>
                )}
              </td>
              <td className="px-3 py-3"><StatusBadge tone={statusTone(inv.status)}>{inv.status}</StatusBadge></td>
              <td className="px-3 py-3"><StatusBadge tone={priorityTone(inv.priority)}>{inv.priority}</StatusBadge></td>
              <td className="px-3 py-3"><StatusBadge tone={classificationTone(inv.classification)}>{inv.classification}</StatusBadge></td>
              <td className="px-3 py-3 font-mono text-[10px] text-slate-tech">
                E{inv._count?.entities ?? 0} · T{inv._count?.tasks ?? 0}
              </td>
              <td className="px-3 py-3 font-mono text-[10px] text-slate-tech">{formatWhen(inv.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvestigationCards({
  items,
  favs,
  onToggleFav,
  onOpen,
}: {
  items: InvestigationRow[];
  favs: string[];
  onToggleFav: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((inv) => (
        <button key={inv.id} type="button" onClick={() => onOpen(inv.id)}
          className="panel group flex flex-col gap-3 p-4 text-left transition-colors hover:border-phosphor-faint/30">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate font-mono text-xs text-slate-100">{inv.title}</span>
            <span onClick={(e) => e.stopPropagation()}>
              <StarButton id={inv.id} favs={favs} toggle={() => onToggleFav(inv.id)} />
            </span>
          </div>
          {inv.description && (
            <p className="line-clamp-2 text-[11px] text-slate-tech">{inv.description}</p>
          )}
          <Badges inv={inv} />
          <div className="mt-auto flex items-center justify-between border-t border-void-line pt-2 font-mono text-[10px] text-slate-tech/70">
            <span>E{inv._count?.entities ?? 0} · T{inv._count?.tasks ?? 0}</span>
            <span>{formatWhen(inv.updatedAt)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function StarButton({ id, favs, toggle }: { id: string; favs: string[]; toggle: () => void }) {
  const active = favs.includes(id);
  return (
    <button type="button" aria-label="Toggle favorite" onClick={toggle}
      className={cn('text-slate-tech/50 hover:text-amber-signal', active && 'text-amber-signal')}>
      <Star className="h-4 w-4" fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}

function Pagination({
  total,
  page,
  pageSize,
  onPage,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between font-mono text-[11px] text-slate-tech">
      <span>{page * pageSize + 1}–{Math.min(total, (page + 1) * pageSize)} of {total}</span>
      <div className="flex items-center gap-2">
        <Button className="px-2 py-1" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span>{page + 1}/{pages}</span>
        <Button className="px-2 py-1" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}