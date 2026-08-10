'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useSearch } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const { data, isLoading } = useSearch(q);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-mono text-xl tracking-wide text-slate-100">SEARCH</h1>
        <p className="mt-1 text-sm text-slate-tech">
          Unified search across investigations, entities, relationships, evidence, notes and tasks.
        </p>
      </header>

      <Panel title={`RESULTS FOR "${q.toUpperCase()}"`}>
        {q.length < 2 ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            Type at least two characters
          </p>
        ) : isLoading ? (
          <Spinner label="Searching" />
        ) : !data || data.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
            No matches
          </p>
        ) : (
          <div className="space-y-1">
            {data.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={item.href}
                className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2 transition-colors hover:border-phosphor-faint/40"
              >
                <StatusBadge tone="neutral">{item.kind}</StatusBadge>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{item.label}</span>
                {item.detail && <span className="font-mono text-[10px] text-slate-tech/70">{item.detail}</span>}
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}