'use client';

import { create } from 'zustand';
import type {
  NotificationRow,
  PresencePayload,
  StreamMessage,
} from '@atlas/shared';
import type { ConnectionState } from './realtime';

/**
 * Client-side realtime state (Phase 5). This is UI state only — every message
 * that reaches here has already passed the server's org/investigation scoping.
 * React-query remains the REST source of truth; the SSE stream drives cache
 * invalidation and lightweight presence/notification badges.
 */
interface RealtimeState {
  connectionState: ConnectionState;
  lastEventId: number;
  /** Presence snapshots keyed by `${resourceType}:${resourceId}`. */
  presence: Record<string, PresencePayload[]>;
  /** Unread notifications (from stream + initial fetch). */
  notifications: NotificationRow[];
  unreadCount: number;
  /** Live activity messages, newest last. */
  activity: StreamMessage[];
  /** Recently delivered report deltas (per reportId). */
  reportDeltas: Record<string, StreamMessage>;

  apply: (message: StreamMessage) => void;
  setConnectionState: (state: ConnectionState) => void;
  setUnreadCount: (count: number) => void;
  setNotifications: (items: NotificationRow[]) => void;
}

const ACTIVITY_LIMIT = 100;

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  connectionState: 'idle',
  lastEventId: 0,
  presence: {},
  notifications: [],
  unreadCount: 0,
  activity: [],
  reportDeltas: {},

  apply: (message) => {
    const next = { ...get() };
    next.lastEventId = message.id;

    if (message.type === 'presence' && message.presence && message.resourceId) {
      const key = `${message.resourceType ?? 'INVESTIGATION'}:${message.resourceId}`;
      const list = next.presence[key] ?? [];
      const existing = list.filter((p) => p.userId !== message.presence!.userId);
      if (message.presence.status !== 'OFFLINE') {
        existing.push(message.presence);
      }
      next.presence[key] = existing;
    }

    if (message.type === 'notification') {
      // The server broadcasts user-scoped notification events; the unread
      // badge is refreshed by polling the endpoint.
      next.unreadCount = next.unreadCount + 1;
    }

    if (message.type === 'activity') {
      next.activity = [...next.activity, message].slice(-ACTIVITY_LIMIT);
    }

    if (message.type === 'report' && message.report?.reportId) {
      next.reportDeltas[message.report.reportId] = message;
    }

    if (
      message.type === 'evidence' ||
      message.type === 'comment' ||
      message.type === 'graph' ||
      message.type === 'timeline'
    ) {
      // These drive react-query invalidation (handled by the hook consumer).
      next.lastEventId = message.id;
    }

    set(next);
  },

  setConnectionState: (connectionState) => set({ connectionState }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.readAt).length,
    }),
}));
