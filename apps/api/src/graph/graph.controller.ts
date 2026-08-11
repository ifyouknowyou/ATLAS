import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { GraphService } from './graph.service';
import {
  BrowseGraphQueryDto,
  NeighborhoodQueryDto,
  PathQueryDto,
} from './graph.dto';

/**
 * Graph endpoints (Phase 3). All routes require `investigation.read`;
 * tenancy + investigation membership are enforced inside GraphService.
 */
@Controller('graph')
export class GraphController {
  constructor(private readonly graph: GraphService) {}

  /** Browse an org-wide or investigation-scoped graph slice. */
  @Get()
  @RequirePermission('investigation.read')
  async browse(
    @Req() request: AuthenticatedRequest,
    @Query() query: BrowseGraphQueryDto,
  ) {
    return this.graph.browse(request.principal, query);
  }

  /** Expand a neighborhood (1 or 2 hops) around an entity. */
  @Get('neighborhood')
  @RequirePermission('investigation.read')
  async neighborhood(
    @Req() request: AuthenticatedRequest,
    @Query() query: NeighborhoodQueryDto,
  ) {
    return this.graph.neighborhood(request.principal, query);
  }

  /** Shortest path between two entities (bounded BFS). */
  @Get('path')
  @RequirePermission('investigation.read')
  async path(@Req() request: AuthenticatedRequest, @Query() query: PathQueryDto) {
    return this.graph.path(request.principal, query);
  }
}
