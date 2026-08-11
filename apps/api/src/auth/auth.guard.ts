import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { isPublicTarget } from './public.decorator';
import { AuthenticatedRequest, SessionPayload } from './principal';
import { buildPrincipal } from './principal.builder';

const BEARER_PREFIX = 'Bearer ';

/**
 * Global authentication guard.
 *
 * Validates the bearer JWT, confirms the server-held session is still active,
 * and re-reads the membership from the database on every request so role and
 * permission changes apply immediately. The principal's permissions are always
 * recomputed server-side (never trusted from the token or the client).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const handler = context.getHandler();
    const controller = context.getClass();

    if (isPublicTarget(handler, controller)) {
      return true;
    }

    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: SessionPayload;
    try {
      payload = await this.jwt.verifyAsync<SessionPayload>(token, {
        secret: this.config.authJwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    const session = await this.prisma.activeSession.findUnique({
      where: { sid: payload.sid },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session is no longer active');
    }

    request.principal = await buildPrincipal(
      this.prisma,
      payload.sub,
      payload.oid,
    );
    // Surface the decoded session so handlers (e.g. logout) can revoke it.
    request.sessionPayload = payload;
    return true;
  }
}

function extractBearerToken(request: AuthenticatedRequest): string | null {
  const header = request.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}