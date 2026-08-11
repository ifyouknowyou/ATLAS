'use client';
import { useEffect, useRef } from 'react';
import { useGraphStore } from '../store';
import { nodeColor } from '../palette';

const WIDTH = 160;
const HEIGHT = 110;

/** Small overview: downsampled node positions + current viewport rect. */
export function GraphMinimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useGraphStore((s) => s.data);
  const viewport = useGraphStore((s) => s.viewport);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (data.nodes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of data.nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const sx = (WIDTH - 8) / bw;
    const sy = (HEIGHT - 8) / bh;

    for (const n of data.nodes) {
      const x = 4 + (n.x - minX) * sx;
      const y = 4 + (n.y - minY) * sy;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor(String(n.type));
      ctx.fill();
    }

    // Approximate viewport rect.
    const vw = 400 / viewport.scale;
    const vh = 260 / viewport.scale;
    ctx.strokeStyle = '#4fd8c8';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      4 + (viewport.x - minX) * sx,
      4 + (viewport.y - minY) * sy,
      vw * sx,
      vh * sy,
    );
  }, [data, viewport]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="rounded border border-void-line/60 bg-void-raised/80"
      aria-label="Graph minimap"
      role="img"
    />
  );
}