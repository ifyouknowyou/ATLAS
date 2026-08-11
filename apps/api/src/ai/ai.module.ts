import { Module } from '@nestjs/common';
import { APP_CONFIG } from '../config/app-config';
import type { AppConfig } from '../config/env';
import { InvestigationsModule } from '../investigations/investigations.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RetrievalService } from './retrieval.service';
import {
  CLAUDE_PROVIDER,
  AnthropicClaudeProvider,
  DisabledClaudeProvider,
} from './claude.provider';

/**
 * AI Intelligence Engine (Phase 4).
 * The provider seam is registered by factory so configuration state lives on
 * the provider — when ANTHROPIC_API_KEY is absent a disabled provider is used
 * (endpoints report 503), and tests can override CLAUDE_PROVIDER directly.
 */
@Module({
  imports: [InvestigationsModule],
  controllers: [AiController],
  providers: [
    AiService,
    RetrievalService,
    {
      provide: CLAUDE_PROVIDER,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) =>
        config.anthropicApiKey
          ? new AnthropicClaudeProvider(config)
          : new DisabledClaudeProvider(),
    },
  ],
})
export class AiModule {}
