import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { StreamMessage } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

const HEARTBEAT_MS = 15_000;

interface Connection {
  principal: AuthenticatedPrincipal;
  /** Investigation ids the connection may receive (empty set + admin = all). */
  investigations: Set<string>;
  admin: boolean;
  seq: number;
  subject: Subject<StreamMessage>;
}

/**
 * Realtime graph/timeline broadcast (Phase 3).
 *
 * SSE transport with per-connection authorization. Each connection is bound to
 * a live principal; deliveries are filtered so a client only ever receives
 * events for investigations it is actually a member of (or all, for org
 * admins). Sequence numbers enable `Last-Event-ID` replay.
 */
@Injectable()
export class RealtimeService {
  private readonly connections = new Map<string, Connection>();

  constructor(private readonly prisma: PrismaService) {}

  /** Prepare a connection with its authz scope. */
  async subscribe(connectionId: string, principal: AuthenticatedPrincipal): Promise<void> {
    const admin = principal.role === 'OWNER' || principal.role === 'ADMIN';
    const investigations = new Set<string>();
    if (!admin) {
      const memberships = await this.prisma.investigationMember.findMany({
        where: { userId: principal.userId, investigation: { organizationId: principal.organizationId } },
        select: { investigationId: true },
      });
      for (const m of memberships) investigations.add(m.investigationId);
    }
    this.connections.set(connectionId, {
      principal,
      investigations,
      admin,
      seq: 0,
      subject: new Subject<StreamMessage>(),
    });
  }

  /** Open an SSE stream for an established connection. */
  open(connectionId: string): Observable<MessageEvent> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      // Return a completed observable — nothing to stream for a missing conn.
      return new Observable<MessageEvent>((subscriber) => subscriber.complete());
    }
    const heartbeat = setInterval(() => {
      if (!connection.subject.closed) {
        connection.subject.next(this.message(connection, 'heartbeat'));
      }
    }, HEARTBEAT_MS);

    return new Observable<MessageEvent>((subscriber) => {
      const sub = connection.subject.subscribe({
        next: (msg) =>
          subscriber.next({
            id: String(msg.id),
            data: JSON.stringify(msg),
            type: msg.type,
          } as MessageEvent),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => {
        sub.unsubscribe();
        clearInterval(heartbeat);
        this.connections.delete(connectionId);
      };
    });
  }

  /** Broadcast to every connection allowed to see the org' investigation. */
  publish(
    organizationId: string,
    message: Omit<StreamMessage, 'id' | 'createdAt'>,
  ): void {
    const createdAt = new Date().toISOString();
    for (const connection of this.connections.values()) {
      if (connection.principal.organizationId !== organizationId) continue;
      const scoped = message.investigationId
        ? connection.admin || connection.investigations.has(message.investigationId)
        : connection.admin || connection.investigations.size > 0;
      if (!scoped) continue;
      this.deliver(connection, { ...message, createdAt });
    }
  }

  /** Emit a graph/timeline delta to authorized connections (§41). */
  emitDelta(
    principal: AuthenticatedPrincipal,
    message: Omit<StreamMessage, 'id' | 'createdAt'>,
  ): void {
    this.publish(principal.organizationId, message);
  }

  private deliver(connection: Connection, msg: Omit<StreamMessage, 'id'>): void {
    if (connection.subject.closed) return;
    connection.seq += 1;
    connection.subject.next({ ...msg, id: connection.seq } as StreamMessage);
  }

  private message(
    connection: Connection,
    type: StreamMessage['type'],
    extra: Partial<Omit<StreamMessage, 'id' | 'type' | 'createdAt'>> = {},
  ): StreamMessage {
    connection.seq += 1;
    return {
      id: connection.seq,
      type,
      createdAt: new Date().toISOString(),
      ...extra,
    };
  }
}