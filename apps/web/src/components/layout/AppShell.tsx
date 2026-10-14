'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SystemStatusBar } from './SystemStatusBar';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Protected application shell. Renders the persistent chrome (sidebar + top
 * bar) and redirects unauthenticated sessions to /login. Authorization is
 * UX-level here; every API call is still protected server-side.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login');
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Authenticating" />
      </div>
    );
  }

  if (!token) {
    return null; // redirect effect is in flight
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