import {
  IsBooleanString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EntityType, RelationshipType } from '@prisma/client';

/**
 * Graph query contracts (Phase 3).
 * All filters are advisory server-side scoping on top of the mandatory
 * organization + investigation membership constraints enforced by the service.
 */

export class BrowseGraphQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;

  /** Only entities that carry geographic coordinates. */
  @IsOptional()
  @IsBooleanString()
  geoOnly?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Graph limit (default 300, cap 500) — protects the renderer. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 300;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}

export class NeighborhoodQueryDto {
  @IsUUID()
  centerId!: string;

  /** Explosion guard: neighborhoods expand one or two hops at a time. */
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsIn([1, 2])
  depth: number = 1;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 300;
}

export class PathQueryDto {
  @IsUUID()
  sourceId!: string;

  @IsUUID()
  targetId!: string;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(6)
  maxHops: number = 4;
}