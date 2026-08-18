import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedRequest } from '../auth/principal';
import { RealtimeService } from '../realtime/realtime.service';
import { AlertSeverity, AlertStatus } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest, private readonly realtime: RealtimeService) {}

  list(filters: { severity?: string; status?: string }) {
    const where: any = {
      organizationId: this.request.principal.organizationId,
    };

    if (filters.severity) {
      const severity = filters.severity as AlertSeverity;
      if (Object.values(AlertSeverity).includes(severity)) {
        where.severity = severity;
      }
    }

    if (filters.status) {
      const status = filters.status as AlertStatus;
      if (Object.values(AlertStatus).includes(status)) {
        where.status = status;
      }
    }

    return this.prisma.alert.findMany({
      where,
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

    await this.realtime.publish(`/alerts/${orgId}`, {
      type: 'notification',
      message: `Alert created: ${alert.title}`,
    });
    return alert;
  }

  async acknowledge(id: string) {
    const alert = await this.prisma.alert.findFirst({ where: { id, organizationId: this.request.principal.organizationId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return this.prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() } });
  }

  async dismiss(id: string, reason?: string) {
    const alert = await this.prisma.alert.findFirst({ where: { id, organizationId: this.request.principal.organizationId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
        context: typeof alert.context === 'object' && alert.context !== null
          ? { ...alert.context, dismissReason: reason }
          : { dismissReason: reason }
      },
    });
  }
}