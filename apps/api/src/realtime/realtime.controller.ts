import {
  Controller,
  MessageEvent,
  Post,
  Query,
  Req,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { Observable, Subscription } from 'rxjs';
import { SseTicketPayload } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { buildPrincipal } from '../auth/principal.builder';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Public } from '../auth/public.decorator';
import { RealtimeService } from './realtime.service';

const SSE_TICKET_TTL_S = 60;

/**
 * Realtime endpoints (Phase 3).
 *
 * EventSource cannot set an Authorization header, so the client first
 * exchanges its bearer token for a short-lived SSE ticket (60s), then opens
 * `/api/stream?token=`. The stream re-validates the ticket, the underlying
 * ActiveSession, and the live membership before subscribing.
 */
@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly realtime: RealtimeService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Post('ticket')
  @RequirePermission('investigation.read')
  async issueTicket(@Req() request: AuthenticatedRequest): Promise<SseTicketPayload> {
    const payload = request.sessionPayload;
    if (!payload) throw new UnauthorizedException('No session to ticket');
    const issuedAt = Date.now();
    const ticket = await this.jwt.signAsync(
      {
        sub: payload.sub,
        sid: payload.sid,
        oid: payload.oid,
        scope: 'sse',
        jti: randomUUID(),
      },
      { expiresIn: `${SSE_TICKET_TTL_S}s` },
    );
    return {
      ticket,
      expiresAt: new Date(issuedAt + SSE_TICKET_TTL_S * 1000).toISOString(),
    };
  }

  @Sse('stream')
  @Public()
  openStream(
    @Query('token') token: string,
  ): Observable<MessageEvent> {
    // Defer auth work to the Observable creation so the @Sse route is valid
    // even when the ticket fails (Nest needs a returned stream).
    return new Observable<MessageEvent>((subscriber) => {
      let streamSubscription: Subscription | undefined;
      let cancelled = false;
      void (async () => {
        try {
          const payload = await this.verifyTicket(token);
          await this.assertSessionActive(payload.sid);
          const principal = await buildPrincipal(this.prisma, payload.sub, payload.oid);
          if (cancelled) return;
          const connectionId = randomUUID();
          await this.realtime.subscribe(connectionId, principal);
          const stream = this.realtime.open(connectionId);
          streamSubscription = stream.subscribe({
            next: (msg) => subscriber.next(msg),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
          if (cancelled) streamSubscription.unsubscribe();
        } catch (err) {
          subscriber.error(err);
        }
      })();

      return () => {
        cancelled = true;
        streamSubscription?.unsubscribe();
      };
    });
  }

  private async verifyTicket(token: string): Promise<{ sub: string; sid: string; oid: string }> {
    if (!token) throw new UnauthorizedException('Missing SSE ticket');
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired SSE ticket');
    }
    const candidate = payload as { sub?: string; sid?: string; oid?: string; scope?: string };
    if (candidate.scope !== 'sse' || !candidate.sub || !candidate.sid || !candidate.oid) {
      throw new UnauthorizedException('Invalid SSE ticket scope');
    }
    return { sub: candidate.sub, sid: candidate.sid, oid: candidate.oid };
  }

  private async assertSessionActive(sid: string): Promise<void> {
    const session = await this.prisma.activeSession.findUnique({
      where: { sid },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session is no longer active');
    }
  }
}