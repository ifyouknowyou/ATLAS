import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { EntityType } from '@prisma/client';

/**
 * Geospatial query contracts (Phase 3).
 * Bounding-box and radius queries are server-side filtered — the client never
 * receives a list it is not authorized to see and cannot widen the box.
 */

export class BoundingBoxQueryDto {
  @Type(() => Number)
  @IsLatitude()
  minLat!: number;

  @Type(() => Number)
  @IsLatitude()
  maxLat!: number;

  @Type(() => Number)
  @IsLongitude()
  minLng!: number;

  @Type(() => Number)
  @IsLongitude()
  maxLng!: number;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 500;
}

export class RadiusQueryDto {
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20000)
  radiusKm!: number;

  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 500;
}

export class LocationsQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 500;
}

export class ArcsQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 500;
}
