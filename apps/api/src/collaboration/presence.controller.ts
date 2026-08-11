import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { PresenceService, PresenceResourceType } from './presence.service';

class HeartbeatDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sessionKey?: string;
}

/**
 * Presence (§36). Heartbeats are REST POSTs (not SSE); only deltas broadcast
 * over the existing stream. Active-now lists are access-filtered.
 */
@Controller('collaboration')
@RequirePermission('collaboration.read')
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @Post(':resourceType/:resourceId/presence')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  heartbeat(
    @Req() request: AuthenticatedRequest,
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.presence.heartbeat(
      request.principal,
      resourceType as PresenceResourceType,
      resourceId,
      dto.sessionKey,
    );
  }

  @Get(':resourceType/:resourceId/presence')
  activeNow(
    @Req() request: AuthenticatedRequest,
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.presence.activeNow(request.principal, resourceType, resourceId);
  }

  @Delete(':resourceType/:resourceId/presence')
  @HttpCode(HttpStatus.NO_CONTENT)
  leave(
    @Req() request: AuthenticatedRequest,
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.presence.leave(request.principal, resourceType, resourceId, dto.sessionKey);
  }
}
