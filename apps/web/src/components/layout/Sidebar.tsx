'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navSections } from '@/lib/navigation';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/cn';

export function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const has = useAuth((s) => s.has);
  const [collapsed, setCollapsed] = useState(false);
  const activeHref = navSections.flatMap((section) => section.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <aside className={cn(
      'atlas-sidebar flex h-full shrink-0 flex-col border-r border-void-line bg-void-raised/85 transition-[width] duration-200',
      collapsed ? 'w-16' : 'w-56',
      mobileOpen && 'is-open',
    )}>
      <div className={cn('flex items-center px-3 py-4', collapsed ? 'flex-col gap-3' : 'justify-between gap-2 px-4')}>
        <div className="flex h-8 w-8 items-center justify-center rounded border border-phosphor-faint/50 bg-phosphor-dim/15">
          <span className="font-mono text-sm font-bold text-phosphor">A</span>
        </div>
        {!collapsed && <div className="min-w-0 flex-1 leading-tight">
          <div className="font-mono text-sm tracking-[0.3em] text-slate-100">
            ATLAS
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-tech/70">
            Intelligence Platform
          </div>
        </div>}
        <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} className="rounded p-1 text-slate-tech hover:bg-void-line/50 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn('flex-1 overflow-y-auto pb-4', collapsed ? 'px-2' : 'px-3')}>
        {navSections.map((section) => (
          <div key={section.title} className="mt-4">
            {!collapsed && <div className="mono-label px-2 pb-2">{section.title}</div>}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = activeHref === item.href;
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
                      onClick={onClose}
                      title={item.label}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex rounded-md border-l-2 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor',
                        collapsed ? 'justify-center px-1' : 'items-center gap-2.5 px-2.5',
                        active
                          ? 'border-phosphor bg-phosphor-dim/10 text-phosphor'
                          : 'border-transparent text-slate-tech hover:bg-void-raised hover:text-slate-100',
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
                      <span className={cn('font-medium tracking-wide', collapsed && 'sr-only')}>{item.label}</span>
                      {active && !collapsed && (
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

      <div className={cn('border-t border-void-line py-3', collapsed ? 'px-2' : 'px-4')}>
        {!collapsed && <WorkspaceIndicator />}
      </div>
      <span className={cn('mono-label flex items-center gap-2 pb-3', collapsed ? 'justify-center' : 'px-4')}>
        <span className="h-1.5 w-1.5 rounded-full bg-phosphor animate-pulse-slow" />
        {!collapsed && 'SECURE · LIVE'}
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