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
import { GeminiProvider } from './gemini.provider';
import { TavilyResearchService } from './tavily-research.service';

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
    TavilyResearchService,
    {
      provide: CLAUDE_PROVIDER,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        if (config.aiProvider === 'gemini' && config.geminiApiKey) {
          return new GeminiProvider(config);
        }
        if (config.aiProvider === 'anthropic' && config.anthropicApiKey) {
          return new AnthropicClaudeProvider(config);
        }
        return new DisabledClaudeProvider();
      },
    },
  ],
  exports: [AiService, RetrievalService, CLAUDE_PROVIDER],
})
export class AiModule {}
