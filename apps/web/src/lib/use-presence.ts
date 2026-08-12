'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeStore } from './realtime-store';
import { useAuth } from './auth-store';
import { api } from './api-client';

interface PresenceHeartbeatOptions {
  resourceType: 'INVESTIGATION' | 'EVIDENCE' | 'REPORT';
  resourceId: string;
  /** Pause heartbeats (e.g. when the page is hidden). */
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Presence heartbeats (§36). Sends a REST POST every 20s while a resource
 * view is mounted; the server upserts a PresenceSession and broadcasts deltas
 * over SSE, which the realtime store consumes. Returns the current active
 * users for the resource from the store.
 */
export function usePresence({
  resourceType,
  resourceId,
  enabled = true,
  intervalMs = 20_000,
}: PresenceHeartbeatOptions) {
  const token = useAuth((s) => s.token);
  const presence = useRealtimeStore((s) => s.presence);
  const apply = useRealtimeStore((s) => s.apply);

  useEffect(() => {
    if (!enabled || !token || !resourceId) return;

    const heartbeat = () => {
      void api
        .post(`/collaboration/${resourceType}/${resourceId}/presence`, {}, token)
        .then(() => {
          // The server broadcasts a presence delta; nothing more to do here.
        })
        .catch(() => {
          // Heartbeat failures are non-fatal; the stream state reflects reality.
        });
    };

    heartbeat();
    const timer = setInterval(heartbeat, intervalMs);
    return () => {
      clearInterval(timer);
      void api
        .delete(`/collaboration/${resourceType}/${resourceId}/presence`, token)
        .catch(() => {});
    };
  }, [token, enabled, resourceType, resourceId, intervalMs, apply]);

  const activeUsers = useMemo(
    () => presence[`${resourceType}:${resourceId}`] ?? [],
    [presence, resourceType, resourceId],
  );

  return { activeUsers };
}
