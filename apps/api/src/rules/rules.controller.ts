import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import { RulesService } from './rules.service';

@ApiTags('rules')
@Controller('rules')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiSecurity('bearer')
export class RulesController {
  constructor(private readonly service: RulesService) {}

  @Get()
  @RequirePermission('rule.read')
  list(@Query('organizationId') organizationId?: string) {
    return this.service.list(organizationId);
  }

  @Post()
  @RequirePermission('rule.create')
  create(@Body() dto: { name: string; description?: string; conditions: unknown; actions: unknown }) {
    return this.service.create(dto);
  }

  @Post(':id/test')
  @RequirePermission('rule.execute')
  test(@Param('id') id: string, @Body('context') context: unknown) {
    return this.service.test(id, context);
  }
}