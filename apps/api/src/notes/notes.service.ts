import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import { CreateNoteDto, ListNotesQueryDto, UpdateNoteDto } from './dto/note.dto';

/**
 * Investigation notes with visibility:
 *  - INVESTIGATION visibility — readable by any investigation member.
 *  - PRIVATE — readable only by the author (or an investigation LEAD / org admin).
 */
@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListNotesQueryDto) {
    const access = await this.access.requireCapability(
      principal,
      query.investigationId,
      'read',
    );

    const where: Prisma.NoteWhereInput = {
      investigationId: query.investigationId,
      organizationId: access.investigation.organizationId,
    };
    if (!access.admin) {
      where.OR = [
        { visibility: 'INVESTIGATION' },
        { visibility: 'PRIVATE', createdById: principal.userId },
        {
          visibility: 'PRIVATE',
          investigation: {
            members: { some: { userId: principal.userId, role: 'LEAD' } },
          },
        },
      ];
    }
    if (query.q) {
      where.AND = {
        OR: [
          { title: { contains: query.q, mode: 'insensitive' as const } },
          { body: { contains: query.q, mode: 'insensitive' as const } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        select: {
          id: true,
          title: true,
          body: true,
          visibility: true,
          investigationId: true,
          entityId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, displayName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async get(principal: AuthenticatedPrincipal, noteId: string) {
    const found = await this.prisma.note.findFirst({
      where: { id: noteId, organizationId: principal.organizationId },
      include: {
        investigation: { select: { id: true, title: true } },
        createdBy: { select: { id: true, displayName: true } },
      },
    });
    const note = requireFound(found, 'Note');
    if (!note.investigationId) {
      throw new NotFoundException('Note is not attached to an investigation');
    }
    const access = await this.access.requireCapability(
      principal,
      note.investigationId,
      'read',
    );
    await this.assertCanReadNote(principal, access.admin, {
      visibility: note.visibility,
      createdById: note.createdById,
      investigationId: note.investigationId,
    });
    return note;
  }

  async create(principal: AuthenticatedPrincipal, dto: CreateNoteDto) {
    const access = await this.access.requireCapability(
      principal,
      dto.investigationId,
      'contribute',
    );

    if (dto.entityId) {
      const found = await this.prisma.entity.findFirst({
        where: {
          id: dto.entityId,
          organizationId: access.investigation.organizationId,
        },
        select: { id: true, investigationId: true },
      });
      const entity = requireFound(found, 'Linked entity');
      if (entity.investigationId !== dto.investigationId) {
        throw new ForbiddenException('Entity is not part of this investigation');
      }
    }

    const note = await this.prisma.note.create({
      data: {
        title: dto.title,
        body: dto.content,
        visibility: dto.visibility ?? 'INVESTIGATION',
        investigationId: dto.investigationId,
        entityId: dto.entityId ?? null,
        organizationId: principal.organizationId,
        createdById: principal.userId,
      },
    });

    await this.activity.record(principal, {
      type: 'NOTE_CREATED',
      message: `Note "${note.title}" created`,
      investigationId: dto.investigationId,
    });
    return note;
  }

  async update(
    principal: AuthenticatedPrincipal,
    noteId: string,
    dto: UpdateNoteDto,
  ) {
    const found = await this.prisma.note.findFirst({
      where: { id: noteId, organizationId: principal.organizationId },
      select: {
        id: true,
        title: true,
        createdById: true,
        investigationId: true,
      },
    });
    const note = requireFound(found, 'Note');
    if (!note.investigationId) {
      throw new NotFoundException('Note is not attached to an investigation');
    }
    const access = await this.access.requireCapability(
      principal,
      note.investigationId,
      'manage',
    );
    // Author can edit their own note; otherwise only LEAD+ / org admin.
    if (note.createdById !== principal.userId && !access.admin && !isLead(access)) {
      throw new ForbiddenException('Only the author (or a LEAD) can edit this note');
    }

    const updated = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: dto.title,
        body: dto.content,
        visibility: dto.visibility,
        updatedById: principal.userId,
      },
    });
    await this.activity.record(principal, {
      type: 'NOTE_UPDATED',
      message: `Note "${updated.title}" updated`,
      investigationId: note.investigationId,
    });
    return updated;
  }

  async remove(
    principal: AuthenticatedPrincipal,
    noteId: string,
  ): Promise<void> {
    const found = await this.prisma.note.findFirst({
      where: { id: noteId, organizationId: principal.organizationId },
      select: { id: true, title: true, createdById: true, investigationId: true },
    });
    const note = requireFound(found, 'Note');
    if (!note.investigationId) {
      throw new NotFoundException('Note is not attached to an investigation');
    }
    const access = await this.access.requireCapability(
      principal,
      note.investigationId,
      'manage',
    );
    if (note.createdById !== principal.userId && !access.admin && !isLead(access)) {
      throw new ForbiddenException('Only the author (or a LEAD) can delete this note');
    }
    await this.prisma.note.delete({ where: { id: noteId } });
    await this.activity.record(principal, {
      type: 'NOTE_UPDATED',
      message: `Note "${note.title}" removed`,
      investigationId: note.investigationId,
    });
  }

  private async assertCanReadNote(
    principal: AuthenticatedPrincipal,
    orgAdmin: boolean,
    note: { visibility: string; createdById: string; investigationId: string },
  ): Promise<void> {
    if (note.visibility === 'PRIVATE' && !orgAdmin && note.createdById !== principal.userId) {
      const canLead = await this.prisma.investigationMember.findUnique({
        where: {
          investigationId_userId: {
            investigationId: note.investigationId,
            userId: principal.userId,
          },
        },
        select: { role: true },
      });
      if (!canLead || canLead.role !== 'LEAD') {
        throw new ForbiddenException('This note is private');
      }
    }
  }
}

function isLead(access: { admin: boolean; role: string | null }): boolean {
  return access.role === 'LEAD';
}

export { NotFoundException as NoteNotFound };