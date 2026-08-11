import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { GeoService } from './geo.service';
import {
  ArcsQueryDto,
  BoundingBoxQueryDto,
  LocationsQueryDto,
  RadiusQueryDto,
} from './geo.dto';

/**
 * Geospatial endpoints (Phase 3).
 * All queries are server-side scoped (organization + membership).
 */
@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('bounding-box')
  @RequirePermission('entity.read')
  async boundingBox(
    @Req() request: AuthenticatedRequest,
    @Query() query: BoundingBoxQueryDto,
  ) {
    return this.geo.inBoundingBox(request.principal, query);
  }

  @Get('radius')
  @RequirePermission('entity.read')
  async radius(
    @Req() request: AuthenticatedRequest,
    @Query() query: RadiusQueryDto,
  ) {
    return this.geo.inRadius(request.principal, query);
  }

  @Get('locations')
  @RequirePermission('entity.read')
  async locations(
    @Req() request: AuthenticatedRequest,
    @Query() query: LocationsQueryDto,
  ) {
    return this.geo.locations(request.principal, query);
  }

  @Get('arcs')
  @RequirePermission('entity.read')
  async arcs(@Req() request: AuthenticatedRequest, @Query() query: ArcsQueryDto) {
    return this.geo.arcs(request.principal, query);
  }
}