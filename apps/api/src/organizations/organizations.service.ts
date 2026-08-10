import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { requireFound } from '../common/resources';
import { UpdateOrganizationSettingsDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The authenticated user's own organization, with summary counts. */
  myOrganization(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        isDemo: true,
        createdAt: true,
        settings: true,
        _count: {
          select: {
            memberships: true,
            workspaces: true,
            investigations: true,
            entities: true,
          },
        },
      },
    });
  }

  listMembers(
    organizationId: string,
  ): Promise<Array<{ id: string; role: Role; user: { id: string; email: string; displayName: string; isActive: boolean } }>> {
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, email: true, displayName: true, isActive: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Changes a member's role. Prevents removing the last OWNER so an
   * organization can never be left without an owner.
   */
  async updateMemberRole(
    organizationId: string,
    memberUserId: string,
    role: Role,
    actorId: string,
  ): Promise<{ id: string; role: Role }> {
    const found = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: memberUserId, organizationId },
      },
    });
    const membership = requireFound(found, 'Organization member');

    if (membership.role !== 'OWNER' && role === 'OWNER') {
      throw new BadRequestException('OWNER can only be assigned by an OWNER');
    }

    if (membership.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await this.prisma.membership.count({
        where: { organizationId, role: 'OWNER' },
      });
      if (ownerCount <= 1 && membership.userId === actorId) {
        throw new BadRequestException(
          'Cannot demote the last OWNER of the organization',
        );
      }
    }

    return this.prisma.membership.update({
      where: { userId_organizationId: { userId: memberUserId, organizationId } },
      data: { role },
      select: { id: true, role: true },
    });
  }

  async updateSettings(
    organizationId: string,
    dto: UpdateOrganizationSettingsDto,
  ): Promise<{ id: string; name: string }> {
    if (dto.name === undefined) {
      return this.prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        select: { id: true, name: true },
      });
    }
    await this.prisma.organization.findFirst({
      where: { id: organizationId },
      select: { id: true },
    }).then((found) => {
      if (!found) throw new NotFoundException('Organization not found');
    });
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { name: dto.name },
      select: { id: true, name: true },
    });
  }
}