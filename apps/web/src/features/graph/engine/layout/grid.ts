import type { GraphData } from '../../types';

/** Grid layout: nodes placed column-by-column. Deterministic. */
export function gridLayout(
  data: GraphData,
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (data.nodes.length === 0) return positions;

  const columns = Math.ceil(Math.sqrt(data.nodes.length));
  const cellW = width / columns;
  const cellH = height / Math.ceil(data.nodes.length / columns);

  data.nodes.forEach((node, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    positions.set(node.id, {
      x: cellW * col + cellW / 2,
      y: cellH * row + cellH / 2,
    });
  });
  return positions;
}