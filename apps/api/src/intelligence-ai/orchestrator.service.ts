import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedRequest } from '../auth/principal';

@Injectable()
export class IntelligenceAiOrchestratorService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest) {
    console.log('[Phase6] IntelligenceAiOrchestratorService ready');
  }

  async orchestrate(orgId: string, prompt: string, context: Record<string, unknown>) {
    return {
      status: 'orchestrated',
      result: { summary: 'placeholder', citations: [], tokenUsage: 0 },
    };
  }
}