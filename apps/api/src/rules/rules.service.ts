import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal) {}

  list(organizationId?: string) {
    return this.prisma.intelligenceRule.findMany({
      where: {
        organizationId: organizationId ?? this.principal.organizationId,
        isActive: true,
      },
    });
  }

  async create(dto: { name: string; description?: string; conditions: unknown; actions: unknown }) {
    return this.prisma.intelligenceRule.create({
      data: {
        organizationId: this.principal.organizationId,
        name: dto.name,
        description: dto.description,
        conditions: dto.conditions,
        actions: dto.actions,
        createdById: this.principal.userId,
      },
    });
  }

  async evaluate(ruleId: string, context: unknown, log = true) {
    const rule = await this.prisma.intelligenceRule.findFirst({
      where: { id: ruleId, organizationId: this.principal.organizationId, isActive: true },
    });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    const satisfied = this.evaluateCondition(rule.conditions, context);
    if (log) {
      await this.prisma.intelligenceRule.update({ where: { id: ruleId }, data: { runCount: { increment: 1 }, lastTriggeredAt: new Date() } });
    }
    return satisfied;
  }

  async test(id: string, context: unknown) {
    const satisfied = await this.evaluate(id, context, false);
    return { satisfied, evaluatedAt: new Date() };
  }

  private evaluateCondition(condition: unknown, context: unknown) {
    if (typeof condition !== 'object' || !condition) return Boolean(context);
    const c = condition as Record<string, unknown>;
    switch (c.type) {
      case 'ENTITY_COUNT': {
        const count = (context as Record<string, unknown>).entityCount ?? 0;
        return this.compare(count, String(c.value), String(c.operator));
      }
      case 'TAG_MATCH': {
        const entity = (context as Record<string, unknown>).entity as Record<string, unknown> | undefined;
        const tags = (entity?.tags ?? []) as string[];
        const required = String(c.value);
        return tags.includes(required);
      }
      case 'ANOMALY_DETECTED': {
        const anomaly = (context as Record<string, unknown>).anomaly;
        return Boolean(anomaly);
      }
      default:
        return false;
    }
  }

  private compare(value: number, target: string, operator: string) {
    switch (operator) {
      case 'GREATER_THAN': return value > Number(target);
      case 'LESS_THAN': return value < Number(target);
      case 'EQUALS': return value === Number(target);
      default: return false;
    }
  }
}