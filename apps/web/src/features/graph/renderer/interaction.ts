import type { GraphNode, Viewport } from '../types';
import { screenToWorld, worldToScreen } from './viewport';

/** Hit-test: nearest node within `px` of the cursor (screen pixels). */
export function hitTestNode(
  nodes: GraphNode[],
  cursor: { x: number; y: number },
  viewport: Viewport,
  tolerance = 10,
): GraphNode | null {
  let best: GraphNode | null = null;
  let bestDist = tolerance;
  for (const node of nodes) {
    const p = worldToScreen({ x: node.x, y: node.y }, viewport);
    const dx = p.x - cursor.x;
    const dy = p.y - cursor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= bestDist) {
      bestDist = dist;
      best = node;
    }
  }
  return best;
}

/** Constrain a dragged node's world position to the cursor. */
export function dragConstraint(
  cursor: { x: number; y: number },
  viewport: Viewport,
): { x: number; y: number } {
  return screenToWorld(cursor, viewport);
}

export interface MarqueeBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export function startMarquee(start: { x: number; y: number }): MarqueeBox {
  return { x0: start.x, y0: start.y, x1: start.x, y1: start.y };
}

export function updateMarquee(
  box: MarqueeBox,
  current: { x: number; y: number },
): MarqueeBox {
  return { ...box, x1: current.x, y1: current.y };
}

/** Which nodes fall inside a marquee box (screen coords). */
export function nodesInMarquee(
  nodes: GraphNode[],
  box: MarqueeBox,
  viewport: Viewport,
): GraphNode[] {
  const minX = Math.min(box.x0, box.x1);
  const maxX = Math.max(box.x0, box.x1);
  const minY = Math.min(box.y0, box.y1);
  const maxY = Math.max(box.y0, box.y1);
  return nodes.filter((node) => {
    const p = worldToScreen({ x: node.x, y: node.y }, viewport);
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  });
}

/** Cursor drag delta in world units (for panning). */
export function panDelta(
  raw: { dx: number; dy: number },
  viewport: Viewport,
): { dx: number; dy: number } {
  return { dx: raw.dx / viewport.scale, dy: raw.dy / viewport.scale };
}