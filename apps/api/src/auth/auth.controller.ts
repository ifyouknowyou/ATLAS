import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginResponse } from '@atlas/shared';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { LoginThrottleGuard } from './login-throttle.guard';
import { Public } from './public.decorator';
import { AuthenticatedRequest } from './principal';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottleGuard)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.auth.login(dto);
  }

  /** Fresh principal for the current session (role/permissions re-resolved). */
  @Get('session')
  session(@Req() request: AuthenticatedRequest) {
    return { session: request.principal };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    const sid = request.sessionPayload?.sid;
    if (sid) {
      await this.sessions.revoke(sid);
    }
  }
}