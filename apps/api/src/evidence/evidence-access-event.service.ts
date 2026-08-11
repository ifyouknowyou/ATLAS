import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

export type EvidenceAccessAction =
  | 'UPLOADED'
  | 'DOWNLOADED'
  | 'PREVIEWED'
  | 'ANNOTATED'
  | 'CLASSIFICATION_CHANGED'
  | 'METADATA_EDITED'
  | 'ARCHIVED'
  | 'RESTORED'
  | 'DELETED'
  | 'PROCESSED';

interface RecordAccessInput {
  evidenceId: string;
  principal: AuthenticatedPrincipal;
  action: EvidenceAccessAction;
  versionId?: string | null;
  /** Only safe, non-sensitive metadata (never secrets). */
  safeMetadata?: Record<string, unknown>;
}

/** System-originated access events (no user principal, e.g. processing). */
interface RecordSystemInput {
  evidenceId: string;
  organizationId: string;
  action: EvidenceAccessAction;
  versionId?: string | null;
  /** Present when a user is known but no authenticated principal is available. */
  actorId?: string | null;
  actorType?: 'USER' | 'SYSTEM';
  safeMetadata?: Record<string, unknown>;
}

/**
 * Application-level chain-of-custody trail (§9). Every meaningful evidence
 * action persists an EvidenceAccessEvent. This is an audit trail for the app —
 * it never claims legal admissibility and never records secrets/sensitive
 * content.
 */
@Injectable()
export class EvidenceAccessEventService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: RecordAccessInput | RecordSystemInput): Promise<unknown> {
    const isUser = 'principal' in input;
    const data = isUser
      ? {
          evidenceId: input.evidenceId,
          action: input.action,
          actorType: 'USER',
          actorId: (input as RecordAccessInput).principal.userId,
          organizationId: (input as RecordAccessInput).principal.organizationId,
          versionId: input.versionId ?? null,
          safeMetadata: input.safeMetadata
            ? (input.safeMetadata as Prisma.InputJsonValue)
            : undefined,
        }
      : {
          evidenceId: input.evidenceId,
          action: input.action,
          actorType: (input as RecordSystemInput).actorType ?? 'SYSTEM',
          actorId: (input as RecordSystemInput).actorId ?? null,
          organizationId: (input as RecordSystemInput).organizationId,
          versionId: input.versionId ?? null,
          safeMetadata: input.safeMetadata
            ? (input.safeMetadata as Prisma.InputJsonValue)
            : undefined,
        };
    return this.prisma.evidenceAccessEvent.create({ data });
  }
}