import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { AuthenticatedRequest } from '../auth/principal';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.users.me(request.principal.userId);
  }

  @Patch('me')
  updateMe(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(request.principal.userId, dto);
  }

  @Get()
  @RequirePermission('members.manage')
  list(@Req() request: AuthenticatedRequest) {
    return this.users.listByOrganization(request.principal.organizationId);
  }
}