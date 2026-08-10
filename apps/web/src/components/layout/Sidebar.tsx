'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navSections } from '@/lib/navigation';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const pathname = usePathname();
  const has = useAuth((s) => s.has);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-void-line bg-void-raised/60">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded border border-phosphor-faint/50 bg-phosphor-dim/15">
          <span className="font-mono text-sm font-bold text-phosphor">A</span>
        </div>
        <div className="leading-tight">
          <div className="font-mono text-sm tracking-[0.3em] text-slate-100">
            ATLAS
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-tech/70">
            Intelligence Platform
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.title} className="mt-4">
            <div className="mono-label px-2 pb-2">{section.title}</div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/overview' && pathname.startsWith(item.href));
                const hidden = item.permission && !has(item.permission);

                // Permission-aware UI: hide entries the user cannot act on.
                if (hidden) {
                  // Overview & operations entries are always visible when authed.
                  return null;
                }
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-phosphor-dim/15 text-phosphor'
                          : 'text-slate-tech hover:bg-void-raised hover:text-slate-100',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          active
                            ? 'text-phosphor'
                            : 'text-slate-tech/70 group-hover:text-slate-200',
                        )}
                      />
                      <span className="font-medium tracking-wide">{item.label}</span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-phosphor shadow-glow" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-void-line px-4 py-3">
        <WorkspaceIndicator />
      </div>
      <span className="mono-label px-4 pb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-phosphor animate-pulse-slow" />
        PHASE 1 · FOUNDATION
      </span>
    </aside>
  );
}

function WorkspaceIndicator() {
  const principal = useAuth((s) => s.principal);
  return (
    <div className="truncate font-mono text-[11px] text-slate-tech">
      <span className="text-slate-tech/60">ORG </span>
      <span className="text-slate-200">
        {principal?.organizationId
          ? principal.organizationId.slice(0, 8)
          : '—'}
      </span>
      {principal?.workspaceId && (
        <>
          <span className="mx-1 text-slate-tech/40">·</span>
          <span className="text-phosphor-dim">WS {principal.workspaceId.slice(0, 8)}</span>
        </>
      )}
    </div>
  );
}

export { pageTitleFor } from '@/lib/navigation';