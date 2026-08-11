import { ForbiddenException, Injectable } from '@nestjs/common';
import type { EvidenceAnnotationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { EvidenceAccessService } from './evidence-access.service';
import { EvidenceAccessEventService } from './evidence-access-event.service';
import { requireFound } from '../common/resources';

export interface CreateAnnotationInput {
  evidenceId: string;
  versionId?: string | null;
  type: EvidenceAnnotationType;
  /** Coordinate/position target for the annotation (image region, page…). */
  target?: { page?: number; rect?: { x: number; y: number; w: number; h: number }; startIndex?: number; endIndex?: number } | null;
  content?: string | null;
  tags?: string[];
}

/**
 * Evidence annotations (§15). Annotations are stored as separate records and
 * never mutate the original evidence file. Editing/deleting requires the
 * author (or an org admin / investigation manager).
 */
@Injectable()
export class EvidenceAnnotationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EvidenceAccessService,
    private readonly events: EvidenceAccessEventService,
  ) {}

  async list(evidenceId: string, organizationId: string): Promise<unknown[]> {
    return this.prisma.evidenceAnnotation.findMany({
      where: { evidenceId, organizationId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  async create(principal: AuthenticatedPrincipal, input: CreateAnnotationInput) {
    await this.access.requireEvidence(
      principal,
      input.evidenceId,
      'annotate',
    );
    const annotation = await this.prisma.evidenceAnnotation.create({
      data: {
        evidenceId: input.evidenceId,
        versionId: input.versionId ?? null,
        type: input.type,
        target: input.target ? (input.target as never) : undefined,
        content: input.content ?? null,
        tags: input.tags ?? [],
        authorId: principal.userId,
        organizationId: principal.organizationId,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });
    await this.events.record({
      evidenceId: input.evidenceId,
      principal,
      action: 'ANNOTATED',
      versionId: input.versionId ?? null,
      safeMetadata: { annotationType: input.type },
    });
    return annotation;
  }

  async update(
    principal: AuthenticatedPrincipal,
    annotationId: string,
    data: { content?: string | null; target?: unknown; tags?: string[] },
  ) {
    const annotation = await this.prisma.evidenceAnnotation.findUnique({
      where: { id: annotationId },
    });
    const found = requireFound(annotation, 'Annotation');
    await this.assertCanEdit(principal, found.authorId, found.organizationId);
    return this.prisma.evidenceAnnotation.update({
      where: { id: annotationId },
      data: {
        content: data.content !== undefined ? data.content : undefined,
        target: data.target ? (data.target as never) : undefined,
        tags: data.tags ?? undefined,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  async remove(principal: AuthenticatedPrincipal, annotationId: string): Promise<void> {
    const annotation = await this.prisma.evidenceAnnotation.findUnique({
      where: { id: annotationId },
    });
    const found = requireFound(annotation, 'Annotation');
    await this.assertCanEdit(principal, found.authorId, found.organizationId);
    await this.prisma.evidenceAnnotation.delete({ where: { id: annotationId } });
  }

  async resolve(principal: AuthenticatedPrincipal, annotationId: string, resolved: boolean) {
    const annotation = await this.prisma.evidenceAnnotation.findUnique({
      where: { id: annotationId },
    });
    const found = requireFound(annotation, 'Annotation');
    await this.assertCanEdit(principal, found.authorId, found.organizationId);
    return this.prisma.evidenceAnnotation.update({
      where: { id: annotationId },
      data: { resolvedAt: resolved ? new Date() : null },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  private async assertCanEdit(
    principal: AuthenticatedPrincipal,
    authorId: string,
    organizationId: string,
  ): Promise<void> {
    if (authorId === principal.userId) return;
    if (principal.organizationId !== organizationId) {
      throw new ForbiddenException('Annotation not accessible');
    }
    if (principal.permissions.includes('evidence.delete')) return;
    throw new ForbiddenException('Only the annotation author can modify this');
  }
}