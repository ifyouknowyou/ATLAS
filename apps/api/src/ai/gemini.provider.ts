import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { APP_CONFIG } from '../config/app-config';
import { AppConfig } from '../config/env';
import { Inject } from '@nestjs/common';
import {
  ClaudeChatMessage,
  ClaudeChatRequest,
  ClaudeProvider,
  ClaudeResult,
} from './claude.provider';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

/** Gemini REST provider; credentials remain server-side. */
@Injectable()
export class GeminiProvider implements ClaudeProvider {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  isConfigured(): boolean {
    return Boolean(this.config.geminiApiKey);
  }

  async chat(request: ClaudeChatRequest): Promise<ClaudeResult> {
    if (!this.config.geminiApiKey) {
      throw new ServiceUnavailableException('Gemini AI is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.config.geminiModel ?? 'gemini-2.0-flash')}:generateContent?key=${encodeURIComponent(this.config.geminiApiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.system }] },
          contents: request.messages.map(toGeminiMessage),
          generationConfig: {
            temperature: this.config.aiTemperature ?? 0.3,
            maxOutputTokens: request.maxTokens,
          },
        }),
      },
    );

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      throw new ServiceUnavailableException(
        payload.error?.message ?? 'Gemini request failed',
      );
    }
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();
    if (!text) {
      throw new ServiceUnavailableException('Gemini returned an empty response');
    }
    return { text };
  }
}

function toGeminiMessage(message: ClaudeChatMessage): {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
} {
  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  };
}
