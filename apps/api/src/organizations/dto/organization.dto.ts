import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role, ROLES } from '@atlas/shared';

export class UpdateMemberRoleDto {
  @IsEnum(ROLES, { message: `role must be one of: ${ROLES.join(', ')}` })
  role!: Role;
}

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}