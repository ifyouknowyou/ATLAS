import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RelationshipDirection, RelationshipType } from '@prisma/client';
import { PageQueryDto } from '../../common/pagination.dto';

export class CreateRelationshipDto {
  @IsUUID()
  sourceEntityId!: string;

  @IsUUID()
  targetEntityId!: string;

  @IsEnum(RelationshipType)
  type!: RelationshipType;

  @IsOptional()
  @IsEnum(RelationshipDirection)
  direction?: RelationshipDirection;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidence?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;
}

export class UpdateRelationshipDto {
  @IsOptional()
  @IsEnum(RelationshipType)
  type?: RelationshipType;

  @IsOptional()
  @IsEnum(RelationshipDirection)
  direction?: RelationshipDirection;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidence?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ListRelationshipsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsEnum(RelationshipType)
  type?: RelationshipType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @MaxLength(100)
  q?: string;
}