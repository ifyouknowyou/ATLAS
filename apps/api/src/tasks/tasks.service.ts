import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPage, PageQueryDto } from '../common/pagination.dto';
import { requireFound } from '../common/resources';
import { AuthenticatedPrincipal } from '../auth/principal';
import { ActivityService } from '../common/activity.service';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto/task.dto';

/** Lightweight investigation tasks (no full project-management system). */
@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
    private readonly activity: ActivityService,
  ) {}

  async list(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    query: ListTasksQueryDto,
  ) {
    await this.access.requireCapability(principal, investigationId, 'read');
    const where = {
      investigationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(query.q
        ? { title: { contains: query.q, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          assigneeId: true,
          dueAt: true,
          createdAt: true,
          updatedAt: true,
          assignee: { select: { id: true, displayName: true } },
        },
        orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return toPage(items, total, query as PageQueryDto);
  }

  async create(
    principal: AuthenticatedPrincipal,
    investigationId: string,
    dto: CreateTaskDto,
  ) {
    await this.access.requireCapability(principal, investigationId, 'contribute');
    if (dto.assigneeId) {
      await this.assertOrgUser(principal, dto.assigneeId);
    }

    const task = await this.prisma.task.create({
      data: {
        investigationId,
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'TODO',
        priority: dto.priority ?? 'MEDIUM',
        assigneeId: dto.assigneeId ?? null,
        createdById: principal.userId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      },
    });

    await this.activity.record(principal, {
      type: 'TASK_CREATED',
      message: `Task "${task.title}" created`,
      investigationId,
    });
    return task;
  }

  async update(
    principal: AuthenticatedPrincipal,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    const task = await this.requireTask(principal, taskId, 'contribute');
    if (dto.assigneeId) {
      await this.assertOrgUser(principal, dto.assigneeId);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });

    await this.activity.record(principal, {
      type: updated.status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      message: `Task "${updated.title}" ${
        updated.status === 'DONE' ? 'completed' : 'updated'
      }`,
      investigationId: task.investigationId,
    });
    return updated;
  }

  async remove(
    principal: AuthenticatedPrincipal,
    taskId: string,
  ): Promise<void> {
    const task = await this.requireTask(principal, taskId, 'contribute');
    await this.prisma.task.delete({ where: { id: taskId } });
    await this.activity.record(principal, {
      type: 'TASK_UPDATED',
      message: `Task "${task.title}" removed`,
      investigationId: task.investigationId,
    });
  }

  private async requireTask(
    principal: AuthenticatedPrincipal,
    taskId: string,
    capability: 'read' | 'contribute' | 'manage',
  ): Promise<{ id: string; title: string; investigationId: string }> {
    const found = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, investigationId: true },
    });
    const task = requireFound(found, 'Task');
    await this.access.requireCapability(principal, task.investigationId, capability);
    return task;
  }

  private async assertOrgUser(
    principal: AuthenticatedPrincipal,
    userId: string,
  ): Promise<void> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: principal.organizationId,
        },
      },
      select: { userId: true },
    });
    if (!membership) {
      throw new BadRequestException('Assignee must belong to your organization');
    }
  }
}