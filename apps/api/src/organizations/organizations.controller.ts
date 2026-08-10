import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { AuthenticatedRequest } from '../auth/principal';
import {
  UpdateMemberRoleDto,
  UpdateOrganizationSettingsDto,
} from './dto/organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get('me')
  myOrganization(@Req() request: AuthenticatedRequest) {
    return this.organizations.myOrganization(request.principal.organizationId);
  }

  @Patch('me/settings')
  @RequirePermission('settings.manage')
  updateSettings(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateOrganizationSettingsDto,
  ) {
    return this.organizations.updateSettings(
      request.principal.organizationId,
      dto,
    );
  }

  @Get('me/members')
  @RequirePermission('members.manage')
  listMembers(@Req() request: AuthenticatedRequest) {
    return this.organizations.listMembers(request.principal.organizationId);
  }

  @Patch('me/members/:userId/role')
  @RequirePermission('members.manage')
  updateMemberRole(
    @Req() request: AuthenticatedRequest,
    @Param('userId', new ParseUUIDPipe()) memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.organizations.updateMemberRole(
      request.principal.organizationId,
      memberUserId,
      dto.role,
      request.principal.userId,
    );
  }
}