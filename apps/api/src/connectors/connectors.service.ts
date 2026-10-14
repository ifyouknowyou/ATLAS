import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedRequest } from '../auth/principal';
import { JobQueueService } from '../jobs/job-queue.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConnectorsService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest, private readonly jobQueueService: JobQueueService) {}

  sources(organizationId?: string) {
    return this.prisma.dataSource.findMany({
      where: { organizationId: organizationId ?? this.request.principal.organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSource(dto: { name: string; connectorType: string; config: Record<string, unknown>; scheduleCron?: string }) {
    return this.prisma.dataSource.create({
      data: {
        organizationId: this.request.principal.organizationId,
        name: dto.name,
        connectorType: dto.connectorType,
        config: dto.config as Prisma.InputJsonValue,
        scheduleCron: dto.scheduleCron,
        createdById: this.request.principal.userId,
      },
    });
  }

  async startSync(id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, organizationId: this.request.principal.organizationId, isActive: true },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    const job = await this.jobQueueService.enqueue({
      kind: 'CONNECTOR_SYNC',
      payload: { dataSourceId: dataSource.id },
      organizationId: this.request.principal.organizationId,
    });
    return job;
  }
}