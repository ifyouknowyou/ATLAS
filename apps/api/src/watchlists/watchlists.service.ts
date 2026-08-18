import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedRequest } from '../auth/principal';

@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService, @Inject(REQUEST) private readonly request: AuthenticatedRequest) {}

  list(organizationId?: string) {
    return this.prisma.watchlist.findMany({
      where: { organizationId: organizationId ?? this.request.principal.organizationId, isActive: true },
    });
  }

  create(dto: { name: string; description?: string; sources?: unknown }) {
    return this.prisma.watchlist.create({
      data: {
        organizationId: this.request.principal.organizationId,
        name: dto.name,
        description: dto.description,
        sources: dto.sources ?? {},
        createdById: this.request.principal.userId,
      },
    });
  }

  items(id: string) {
    return this.prisma.watchlistItem.findMany({
      where: { watchlistId: id },
      include: { watchlist: true },
    });
  }
}