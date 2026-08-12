'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './auth-store';
import { useRealtimeStore } from './realtime-store';
import { RealtimeClient } from './realtime';

/**
 * Mounts the SSE realtime client for the lifetime of an authenticated session.
 * It drives the zustand store (presence, notifications, activity, report
 * deltas) and invalidates react-query caches for evidence/report/comment keys
 * when the server broadcasts a matching delta.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const clientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    if (!token) {
      clientRef.current?.close();
      clientRef.current = null;
      return;
    }

    const store = useRealtimeStore;
    const client = new RealtimeClient({
      token: () => useAuth.getState().token,
      onMessage: (message) => {
        store.getState().apply(message);
        // The REST caches for scoped resources are invalidated by consumers
        // via window events keyed on the resource id. This keeps react-query
        // consistent without polling.
        const key =
          message.resourceId
            ? `${message.type}:${message.resourceId}`
            : message.type;
        window.dispatchEvent(new CustomEvent('atlas:realtime', { detail: { key, message } }));
      },
      onStateChange: (state) => store.getState().setConnectionState(state),
    });
    clientRef.current = client;
    void client.connect();

    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [token]);

  return <>{children}</>;
}
