import { Injectable } from '@nestjs/common';
import { GraphNodePayload, GeoPoint, RadiusResult } from '@atlas/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedPrincipal } from '../auth/principal';
import { InvestigationAccessService } from '../investigations/investigation-access.service';
import {
  ArcsQueryDto,
  BoundingBoxQueryDto,
  LocationsQueryDto,
  RadiusQueryDto,
} from './geo.dto';

/**
 * Geospatial intelligence (Phase 3).
 *
 * Strategy: indexed plain `latitude`/`longitude` columns + app-level haversine
 * over a bounded pre-filter window. PostGIS is deliberately NOT introduced —
 * dataset volumes are small and the requirement is precise, server-side
 * filtering that never leaks unauthorized records.
 */

/** Haversine great-circle distance in kilometres. Pure, testable. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Approximate 1° of latitude in km (constant for a sphere). */
const KM_PER_DEG_LAT = 111.0;

@Injectable()
export class GeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: InvestigationAccessService,
  ) {}

  private accessWhere(principal: AuthenticatedPrincipal) {
    return this.access.listAccessWhere(principal) ?? {};
  }

  private geoNodeSelect() {
    return {
      id: true,
      name: true,
      type: true,
      confidence: true,
      latitude: true,
      longitude: true,
      investigationId: true,
    };
  }

  /** Entities within a bounding box (inclusive edges). */
  async inBoundingBox(
    principal: AuthenticatedPrincipal,
    query: BoundingBoxQueryDto,
  ): Promise<GraphNodePayload[]> {
    const rows = await this.prisma.entity.findMany({
      select: this.geoNodeSelect(),
      where: {
        organizationId: principal.organizationId,
        latitude: { gte: query.minLat, lte: query.maxLat },
        longitude: { gte: query.minLng, lte: query.maxLng },
        ...(query.investigationId ? { investigationId: query.investigationId } : {}),
        ...(query.entityType ? { type: query.entityType } : {}),
        ...this.accessWhere(principal),
      },
      orderBy: { updatedAt: 'desc' },
      take: query.limit,
    });
    return rows as GraphNodePayload[];
  }

  /** Entities within a radius of a point (bounded window + haversine). */
  async inRadius(
    principal: AuthenticatedPrincipal,
    query: RadiusQueryDto,
  ): Promise<RadiusResult> {
    const center = { latitude: query.lat, longitude: query.lng };
    // Pre-filter window that guarantees the true radius circle is a subset.
    const dLat = query.radiusKm / KM_PER_DEG_LAT;
    const latRad = (center.latitude * Math.PI) / 180;
    const dLng = query.radiusKm / (KM_PER_DEG_LAT * Math.max(Math.cos(latRad), 0.01));

    const rows = await this.prisma.entity.findMany({
      select: this.geoNodeSelect(),
      where: {
        organizationId: principal.organizationId,
        latitude: { gte: center.latitude - dLat, lte: center.latitude + dLat },
        longitude: {
          gte: center.longitude - dLng,
          lte: center.longitude + dLng,
        },
        ...(query.investigationId ? { investigationId: query.investigationId } : {}),
        ...(query.entityType ? { type: query.entityType } : {}),
        ...this.accessWhere(principal),
      },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    });

    const within = rows
      .filter((r) => r.latitude !== null && r.longitude !== null)
      .map((r) => ({ row: r, dist: haversineKm(center, { latitude: r.latitude!, longitude: r.longitude! }) }))
      .filter(({ dist }) => dist <= query.radiusKm)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, query.limit);

    return {
      items: within.map(({ row }) => ({
        latitude: row.latitude!,
        longitude: row.longitude!,
      })),
      meta: {
        center,
        radiusKm: query.radiusKm,
        count: within.length,
      },
    };
  }

  /** All geolocated entities (feeds globe markers + map fallback list). */
  async locations(
    principal: AuthenticatedPrincipal,
    query: LocationsQueryDto,
  ): Promise<GraphNodePayload[]> {
    const rows = await this.prisma.entity.findMany({
      select: this.geoNodeSelect(),
      where: {
        organizationId: principal.organizationId,
        latitude: { not: null },
        longitude: { not: null },
        ...(query.investigationId ? { investigationId: query.investigationId } : {}),
        ...(query.entityType ? { type: query.entityType } : {}),
        ...this.accessWhere(principal),
      },
      orderBy: { updatedAt: 'desc' },
      take: query.limit,
    });
    return rows as GraphNodePayload[];
  }

  /**
   * Connection arcs: relationships whose two endpoints both carry coordinates.
   * Feeds the globe + map arc overlays.
   */
  async arcs(
    principal: AuthenticatedPrincipal,
    query: ArcsQueryDto,
  ): Promise<Array<{ source: GeoPoint; target: GeoPoint; kind: string; confidence: number }>> {
    const rows = await this.prisma.relationship.findMany({
      where: {
        organizationId: principal.organizationId,
        ...(query.investigationId ? { investigationId: query.investigationId } : {}),
        ...this.accessWhere(principal),
      },
      select: {
        kind: true,
        confidence: true,
        source: {
          select: { latitude: true, longitude: true },
        },
        target: {
          select: { latitude: true, longitude: true },
        },
      },
      take: query.limit,
    });
    return rows
      .filter(
        (r) =>
          r.source.latitude !== null &&
          r.source.longitude !== null &&
          r.target.latitude !== null &&
          r.target.longitude !== null,
      )
      .map((r) => ({
        source: { latitude: r.source.latitude!, longitude: r.source.longitude! },
        target: { latitude: r.target.latitude!, longitude: r.target.longitude! },
        kind: r.kind,
        confidence: r.confidence,
      }));
  }

}