import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';

@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService, private readonly principal: AuthenticatedPrincipal) {}

  list(organizationId?: string) {
    return this.prisma.watchlist.findMany({
      where: { organizationId: organizationId ?? this.principal.organizationId, isActive: true },
    });
  }

  create(dto: { name: string; description?: string; sources?: unknown }) {
    return this.prisma.watchlist.create({
      data: {
        organizationId: this.principal.organizationId,
        name: dto.name,
        description: dto.description,
        sources: dto.sources ?? {},
        createdById: this.principal.userId,
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