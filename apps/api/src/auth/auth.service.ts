import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import {
  LoginResponse,
  permissionsForRole,
} from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { SessionsService } from './sessions.service';
import { SessionPayload } from './principal';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { LoginDto } from './dto/login.dto';

/**
 * Email/password authentication. On success issues an access token bound to a
 * server-held session and returns a permission-ful principal snapshot.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly sessions: SessionsService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    const passwordOk = await compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new InvalidCredentialsException();
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) {
      throw new UnauthorizedException(
        'Account is not attached to an organization',
      );
    }

    const session = await this.sessions.create(user.id);

    const tokenPayload: SessionPayload = {
      sub: user.id,
      sid: session.sid,
      oid: membership.organizationId,
    };
    const accessToken = await this.jwt.signAsync(tokenPayload, {
      secret: this.config.authJwtSecret,
      expiresIn: this.config.authJwtExpiresIn as never,
    });

    const principal = {
      userId: user.id,
      organizationId: membership.organizationId,
      workspaceId: membership.activeWorkspaceId,
      role: membership.role,
    };

    return {
      accessToken,
      session: {
        ...principal,
        permissions: permissionsForRole(membership.role),
      },
    };
  }
}