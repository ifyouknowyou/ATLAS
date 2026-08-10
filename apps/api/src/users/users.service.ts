import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Current user profile (password hash never selected). */
  me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateMe(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ id: string; displayName: string }> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { displayName: dto.displayName },
      select: { id: true, displayName: true },
    });
  }

  /** Members of an organization (scoped server-side by org id). */
  listByOrganization(organizationId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}