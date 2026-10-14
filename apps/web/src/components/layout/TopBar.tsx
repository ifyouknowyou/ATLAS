'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Command, Menu, Search, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { pageTitleFor } from '@/lib/navigation';
import { NotificationBell } from '@/components/ui/NotificationBell';

export function TopBar({ onMenu }: { onMenu?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const principal = useAuth((s) => s.principal);
  const [q, setQ] = useState('');

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-void-line bg-void-raised/50 px-5">
      <div className="flex items-center gap-3">
        <button type="button" className="atlas-menu-button tech-button p-2 lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="font-mono text-sm tracking-[0.18em] text-slate-200">
          {pageTitleFor(pathname)}
        </h1>
        <span className="hidden rounded border border-phosphor-faint/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-phosphor-dim sm:inline">
          INTELLIGENCE OPERATIONS
        </span>
      </div>

      <div className="min-w-0 flex items-center gap-2 sm:gap-4">
        <form onSubmit={runSearch} className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-tech/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Unified search…"
            className="tech-input w-52 pl-9 py-1.5 text-xs"
            aria-label="Search ATLAS"
          />
        </form>
        <button type="button" onClick={() => router.push('/search')} className="tech-button p-2 md:hidden" aria-label="Open search">
          <Search className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => router.push('/search')} className="hidden items-center gap-2 rounded border border-void-line px-2 py-1.5 font-mono text-[10px] text-slate-tech transition-colors hover:border-phosphor-faint/40 hover:text-slate-100 lg:flex" title="Open global search">
          <Command className="h-3 w-3" /> SEARCH <kbd className="rounded border border-void-line px-1">/</kbd>
        </button>

        <NotificationBell />

        <div className="flex items-center gap-2 rounded border border-void-line px-2.5 py-1.5">
          <UserCircle2 className="h-4 w-4 text-phosphor-dim" />
          <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-200">
            {principal ? personaLabel(principal) : '—'}
          </span>
          <span className="rounded bg-void-line/60 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-phosphor">
            {principal?.role ?? 'NONE'}
          </span>
        </div>
      </div>
    </header>
  );
}

function personaLabel(principal: {
  workspaceId: string | null;
  role: string;
}): string {
  return principal.workspaceId
    ? `WS ${principal.workspaceId.slice(0, 8)}`
    : 'No active workspace';
}