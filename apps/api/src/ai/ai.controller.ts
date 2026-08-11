import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/principal';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { AiService } from './ai.service';
import { AiMessagesQueryDto, ChatDto, SummarizeDto } from './ai.dto';

/**
 * AI Intelligence Engine (Phase 4).
 * All routes require `investigation.read`; investigation membership is
 * enforced server-side inside AiService. The provider credential never
 * leaves the API server.
 */
@Controller('ai')
@RequirePermission('investigation.read')
export class AiController {
  constructor(private readonly ai: AiService) {}

  /** Ask the assistant — retrieval grounded, tenant-isolated. */
  @Post('chat')
  chat(@Req() request: AuthenticatedRequest, @Body() dto: ChatDto) {
    return this.ai.chat(request.principal, dto);
  }

  /** Structured investigation summary from records in scope. */
  @Post('summarize')
  summarize(@Req() request: AuthenticatedRequest, @Body() dto: SummarizeDto) {
    return this.ai.summarize(request.principal, dto);
  }

  /** Conversation history, tenant + investigation scoped. */
  @Get('messages')
  messages(@Req() request: AuthenticatedRequest, @Query() query: AiMessagesQueryDto) {
    return this.ai.listMessages(request.principal, query.investigationId, query.limit);
  }
}