'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SystemStatusBar } from './SystemStatusBar';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Renders the persistent application chrome after the demo session is ready.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useAuth((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Initializing ATLAS" />
      </div>
    );
  }

  return (
    <div className="atlas-shell flex h-screen overflow-hidden">
      <div className={sidebarOpen ? 'atlas-sidebar-backdrop is-open' : 'atlas-sidebar-backdrop'} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setSidebarOpen(true)} />
        <main className="atlas-main min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        <SystemStatusBar />
      </div>
    </div>
  );
}