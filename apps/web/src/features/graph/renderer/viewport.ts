import type { Viewport } from '../types';
import type { Bounds } from '../engine/metrics';

export const IDENTITY_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 };

export function worldToScreen(
  point: { x: number; y: number },
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: (point.x + viewport.x) * viewport.scale,
    y: (point.y + viewport.y) * viewport.scale,
  };
}

export function screenToWorld(
  point: { x: number; y: number },
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: point.x / viewport.scale - viewport.x,
    y: point.y / viewport.scale - viewport.y,
  };
}

/** Fit a set of world bounds into a pixel area. */
export function viewportForBounds(
  bounds: Bounds,
  width: number,
  height: number,
  padding = 60,
): Viewport {
  const bw = bounds.maxX - bounds.minX || 1;
  const bh = bounds.maxY - bounds.minY || 1;
  const scale = Math.min((width - padding * 2) / bw, (height - padding * 2) / bh);
  const safeScale = Math.max(Math.min(scale || 1, 2.5), 0.05);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    scale: safeScale,
    x: width / 2 / safeScale - cx,
    y: height / 2 / safeScale - cy,
  };
}

/** Center a world point on the viewport at the current scale. */
export function centerViewportOn(
  viewport: Viewport,
  point: { x: number; y: number },
  width: number,
  height: number,
): Viewport {
  return {
    ...viewport,
    x: width / 2 / viewport.scale - point.x,
    y: height / 2 / viewport.scale - point.y,
  };
}