import type { TimelineRow } from '@/lib/queries';

/** Timeline kind → color lane. Unknown kinds render gray (extensible). */
export const KIND_COLORS: Record<string, string> = {
  ENTITY: '#e8b64c',
  RELATIONSHIP: '#4fd8c8',
  EVIDENCE: '#79b8ff',
  NOTE: '#9b8cff',
  ACTIVITY: '#8aa3c2',
  CUSTOM: '#ff9d76',
};

export const KIND_COLOR_DEFAULT = '#5b6b7c';

export function kindColor(kind: string): string {
  return KIND_COLORS[kind] ?? KIND_COLOR_DEFAULT;
}

export interface TimelineBounds {
  min: number;
  max: number;
}

/** Compute the [min,max] ms bounds of a set of events. */
export function timelineBounds(events: Array<{ occurredAt: string }>): TimelineBounds {
  if (events.length === 0) return { min: Date.now(), max: Date.now() };
  let min = Infinity;
  let max = -Infinity;
  for (const e of events) {
    const t = new Date(e.occurredAt).getTime();
    if (t < min) min = t;
    if (t > max) max = t;
  }
  if (min === max) max = min + 60_000; // single event → 1-minute span
  return { min, max };
}

export interface TimelineFilter {
  kinds?: Set<string>;
  investigationId?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

/** Filter events by kind + optional time window. */
export function filterEvents(
  events: TimelineRow[],
  filter: TimelineFilter,
): TimelineRow[] {
  return events.filter((e) => {
    if (filter.kinds && filter.kinds.size > 0 && !filter.kinds.has(e.kind)) {
      return false;
    }
    if (filter.investigationId && e.investigationId !== filter.investigationId) {
      return false;
    }
    if (filter.entityId && e.entityId !== filter.entityId) {
      return false;
    }
    const t = new Date(e.occurredAt).getTime();
    if (filter.from && t < new Date(filter.from).getTime()) return false;
    if (filter.to && t > new Date(filter.to).getTime()) return false;
    return true;
  });
}

export interface DensityBucket {
  start: number;
  end: number;
  count: number;
}

/** Bucket events into `buckets` equal-width time buckets (density chart). */
export function bucketEvents(
  events: Array<{ occurredAt: string }>,
  min: number,
  max: number,
  buckets: number,
): DensityBucket[] {
  const span = Math.max(max - min, 1);
  const width = span / buckets;
  const result: DensityBucket[] = Array.from({ length: buckets }, (_, i) => ({
    start: min + i * width,
    end: min + (i + 1) * width,
    count: 0,
  }));
  for (const e of events) {
    const t = new Date(e.occurredAt).getTime();
    const index = Math.min(Math.floor((t - min) / width), buckets - 1);
    result[index].count += 1;
  }
  return result;
}

/** Map a timestamp to an x position within [0, width]. */
export function xForTime(
  t: number,
  bounds: TimelineBounds,
  width: number,
): number {
  const span = Math.max(bounds.max - bounds.min, 1);
  return ((t - bounds.min) / span) * width;
}

/** Map an x position back to a timestamp. */
export function timeForX(
  x: number,
  bounds: TimelineBounds,
  width: number,
): number {
  const span = Math.max(bounds.max - bounds.min, 1);
  return bounds.min + (x / Math.max(width, 1)) * span;
}