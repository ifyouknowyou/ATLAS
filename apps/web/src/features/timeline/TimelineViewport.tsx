'use client';
import { useMemo } from 'react';
import type { TimelineRow } from '@/lib/queries';
import { bucketEvents, kindColor, timelineBounds, xForTime } from './engine/timelineEngine';
import { useTimeline } from '@/lib/queries';

interface TimelineViewportProps {
  investigationId?: string;
  entityId?: string;
  onSelectEvent?: (eventId: string | null) => void;
  /** Event id currently selected in the list — rendered with emphasis. */
  selectedEventId?: string | null;
}

const WIDTH = 960;
const LANE_H = 20;
const DENSITY_H = 48;
const PAD = 40;

/**
 * Horizontal chronological timeline: density histogram + per-kind lanes.
 * SVG for accessibility and testability (§25-27).
 */
export function TimelineViewport({ investigationId, entityId, onSelectEvent, selectedEventId }: TimelineViewportProps) {
  const { data, isLoading, isError } = useTimeline({ investigationId, entityId, limit: 200 });
  const items = data?.items;

  const layout = useMemo(() => {
    const rows = items ?? [];
    const bounds = timelineBounds(rows);
    const density = bucketEvents(rows, bounds.min, bounds.max, 60);
    const byKind = new Map<string, TimelineRow[]>();
    for (const e of rows) {
      const list = byKind.get(e.kind) ?? [];
      list.push(e);
      byKind.set(e.kind, list);
    }
    const kinds = [...byKind.keys()].sort();
    return { bounds, density, byKind, kinds };
  }, [items]);

  const contentHeight = layout.kinds.length * LANE_H + DENSITY_H;

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center font-mono text-[11px] text-slate-tech">LOADING TIMELINE</div>;
  }
  if (isError) {
    return <div className="flex h-40 items-center justify-center font-mono text-[11px] text-amber-signal">TIMELINE UNAVAILABLE</div>;
  }
  if ((items?.length ?? 0) === 0) {
    return <div className="flex h-40 items-center justify-center font-mono text-[11px] text-slate-tech">NO EVENTS</div>;
  }

  const maxDensity = Math.max(...layout.density.map((d) => d.count), 1);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${WIDTH} ${contentHeight + PAD}`}
      role="img"
      aria-label="Investigation timeline"
      className="select-none"
    >
      <g transform={`translate(0, ${PAD})`}>
        {layout.density.map((bucket, i) => {
          const x = (i / layout.density.length) * WIDTH;
          const bw = WIDTH / layout.density.length;
          const h = (bucket.count / maxDensity) * DENSITY_H;
          return (
            <rect
              key={i}
              x={x}
              y={DENSITY_H - h}
              width={bw - 1}
              height={h}
              fill={h > 0 ? '#4fd8c8' : '#12202e'}
              opacity={0.7}
            />
          );
        })}
      </g>
      {layout.kinds.map((kind, i) => {
        const y = PAD + DENSITY_H + i * LANE_H + LANE_H / 2;
        return (
          <g key={kind}>
            <text x={4} y={y + 3} fontSize={9} fill="#8aa3c2" fontFamily="monospace">
              {kind}
            </text>
            {layout.byKind.get(kind)!.map((e) => {
              const x = xForTime(new Date(e.occurredAt).getTime(), layout.bounds, WIDTH);
              const selected = e.id === selectedEventId;
              return (
                <circle
                  key={e.id}
                  cx={x}
                  cy={y}
                  r={selected ? 6 : 4}
                  fill={selected ? '#e8b64c' : kindColor(e.kind)}
                  stroke={selected ? '#f4f8ff' : '#04070c'}
                  strokeWidth={selected ? 1.5 : 1}
                  onClick={() => onSelectEvent?.(e.id)}
                  className="cursor-pointer"
                >
                  <title>{`${e.title} · ${e.kind}`}</title>
                </circle>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}