import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { APP_CONFIG } from '../config/app-config';
import { AppConfig } from '../config/env';
import type { AiSourceRef } from '@atlas/shared';

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
}

interface TavilyResponse {
  results?: TavilyResult[];
  answer?: string;
}

/** Optional web research boundary. Results are clearly marked as web sources. */
@Injectable()
export class TavilyResearchService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async search(query: string): Promise<AiSourceRef[]> {
    if (this.config.aiEnableWebResearch === false || !this.config.tavilyApiKey) {
      return [];
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: this.config.tavilyApiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      }),
    });
    const payload = (await response.json()) as TavilyResponse;
    if (!response.ok) {
      throw new ServiceUnavailableException('Web research provider is unavailable');
    }

    return (payload.results ?? [])
      .filter((result): result is TavilyResult & { url: string; title: string } =>
        Boolean(result.url && result.title),
      )
      .map((result) => ({
        kind: 'WEB' as const,
        id: result.url,
        title: result.title,
        snippet: result.content,
      }));
  }
}
