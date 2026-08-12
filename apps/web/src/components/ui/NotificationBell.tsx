'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useRealtimeStore } from '@/lib/realtime-store';
import { useUnreadCount } from '@/lib/queries';

/** Unread badge in the top bar (§41). Combines SSE increments + polling. */
export function NotificationBell() {
  const streamUnread = useRealtimeStore((s) => s.unreadCount);
  const poll = useUnreadCount();
  const pollUnread = poll.data ?? 0;
  const total = Math.max(streamUnread, pollUnread);

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${total ? ` (${total} unread)` : ''}`}
      className="relative rounded border border-void-line p-2 text-slate-tech transition-colors hover:border-phosphor-faint hover:text-phosphor"
    >
      <Bell className="h-4 w-4" />
      {total > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-phosphor px-1 font-mono text-[9px] font-bold text-void">
          {total > 99 ? '99+' : total}
        </span>
      )}
    </Link>
  );
}
