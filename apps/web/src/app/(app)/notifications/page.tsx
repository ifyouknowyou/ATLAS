'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
}

/** Notification center (§41). */
export default function NotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = (notifications.data ?? []) as NotificationItem[];
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4">
      <Panel
        title="NOTIFICATION CENTER"
        actions={
          <div className="flex items-center gap-3">
            {unread > 0 && <StatusBadge tone="signal">{unread} UNREAD</StatusBadge>}
            {unread > 0 && (
              <Button onClick={() => markAllRead.mutate()}>
                <CheckCheck className="h-3.5 w-3.5" /> MARK ALL READ
              </Button>
            )}
          </div>
        }
      >
        {notifications.isLoading ? (
          <Spinner label="Loading notifications" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Bell className="h-6 w-6 text-slate-tech" />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.readAt) markRead.mutate(n.id);
                }}
                className={`flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition-colors ${
                  n.readAt
                    ? 'border-void-line/40 bg-void-raised/30'
                    : 'border-phosphor-faint/40 bg-phosphor-dim/5'
                }`}
              >
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${n.readAt ? 'bg-slate-tech/40' : 'bg-phosphor'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-100">{n.title}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-tech/60">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {n.body && <p className="mt-0.5 text-xs text-slate-tech">{n.body}</p>}
                  <span className="mono-label mt-1 inline-block">{n.kind}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
