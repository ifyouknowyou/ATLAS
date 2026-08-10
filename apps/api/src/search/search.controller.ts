import { Controller, Get, Query, Req } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { SearchService } from './search.service';

class SearchQueryDto {
  @IsString()
  @MaxLength(100)
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;
}

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @RequirePermission('investigation.read')
  search(@Req() request: AuthenticatedRequest, @Query() query: SearchQueryDto) {
    return this.service.search(request.principal, query.q, query.limit);
  }
}