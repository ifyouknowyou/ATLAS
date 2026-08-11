import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { TimelineService } from './timeline.service';
import { ListTimelineQueryDto } from './timeline.dto';

/**
 * Timeline endpoints (Phase 3).
 */
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timeline: TimelineService) {}

  @Get()
  @RequirePermission('investigation.read')
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListTimelineQueryDto,
  ) {
    return this.timeline.list(request.principal, query);
  }
}