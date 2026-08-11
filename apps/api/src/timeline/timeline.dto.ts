import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TIMELINE_EVENT_KINDS } from '@atlas/shared';

/**
 * Timeline query contract (Phase 3).
 * `kind` is a free-string on the persistence layer; the DTO whitelists it
 * against the shared TIMELINE_EVENT_KINDS so unknown categories are rejected.
 */
export class ListTimelineQueryDto {
  @IsOptional()
  @IsUUID()
  investigationId?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsIn([...TIMELINE_EVENT_KINDS])
  kind?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}