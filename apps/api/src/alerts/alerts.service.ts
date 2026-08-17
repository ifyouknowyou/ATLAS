import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';

export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal, private readonly realtime: RealtimeService) {}

  list(filters: { severity?: string; status?: string }) {
    return this.prisma.alert.findMany({
      where: {
        organizationId: this.principal.organizationId,
        ...(filters.severity ? { severity } : {}),
        ...(filters.status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(orgId: string, payload: { severity: AlertSeverity; title: string; description?: string; investigationId?: string }) {
    const alert = await this.prisma.alert.create({
      data: {
        organizationId: orgId,
        severity: payload.severity,
        title: payload.title,
        description: payload.description,
        investigationId: payload.investigationId,
        status: 'OPEN',
      },
    });

    await this.realtime.publish(`/alerts/${orgId}`, { action: 'created', alert });
    return alert;
  }

  async acknowledge(id: string) {
    const alert = await this.prisma.alert.findFirst({ where: { id, organizationId: this.principal.organizationId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return this.prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() } });
  }

  async dismiss(id: string, reason?: string) {
    const alert = await this.prisma.alert.findFirst({ where: { id, organizationId: this.principal.organizationId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return this.prisma.alert.update({
      where: { id },
      data: { status: 'DISMISSED', dismissedAt: new Date(), context: { ...(alert.context ?? {}), dismissReason: reason } as any },
    });
  }
}