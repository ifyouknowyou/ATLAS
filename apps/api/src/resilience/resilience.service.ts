import { Inject, Injectable, ForbiddenException, NotImplementedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal, AuthenticatedRequest } from '../auth/principal';

interface QuotaConfig {
  maxStorageBytes: number;
  maxApiRequests: number;
  maxAiTokens: number;
  maxGraphNodes: number;
  maxEvidenceCount: number;
  maxJobs: number;
  maxWorkflowExecutions: number;
}

const DEFAULT_QUOTA: QuotaConfig = {
  maxStorageBytes: 10_000_000_000,
  maxApiRequests: 100_000,
  maxAiTokens: 100_000,
  maxGraphNodes: 5000,
  maxEvidenceCount: 10_000,
  maxJobs: 1000,
  maxWorkflowExecutions: 50,
};

@Injectable()
export class ResilienceService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest) {}

  private get principal(): AuthenticatedPrincipal {
    return this.request.principal;
  }

  ensureQuotaAvailable(_orgId: string, _quotaType: keyof QuotaConfig) {
    throw new NotImplementedException('Organization quota enforcement is not implemented');
  }

  getQuota(quotaType: keyof QuotaConfig) {
    return DEFAULT_QUOTA[quotaType];
  }

  enforceExportSecurity(_resourceType: string, classification: string, _userId: string) {
    const allowed = ['PUBLIC', 'INTERNAL'];
    if (!allowed.includes(classification)) {
      throw new ForbiddenException('Export denied for classification level');
    }
    return true;
  }

  paginate<T>(items: T[], limit?: number, cursor?: string): { items: T[]; nextCursor?: string } {
    const pageSize = Math.min(limit ?? 100, 200);
    const startIdx = cursor ? parseInt(cursor, 10) || 0 : 0;
    const sliced = items.slice(startIdx, startIdx + pageSize);
    const nextCursor = startIdx + pageSize < items.length ? String(startIdx + pageSize) : undefined;
    return { items: sliced, nextCursor };
  }
}