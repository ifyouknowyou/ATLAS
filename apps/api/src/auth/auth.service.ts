import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import {
  LoginResponse,
  permissionsForRole,
  type Role,
} from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { SessionsService } from './sessions.service';
import { SessionPayload } from './principal';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { LoginDto } from './dto/login.dto';

/** Issues revocable API sessions for password and anonymous demo access. */
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

    return this.issueSession(membership);
  }

  async demoSession(): Promise<LoginResponse> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        role: 'OWNER',
        user: { isActive: true },
        organization: { slug: 'atlas-demo', isDemo: true },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        userId: true,
        organizationId: true,
        activeWorkspaceId: true,
        role: true,
      },
    });
    if (!membership) {
      throw new ServiceUnavailableException(
        'The demo workspace is not initialized. Run the API database seed command.',
      );
    }

    return this.issueSession(membership);
  }

  private async issueSession(membership: {
    userId: string;
    organizationId: string;
    activeWorkspaceId: string | null;
    role: Role;
  }): Promise<LoginResponse> {
    const session = await this.sessions.create(membership.userId);

    const tokenPayload: SessionPayload = {
      sub: membership.userId,
      sid: session.sid,
      oid: membership.organizationId,
    };
    const accessToken = await this.jwt.signAsync(tokenPayload, {
      secret: this.config.authJwtSecret,
      expiresIn: this.config.authJwtExpiresIn as never,
    });

    const principal = {
      userId: membership.userId,
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