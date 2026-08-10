import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

/** Shared query shape for paginated list endpoints. */
export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export function toPage<T>(
  items: T[],
  total: number,
  page: PageQueryDto,
): Page<T> {
  return { items, total, limit: page.limit, offset: page.offset };
}