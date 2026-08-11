import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';
import { RetrievalService } from './retrieval.service';
import type { ClaudeProvider, ClaudeChatRequest } from './claude.provider';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import type { AuthenticatedPrincipal } from '../auth/principal';

const principal: AuthenticatedPrincipal = {
  userId: 'u1',
  organizationId: 'org1',
  workspaceId: null,
  role: 'ANALYST',
  permissions: ['investigation.read', 'entity.read'],
};

function makeService(overrides?: {
  provider?: Partial<ClaudeProvider>;
  entities?: unknown[];
  evidence?: unknown[];
  notes?: unknown[];
  resolveThrows?: boolean;
}) {
  const calls: ClaudeChatRequest[] = [];
  const provider: ClaudeProvider = {
    isConfigured: jest.fn(() => true),
    chat: jest.fn(async (req: ClaudeChatRequest) => {
      calls.push(req);
      return { text: 'A grounded answer.' };
    }),
    ...overrides?.provider,
  };

  const prisma = {
    aiMessage: {
      create: jest.fn(async (args: { data: { role: string } }) => ({
        id: `msg-${args.data.role.toLowerCase()}`,
      })),
      findMany: jest.fn(async () => []),
    },
    entity: {
      findMany: jest.fn(async () => overrides?.entities ?? []),
    },
    evidence: {
      findMany: jest.fn(async () => overrides?.evidence ?? []),
    },
    note: {
      findMany: jest.fn(async () => overrides?.notes ?? []),
    },
  } as unknown as PrismaService;

  const access = {
    resolve: jest.fn(async () => {
      if (overrides?.resolveThrows) {
        throw new ForbiddenException('You are not a member of this investigation');
      }
      return { investigation: { id: 'inv1', organizationId: 'org1' }, admin: false, role: 'ANALYST' };
    }),
    assertOrgPermission: jest.fn(),
    listAccessWhere: jest.fn(
      () => ({ investigation: { members: { some: { userId: 'u1' } } } }),
    ),
  } as unknown as InvestigationAccessService;

  const activity = {
    record: jest.fn(async () => ({ id: 'a1' })),
  } as unknown as import('../common/activity.service').ActivityService;

  const retrieval = new RetrievalService(prisma, access);
  const service = new AiService(provider, retrieval, access, prisma, activity);
  return { service, provider, prisma, access, calls };
}

describe('AiService.chat', () => {
  it('scopes retrieval to the investigation and persists both turns', async () => {
    const { service, prisma, access, calls } = makeService({
      entities: [{ id: 'e1', name: 'Mario Rossi', summary: 'Subject of interest', investigationId: 'inv1' }],
    });

    const reply = await service.chat(principal, {
      investigationId: 'inv1',
      message: 'Who is Mario Rossi?',
    });

    expect(access.resolve).toHaveBeenCalledWith(principal, 'inv1');
    expect(prisma.aiMessage.create).toHaveBeenCalledTimes(2);
    expect(reply.reply).toBe('A grounded answer.');
    expect(reply.sources).toHaveLength(1);
    expect(reply.sources[0]).toMatchObject({ kind: 'ENTITY', id: 'e1', title: 'Mario Rossi' });
    expect(reply.messageId).toBe('msg-assistant');
    expect(calls[0].system).toContain('Mario Rossi');
    expect(calls[0].messages.at(-1)).toEqual({ role: 'user', content: 'Who is Mario Rossi?' });
  });

  it('passes prior history to the provider', async () => {
    const { service, calls } = makeService();
    await service.chat(principal, {
      message: 'Follow up',
      history: [{ role: 'USER', content: 'Earlier question' }, { role: 'ASSISTANT', content: 'Earlier answer' }],
    });
    expect(calls[0].messages).toEqual([
      { role: 'user', content: 'Earlier question' },
      { role: 'assistant', content: 'Earlier answer' },
      { role: 'user', content: 'Follow up' },
    ]);
  });

  it('rejects when the caller is not a member of the investigation', async () => {
    const { service } = makeService({ resolveThrows: true });
    await expect(
      service.chat(principal, { investigationId: 'inv1', message: 'hi' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 503 when the provider is not configured', async () => {
    const { service } = makeService({
      provider: { isConfigured: jest.fn(() => false) },
    });
    await expect(service.chat(principal, { message: 'hi' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('supports org-wide chat with no investigation', async () => {
    const { service, access } = makeService();
    await service.chat(principal, { message: 'Overview' });
    expect(access.assertOrgPermission).toHaveBeenCalledWith(principal, 'investigation.read');
  });
});

describe('AiService.summarize', () => {
  it('returns a parsed structured summary from the provider', async () => {
    const { service, prisma } = makeService({
      provider: {
        chat: jest.fn(async () => ({
          text: JSON.stringify({
            overview: 'A probe of financial activity.',
            keyEntities: ['Mario Rossi'],
            keyRelationships: ['Rossi → Acme Corp'],
            evidenceHighlights: ['Bank records'],
            openQuestions: ['Who funded it?'],
          }),
        })),
      },
    });

    const result = await service.summarize(principal, { investigationId: 'inv1' });

    expect(result.summary.overview).toBe('A probe of financial activity.');
    expect(result.summary.keyEntities).toEqual(['Mario Rossi']);
    expect(result.summary.openQuestions).toHaveLength(1);
    expect(prisma.aiMessage.create).not.toHaveBeenCalled();
  });

  it('returns empty arrays when the provider reply is not valid JSON', async () => {
    const { service } = makeService({
      provider: { chat: jest.fn(async () => ({ text: 'not json' })) },
    });
    const result = await service.summarize(principal, {});
    expect(result.summary).toEqual({
      overview: '',
      keyEntities: [],
      keyRelationships: [],
      evidenceHighlights: [],
      openQuestions: [],
    });
  });
});

describe('AiService.listMessages', () => {
  it('lists messages scoped to the investigation', async () => {
    const { service, prisma, access } = makeService();
    await service.listMessages(principal, 'inv1', 20);
    expect(access.resolve).toHaveBeenCalledWith(principal, 'inv1');
    expect(prisma.aiMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org1', investigationId: 'inv1' },
      }),
    );
  });
});
