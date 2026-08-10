'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Protected application shell. Renders the persistent chrome (sidebar + top
 * bar) and redirects unauthenticated sessions to /login. Authorization is
 * UX-level here; every API call is still protected server-side.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}