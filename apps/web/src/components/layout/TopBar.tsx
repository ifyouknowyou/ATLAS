'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Boxes, LogOut, Search, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { pageTitleFor } from '@/lib/navigation';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const principal = useAuth((s) => s.principal);
  const logout = useAuth((s) => s.logout);
  const [q, setQ] = useState('');

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-void-line bg-void-raised/50 px-5">
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-sm tracking-[0.18em] text-slate-200">
          {pageTitleFor(pathname)}
        </h1>
        <span className="hidden rounded border border-void-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-tech/70 sm:inline">
          FOUNDATION
        </span>
      </div>

      <div className="flex items-center gap-4">
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
        <span className="hidden items-center gap-2 font-mono text-[11px] text-slate-tech lg:flex">
          <Boxes className="h-3.5 w-3.5 text-phosphor-dim" />
          WORKSPACE · {principal?.workspaceId?.slice(0, 8) ?? 'ACTIVE'}
        </span>

        <div className="flex items-center gap-2 rounded border border-void-line px-2.5 py-1.5">
          <UserCircle2 className="h-4 w-4 text-phosphor-dim" />
          <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-200">
            {principal ? personaLabel(principal) : '—'}
          </span>
          <span className="rounded bg-void-line/60 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-phosphor">
            {principal?.role ?? 'NONE'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="tech-button px-2.5 py-1.5"
          aria-label="Log out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">EXIT</span>
        </button>
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