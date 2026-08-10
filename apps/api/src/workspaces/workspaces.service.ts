import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { requireFound } from '../common/resources';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

/**
 * Workspace queries are always scoped to `organizationId` derived from the
 * authenticated principal — never from client input.
 */
@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.workspace.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { investigations: true, entities: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(
    organizationId: string,
    createdById: string,
    dto: CreateWorkspaceDto,
  ) {
    return this.prisma.workspace
      .create({
        data: {
          name: dto.name,
          description: dto.description,
          organizationId,
          createdById,
        },
      })
      .catch((error: unknown) => {
        if (isUniqueViolation(error)) {
          throw new ConflictException(
            `A workspace named "${dto.name}" already exists`,
          );
        }
        throw error;
      });
  }

  async update(
    organizationId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId },
      select: { id: true },
    });
    requireFound(workspace, 'Workspace');
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: dto,
    });
  }

  async remove(organizationId: string, workspaceId: string): Promise<void> {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId },
      select: { id: true },
    });
    requireFound(workspace, 'Workspace');
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  /**
   * Activates a workspace for the current user (updates their membership's
   * activeWorkspace). The target workspace must belong to their organization.
   */
  async activate(
    organizationId: string,
    userId: string,
    workspaceId: string,
  ): Promise<{ organizationId: string; workspaceId: string }> {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId },
      select: { id: true },
    });
    requireFound(workspace, 'Workspace');

    await this.prisma.membership.updateMany({
      where: { userId, organizationId },
      data: { activeWorkspaceId: workspaceId },
    });
    return { organizationId, workspaceId };
  }

  /** Whether a workspace id belongs to the given org (used by other modules). */
  async belongsToOrganization(
    organizationId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const found = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId },
      select: { id: true },
    });
    return found !== null;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}