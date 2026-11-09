'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') ?? '';
  const { data, isLoading, isError } = useSearch(q);
  const grouped = (data ?? []).reduce<Record<string, typeof data>>((groups, item) => {
    const key = item.kind;
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-mono text-xl tracking-wide text-slate-100">SEARCH</h1>
        <p className="mt-1 text-sm text-slate-tech">
          Unified search across investigations, entities, relationships, evidence, notes and tasks.
        </p>
      </header>

      <form className="flex gap-2" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = String(form.get('q') ?? '').trim();
        router.push(next ? `/search?q=${encodeURIComponent(next)}` : '/search');
      }}>
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-tech/70" />
          <input name="q" defaultValue={q} placeholder="Search investigations, entities, evidence, notes and tasks…" className="tech-input pl-10" aria-label="Search records" />
        </label>
        <button type="submit" className="tech-button-primary tech-button">SEARCH</button>
        {q && <button type="button" className="tech-button px-3" onClick={() => router.push('/search')} aria-label="Clear search"><X className="h-4 w-4" /></button>}
      </form>

      <Panel title={`RESULTS FOR "${q.toUpperCase()}"`}>
        {q.length < 2 ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            Type at least two characters
          </p>
        ) : isLoading ? (
          <Spinner label="Searching" />
        ) : isError ? (
          <p role="alert" className="py-10 text-center font-mono text-xs uppercase tracking-widest text-amber-signal">
            Search service unavailable
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No matches
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([kind, items]) => (
              <section key={kind} aria-labelledby={`results-${kind}`}>
                <h2 id={`results-${kind}`} className="mono-label mb-2">{kind} · {items?.length ?? 0}</h2>
                <div className="space-y-1">
                  {(items ?? []).map((item) => (
                    <Link key={`${item.kind}-${item.id}`} href={item.href} className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2 transition-colors hover:border-phosphor-faint/40">
                      <StatusBadge tone="neutral">{item.kind}</StatusBadge>
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{item.label}</span>
                      {item.detail && <span className="font-mono text-[10px] text-slate-tech/70">{item.detail}</span>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}