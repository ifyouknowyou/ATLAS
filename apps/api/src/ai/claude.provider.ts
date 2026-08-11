import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AppConfig } from '../config/env';

/**
 * Provider boundary for the AI engine (Phase 4).
 *
 * The API server is the ONLY place that ever holds the Anthropic credential —
 * the web client never sees it. Configuration state lives on the provider so
 * tests can swap in a fake via the CLAUDE_PROVIDER token regardless of whether
 * a real key is present in the environment.
 */
export const CLAUDE_PROVIDER = Symbol('CLAUDE_PROVIDER');

export interface ClaudeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeChatRequest {
  system: string;
  messages: ClaudeChatMessage[];
  maxTokens: number;
}

export interface ClaudeResult {
  text: string;
}

export interface ClaudeProvider {
  isConfigured(): boolean;
  chat(request: ClaudeChatRequest): Promise<ClaudeResult>;
}

/** Real Anthropic Claude implementation (server-side key only). */
@Injectable()
export class AnthropicClaudeProvider implements ClaudeProvider {
  private readonly client: Anthropic | null;

  constructor(private readonly config: AppConfig) {
    this.client = config.anthropicApiKey
      ? new Anthropic({ apiKey: config.anthropicApiKey })
      : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async chat(request: ClaudeChatRequest): Promise<ClaudeResult> {
    const client = this.requireClient();
    try {
      const response = await client.messages.create({
        model: this.config.anthropicModel,
        max_tokens: request.maxTokens,
        thinking: { type: 'adaptive' },
        system: request.system,
        messages: request.messages,
      });
      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
      return { text };
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException(
          'AI assistant is temporarily busy — please try again shortly',
        );
      }
      if (error instanceof Anthropic.APIConnectionError) {
        throw new ServiceUnavailableException(
          'AI assistant could not reach the model provider',
        );
      }
      throw error;
    }
  }

  private requireClient(): Anthropic {
    if (!this.client) {
      throw new ServiceUnavailableException('AI assistant is not configured');
    }
    return this.client;
  }
}

/** No-op provider used when ANTHROPIC_API_KEY is absent. */
@Injectable()
export class DisabledClaudeProvider implements ClaudeProvider {
  isConfigured(): boolean {
    return false;
  }

  async chat(): Promise<ClaudeResult> {
    throw new ServiceUnavailableException('AI assistant is not configured');
  }
}
