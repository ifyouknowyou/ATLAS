import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AiChatReply, AiSourceRef } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import { ActivityService } from '../common/activity.service';
import { CLAUDE_PROVIDER, type ClaudeProvider } from './claude.provider';
import { RetrievalService } from './retrieval.service';
import { assistantSystemWithContext, summarizerSystemWithContext } from './prompts';

const CHAT_MAX_TOKENS = 4096;
const SUMMARY_MAX_TOKENS = 2048;
const HISTORY_LIMIT = 40;

@Injectable()
export class AiService {
  constructor(
    @Inject(CLAUDE_PROVIDER) private readonly provider: ClaudeProvider,
    private readonly retrieval: RetrievalService,
    private readonly access: InvestigationAccessService,
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /** Resolve the request's investigation scope; throws 403/404 when denied. */
  private async resolveScope(
    principal: AuthenticatedPrincipal,
    investigationId?: string,
  ): Promise<{ investigationId: string | null }> {
    if (investigationId) {
      await this.access.resolve(principal, investigationId);
      return { investigationId };
    }
    this.access.assertOrgPermission(principal, 'investigation.read');
    return { investigationId: null };
  }

  /**
   * Chat with the assistant. Retrieves tenant-isolated context for the
   * investigation (or org-wide), asks the model, and persists the exchange.
   */
  async chat(
    principal: AuthenticatedPrincipal,
    input: {
      investigationId?: string;
      message: string;
      history?: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>;
    },
  ): Promise<AiChatReply> {
    if (!this.provider.isConfigured()) {
      throw new ServiceUnavailableException('AI assistant is not configured');
    }
    const { investigationId } = await this.resolveScope(principal, input.investigationId);

    const terms = this.retrieval.tokenize(input.message);
    const { sources, contextText } = await this.retrieval.retrieve(principal, {
      investigationId: investigationId ?? undefined,
      terms,
    });

    const system = assistantSystemWithContext(contextText, sources);
    const messages = [
      ...(input.history ?? [])
        .filter((m) => m.content.trim().length > 0)
        .slice(-HISTORY_LIMIT)
        .map((m) => ({
          role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        })),
      { role: 'user' as const, content: input.message },
    ];

    const { text: reply } = await this.provider.chat({ system, messages, maxTokens: CHAT_MAX_TOKENS });

    await this.persist(principal, investigationId, 'USER', input.message, null);
    const assistantRow = await this.persist(principal, investigationId, 'ASSISTANT', reply, sources);

    void this.activity
      .record(principal, {
        type: 'AI_CHAT_CREATED',
        message: 'AI assistant answered a question',
        investigationId,
      })
      .catch(() => undefined);

    return { reply, sources, messageId: assistantRow.id };
  }

  /** Structured investigation summary (knowledge-graph reasoning). */
  async summarize(
    principal: AuthenticatedPrincipal,
    input: { investigationId?: string },
  ): Promise<{
    summary: {
      overview: string;
      keyEntities: string[];
      keyRelationships: string[];
      evidenceHighlights: string[];
      openQuestions: string[];
    };
    sources: AiSourceRef[];
  }> {
    if (!this.provider.isConfigured()) {
      throw new ServiceUnavailableException('AI assistant is not configured');
    }
    const { investigationId } = await this.resolveScope(principal, input.investigationId);

    const { sources, contextText } = await this.retrieval.retrieve(principal, {
      investigationId: investigationId ?? undefined,
    });

    const system = summarizerSystemWithContext(contextText);
    const { text } = await this.provider.chat({
      system,
      messages: [
        {
          role: 'user',
          content: 'Produce the structured investigation summary JSON from CONTEXT only.',
        },
      ],
      maxTokens: SUMMARY_MAX_TOKENS,
    });

    const summary = parseSummary(text);

    void this.activity
      .record(principal, {
        type: 'AI_SUMMARY_CREATED',
        message: 'Generated an investigation summary',
        investigationId,
      })
      .catch(() => undefined);

    return { summary, sources };
  }

  /** List persisted AI messages, tenant + investigation scoped. */
  async listMessages(
    principal: AuthenticatedPrincipal,
    investigationId?: string,
    limit = 50,
  ): Promise<
    Array<{
      id: string;
      role: string;
      content: string;
      sources: AiSourceRef[] | null;
      createdAt: Date;
    }>
  > {
    const { investigationId: resolved } = await this.resolveScope(principal, investigationId);
    const scoped =
      resolved !== null
        ? { organizationId: principal.organizationId, investigationId: resolved }
        : {
            organizationId: principal.organizationId,
            ...(this.access.listAccessWhere(principal) ?? {}),
          };
    const rows = await this.prisma.aiMessage.findMany({
      where: scoped,
      orderBy: { createdAt: 'asc' },
      take: Math.min(limit, 100),
    });
    return rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      sources: Array.isArray(row.sources)
        ? (row.sources as unknown as AiSourceRef[])
        : null,
      createdAt: row.createdAt,
    }));
  }

  private async persist(
    principal: AuthenticatedPrincipal,
    investigationId: string | null,
    role: 'USER' | 'ASSISTANT',
    content: string,
    sources: AiSourceRef[] | null,
  ): Promise<{ id: string }> {
    return this.prisma.aiMessage.create({
      data: {
        role,
        content,
        sources: sources ? (sources as unknown as object) : undefined,
        organizationId: principal.organizationId,
        investigationId,
        userId: principal.userId,
      },
      select: { id: true },
    });
  }
}

/** Defensively extract the structured summary from a model reply. */
function parseSummary(text: string): {
  overview: string;
  keyEntities: string[];
  keyRelationships: string[];
  evidenceHighlights: string[];
  openQuestions: string[];
} {
  const fallback = {
    overview: '',
    keyEntities: [] as string[],
    keyRelationships: [] as string[],
    evidenceHighlights: [] as string[],
    openQuestions: [] as string[],
  };
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<typeof fallback>;
    const str = (v: unknown): string => (typeof v === 'string' ? v : '');
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    return {
      overview: str(parsed.overview),
      keyEntities: arr(parsed.keyEntities),
      keyRelationships: arr(parsed.keyRelationships),
      evidenceHighlights: arr(parsed.evidenceHighlights),
      openQuestions: arr(parsed.openQuestions),
    };
  } catch {
    return fallback;
  }
}