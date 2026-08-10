'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

/**
 * Reconciles the persisted session against the API on load so the principal
 * (role/permissions/workspace) is always server-authoritative.
 */
function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrated = useAuth((s) => s.hydrated);
  const refreshSession = useAuth((s) => s.refreshSession);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void refreshSession();
  }, [refreshSession]);

  if (!hydrated) {
    return <BootScreen />;
  }
  return children;
}

function BootScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 animate-pulse-slow rounded-full bg-phosphor shadow-glow" />
          <span className="font-mono text-sm tracking-[0.35em] text-slate-tech">
            ATLAS
          </span>
        </div>
        <span className="mono-label">INITIALIZING SESSION</span>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted] = useState(() => typeof window !== 'undefined');
  if (!mounted) {
    // Match server HTML during hydration to avoid a flash paint.
    return <BootScreen />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  );
}