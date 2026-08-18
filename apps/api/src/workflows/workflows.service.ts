import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { JobQueueService } from '../jobs/job-queue.service';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal, private readonly jobs: JobQueueService) {}

  list(organizationId?: string) {
    return this.prisma.intelligenceWorkflow.findMany({
      where: { organizationId: organizationId ?? this.principal.organizationId, isActive: true, isPublished: true },
    });
  }

  create(dto: { name: string; description?: string; kind: string; steps: Record<string, unknown> }) {
    return this.prisma.intelligenceWorkflow.create({
      data: {
        organizationId: this.principal.organizationId,
        name: dto.name,
        description: dto.description,
        kind: dto.kind,
        steps: JSON.parse(JSON.stringify(dto.steps)),
        createdById: this.principal.userId,
      },
    });
  }

  async trigger(id: string, context: unknown) {
    const workflow = await this.prisma.intelligenceWorkflow.findFirst({
      where: { id, organizationId: this.principal.organizationId, isActive: true, isPublished: true },
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const run = await this.prisma.workflowRun.create({
      data: {
        organizationId: this.principal.organizationId,
        workflowId: workflow.id,
        status: 'RUNNING',
        triggeredById: this.principal.userId,
        triggeredByType: 'USER',
        context: typeof context === 'string' ? context : JSON.stringify(context),
        currentStepIndex: 0,
        runToken: `${workflow.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      },
    });

    const steps = workflow.steps as Array<{ type: string }>;
    if (steps.length) {
      await this.jobs.enqueue({
        kind: 'ORCHESTRATION_TASK',
        payload: { runId: run.id, stepIndex: 0 },
        organizationId: this.principal.organizationId,
      });
    }

    return run;
  }

  async getRuns(workflowId: string, limit = 50) {
    return this.prisma.workflowRun.findMany({
      where: { workflowId, organizationId: this.principal.organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRun(id: string) {
    const run = await this.prisma.workflowRun.findFirst({ where: { id, organizationId: this.principal.organizationId } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }
    return run;
  }

  async approveStep(runId: string, stepIndex: number, comment?: string) {
    const run = await this.prisma.workflowRun.findFirst({ where: { id: runId, organizationId: this.principal.organizationId } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }
    await this.prisma.workflowApproval.create({
      data: {
        runId,
        stepIndex,
        approverId: this.principal.userId,
        status: 'APPROVED',
        comment,
      },
    });
    await this.prisma.workflowRun.update({ where: { id: runId }, data: { status: 'RUNNING' } });
    await this.jobs.enqueue({
      kind: 'ORCHESTRATION_TASK',
      payload: { runId, stepIndex: run.currentStepIndex + 1 },
      organizationId: run.organizationId,
    });
    return this.getRun(runId);
  }

  async rejectStep(runId: string, stepIndex: number, comment?: string) {
    const run = await this.prisma.workflowRun.findFirst({ where: { id: runId, organizationId: this.principal.organizationId } });
    if (!run) {
      throw new NotFoundException('Run not found');
    }
    await this.prisma.workflowApproval.create({
      data: {
        runId,
        stepIndex,
        approverId: this.principal.userId,
        status: 'REJECTED',
        comment,
      },
    });
    await this.prisma.workflowRun.update({ where: { id: runId }, data: { status: 'FAILED' } });
    return this.getRun(runId);
  }
}