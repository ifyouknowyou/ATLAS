'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useGraphStore } from '../store';

interface GraphSearchProps {
  onFocusNode?: (id: string) => void;
}

/** Local graph search: filter over loaded nodes + focus action. */
export function GraphSearch({ onFocusNode }: GraphSearchProps) {
  const [query, setQuery] = useState('');
  const data = useGraphStore((s) => s.data);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return data.nodes
      .filter((n) => n.name.toLowerCase().includes(q) || n.type.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, data.nodes]);

  const noResults = query.trim() !== '' && results.length === 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded border border-void-line bg-void-raised px-2 py-1">
        <Search className="h-3.5 w-3.5 text-slate-tech" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entities..."
          className="tech-input h-7 w-full bg-transparent text-[12px] text-void placeholder:text-slate-tech focus:outline-none"
          aria-label="Search entities in graph"
        />
      </div>
      {results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded border border-void-line bg-void-raised shadow-panel">
          {results.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => {
                  onFocusNode?.(n.id);
                  setQuery('');
                }}
                className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left font-mono text-[11px] text-void hover:text-phosphor"
              >
                <span>{n.name}</span>
                <span className="text-slate-tech">{n.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {noResults && (
        <div className="absolute z-20 mt-1 w-full rounded border border-void-line bg-void-raised px-2 py-1.5 font-mono text-[11px] text-slate-tech">
          NO MATCHES
        </div>
      )}
    </div>
  );
}