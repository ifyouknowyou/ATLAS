import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { BackgroundJob, BackgroundJobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly principal: AuthenticatedPrincipal,
  ) {}

  async findMany(options: {
    organizationId?: string;
    investigationId?: string;
    status?: BackgroundJobStatus;
    kind?: string;
    limit?: number;
    offset?: number;
  }): Promise<BackgroundJob[]> {
    const { organizationId, investigationId, status, kind, limit = 100, offset = 0 } = options;
    const where: any = {
      organizationId: organizationId ?? this.principal.organizationId,
      ...(investigationId ? { investigationId } : {}),
      ...(status ? { status } : {}),
      ...(kind ? { kind } : {}),
    };
    return this.prisma.backgroundJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<BackgroundJob> {
    const job = await this.prisma.backgroundJob.findFirst({
      where: {
        id,
        organizationId: this.principal.organizationId,
      },
    });
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return job;
  }

  async cancel(id: string): Promise<BackgroundJob> {
    const job = await this.findOne(id);
    return this.prisma.backgroundJob.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getJobCountsByStatus(organizationId?: string): Promise<Record<string, number>> {
    const orgId = organizationId ?? this.principal.organizationId;
    const jobs = await this.prisma.backgroundJob.groupBy({
      by: ['status'],
      where: { organizationId: orgId },
      _count: true,
    });
    return jobs.reduce((acc, job) => {
      acc[job.status] = job._count;
      return acc;
    }, {} as Record<string, number>);
  }
}