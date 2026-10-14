import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { WatchlistsService } from './watchlists.service';

@ApiTags('watchlists')
@Controller('watchlists')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class WatchlistsController {
  constructor(private readonly service: WatchlistsService) {}

  @Get()
  @RequirePermission('watchlist.read')
  list() {
    return this.service.list();
  }

  @Post()
  @RequirePermission('watchlist.create')
  create(@Body() dto: { name: string; description?: string; sources?: unknown }) {
    return this.service.create(dto);
  }

  @Get(':id/items')
  @RequirePermission('watchlist.read')
  items(@Param('id') id: string) {
    return this.service.items(id);
  }
}