import { IsEnum, IsUUID } from 'class-validator';
import { InvestigationMemberRole } from '@prisma/client';

export class AddMemberDto {
  @IsUUID()
  userId!: string;

  @IsEnum(InvestigationMemberRole)
  role!: InvestigationMemberRole;
}

export class UpdateMemberRoleDto {
  @IsEnum(InvestigationMemberRole)
  role!: InvestigationMemberRole;
}