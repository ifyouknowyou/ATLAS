import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { CommentTargetType } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { CommentsService } from './comments.service';

class CreateCommentDto {
  @IsEnum(CommentTargetType)
  targetType!: CommentTargetType;

  @IsString()
  targetId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

class ResolveCommentDto {
  resolved?: boolean;
}

/**
 * Contextual comments (§39, §40). Readable by anyone with target read access;
 * create requires `comment.create`; resolve/delete are author-or-privileged.
 */
@Controller('comments')
@RequirePermission('collaboration.read')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.comments.list(request.principal, targetType, targetId);
  }

  @Post()
  @RequirePermission('comment.create')
  @RateLimit({ limit: 30, windowMs: 60_000 })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateCommentDto) {
    return this.comments.create(request.principal, {
      targetType: dto.targetType,
      targetId: dto.targetId,
      body: dto.body,
    });
  }

  @Post(':id/replies')
  @RequirePermission('comment.create')
  @RateLimit({ limit: 30, windowMs: 60_000 })
  reply(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.comments.reply(request.principal, id, dto.body);
  }

  @Patch(':id')
  @RequirePermission('comment.create')
  edit(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.comments.edit(request.principal, id, dto.body);
  }

  @Post(':id/resolve')
  @RequirePermission('comment.resolve')
  resolve(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ResolveCommentDto,
  ) {
    return this.comments.resolve(request.principal, id, dto.resolved ?? true);
  }

  @Delete(':id')
  @RequirePermission('comment.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.comments.remove(request.principal, id);
  }
}
