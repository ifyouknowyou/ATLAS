'use client';

import type { StreamMessage } from '@atlas/shared';
import { api } from './api-client';

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline';

interface RealtimeClientOptions {
  token: () => string | null;
  onMessage: (message: StreamMessage) => void;
  onStateChange: (state: ConnectionState) => void;
}

/**
 * SSE realtime client (Phase 5).
 *
 * Mirrors the server flow: bearer-POST to get a short-lived ticket, then an
 * EventSource to /api/realtime/stream?token=... EventSource can't send
 * Authorization headers, and it auto-replays missed events via Last-Event-ID
 * (the server sequences every message per connection). On error we back off,
 * re-mint the ticket, and reconnect. Truthful connection state only — the UI
 * never shows fake "synced" states.
 */
export class RealtimeClient {
  private source: EventSource | null = null;
  private ticket: string | null = null;
  private lastEventId = 0;
  private closed = false;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: RealtimeClientOptions) {
    this.options.onStateChange('idle');
  }

  async connect(): Promise<void> {
    if (this.closed) return;
    this.options.onStateChange(this.source ? 'reconnecting' : 'connecting');
    try {
      this.ticket = await this.mintTicket();
    } catch {
      this.scheduleReconnect();
      return;
    }
    if (this.closed) return;

    this.source?.close();
    this.source = new EventSource(
      `/api/realtime/stream?token=${encodeURIComponent(this.ticket ?? '')}`,
    );
    this.source.onopen = () => {
      this.reconnectDelay = 1000;
      this.options.onStateChange('connected');
    };
    this.source.onerror = () => {
      // EventSource auto-retries, but a persistent failure means our ticket
      // expired — drop to a reconnect loop.
      this.source?.close();
      this.source = null;
      this.options.onStateChange('reconnecting');
      this.scheduleReconnect();
    };
    this.source.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as StreamMessage;
        this.lastEventId = message.id;
        this.options.onMessage(message);
      } catch {
        // Ignore malformed frames; the heartbeat keeps the stream alive.
      }
    };
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.source?.close();
    this.source = null;
    this.options.onStateChange('offline');
  }

  private async mintTicket(): Promise<string> {
    const token = this.options.token();
    if (!token) throw new Error('No session token');
    const res = await api.post<{ ticket: string; expiresAt: string }>(
      '/realtime/ticket',
      {},
      token,
    );
    return res.ticket;
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);
      void this.connect();
    }, this.reconnectDelay);
  }
}
