'use client';

import { useRealtimeStore } from '@/lib/realtime-store';

const LABELS: Record<string, string> = {
  idle: '● Saved',
  connected: '● Syncing',
  connecting: '● Connecting',
  reconnecting: '● Reconnecting',
  offline: '● Offline',
};

const DOTS: Record<string, string> = {
  idle: 'bg-phosphor',
  connected: 'bg-phosphor',
  connecting: 'bg-amber-signal',
  reconnecting: 'bg-amber-signal',
  offline: 'bg-danger',
};

/**
 * Truthful realtime status (§57). The color/label reflect the actual SSE
 * connection state — never a fake "synced" indicator.
 */
export function RealtimeStatusPill({ className }: { className?: string }) {
  const state = useRealtimeStore((s) => s.connectionState);
  const label = LABELS[state] ?? '● Unknown';
  const dot = DOTS[state] ?? 'bg-slate-tech';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-void-line bg-void-raised px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-tech ${className ?? ''}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
