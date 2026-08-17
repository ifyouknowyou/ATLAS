import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ConnectorsService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal, private readonly jobs: JobsService) {}

  sources(organizationId?: string) {
    return this.prisma.dataSource.findMany({
      where: { organizationId: organizationId ?? this.principal.organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSource(dto: { name: string; connectorType: string; config: Record<string, unknown>; scheduleCron?: string }) {
    return this.prisma.dataSource.create({
      data: {
        organizationId: this.principal.organizationId,
        name: dto.name,
        connectorType: dto.connectorType,
        config: dto.config,
        scheduleCron: dto.scheduleCron,
        createdById: this.principal.userId,
      },
    });
  }

  async startSync(id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, organizationId: this.principal.organizationId, isActive: true },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    const job = await this.jobs.enqueue('connector-sync', {
      dataSourceId: dataSource.id,
      organizationId: this.principal.organizationId,
    });
    return job;
  }
}