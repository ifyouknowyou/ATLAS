'use client';
import { useEffect, useRef } from 'react';
import { useGraphStore } from '../store';
import { GraphRenderer } from '../renderer/canvas';
import { hitTestNode, panDelta, startMarquee, updateMarquee, nodesInMarquee } from '../renderer/interaction';
import { viewportForBounds } from '../renderer/viewport';
import { boundsOf } from '../engine/metrics';


interface GraphCanvasProps {
  height?: string;
  onSelectNode?: (id: string | null) => void;
  onNeighborhoodRequest?: (centerId: string) => void;
}

/**
 * Interactive canvas: pan (drag), zoom (wheel), select (click), multi-select
 * (shift-drag marquee), drag-to-pin nodes. Renders via GraphRenderer each rAF.
 */
export function GraphCanvas({ height = 'h-[520px]', onSelectNode, onNeighborhoodRequest }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(-1);
  const dragRef = useRef<{ mode: 'pan' | 'node' | 'marquee'; nodeId?: string; startX: number; startY: number; box?: ReturnType<typeof startMarquee> } | null>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);

  const data = useGraphStore((s) => s.data);
  const viewport = useGraphStore((s) => s.viewport);
  const selectedIds = useGraphStore((s) => s.selectedNodeIds);
  const hoveredId = useGraphStore((s) => s.hoveredId);
  const setViewport = useGraphStore((s) => s.setViewport);
  const setHover = useGraphStore((s) => s.setHover);
  const selectNode = useGraphStore((s) => s.selectNode);
  const setNodeFixed = useRef<((id: string, fixed: boolean) => void) | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const renderer = rendererRef.current ?? (rendererRef.current = new GraphRenderer());
    renderer.draw(ctx, data, viewport, {
      selectedIds: new Set(selectedIds),
      hoveredId,
      maxNodes: 1000,
    });
  };

  const loop = () => {
    draw();
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    loop();
    return () => {
      if (rafRef.current !== -1) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rafRef.current === -1) {
      rafRef.current = requestAnimationFrame(loop);
    }
    // loop is intentionally not a dependency: it reads fresh store state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, viewport, selectedIds, hoveredId]);

  const toLocal = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toLocal(e);
    const hit = hitTestNode(data.nodes, point, viewport);
    if (e.shiftKey) {
      dragRef.current = { mode: 'marquee', startX: point.x, startY: point.y, box: startMarquee(point) };
      return;
    }
    if (hit) {
      dragRef.current = { mode: 'node', nodeId: hit.id, startX: point.x, startY: point.y };
      selectNode(hit.id, e.metaKey || e.ctrlKey);
      onSelectNode?.(hit.id);
      return;
    }
    dragRef.current = { mode: 'pan', startX: point.x, startY: point.y };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toLocal(e);
    const drag = dragRef.current;
    if (!drag) {
      const hit = hitTestNode(data.nodes, point, viewport);
      setHover(hit?.id ?? null);
      return;
    }
    if (drag.mode === 'pan') {
      const delta = panDelta({ dx: point.x - drag.startX, dy: point.y - drag.startY }, viewport);
      setViewport({ ...viewport, x: viewport.x + delta.dx, y: viewport.y + delta.dy });
      drag.startX = point.x;
      drag.startY = point.y;
    } else if (drag.mode === 'node' && drag.nodeId) {
      const world = panDelta({ dx: point.x - drag.startX, dy: point.y - drag.startY }, viewport);
      const node = data.nodes.find((n) => n.id === drag.nodeId);
      if (node) {
        node.x = node.x + world.dx;
        node.y = node.y + world.dy;
        setNodeFixed.current?.(drag.nodeId, true);
      }
      drag.startX = point.x;
      drag.startY = point.y;
    } else if (drag.mode === 'marquee' && drag.box) {
      drag.box = updateMarquee(drag.box, point);
    }
  };

  const onMouseUp = () => {
    const drag = dragRef.current;
    if (drag?.mode === 'marquee' && drag.box) {
      const inside = nodesInMarquee(data.nodes, drag.box, viewport);
      const ids = inside.map((n) => n.id);
      if (ids.length > 0) {
        selectNode(ids[0], true);
        onSelectNode?.(ids[0]);
      }
    }
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const nextScale = Math.min(Math.max(viewport.scale * factor, 0.05), 4);
    // Zoom around the cursor.
    const wx = viewport.x + cursor.x / viewport.scale;
    const wy = viewport.y + cursor.y / viewport.scale;
    setViewport({ scale: nextScale, x: wx - cursor.x / nextScale, y: wy - cursor.y / nextScale });
  };

  const onDoubleClick = () => {
    const bounds = boundsOf(data.nodes);
    const rect = canvasRef.current!.getBoundingClientRect();
    setViewport(viewportForBounds(bounds, rect.width, rect.height));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === 'Escape') {
      selectNode('', false);
      onSelectNode?.(null);
    }
    if (e.key === 'Enter' && hoveredId) {
      onNeighborhoodRequest?.(hoveredId);
    }
  };

  const setFixed = (id: string, fixed: boolean) => {
    const node = data.nodes.find((n) => n.id === id);
    if (node) {
      node.fx = fixed ? node.x : undefined;
      node.fy = fixed ? node.y : undefined;
    }
  };
  setNodeFixed.current = setFixed;

  return (
    <div ref={containerRef} className={`relative w-full ${height} overflow-hidden rounded border border-void-line bg-void-raised`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Intelligence graph"
        tabIndex={0}
        className="h-full w-full cursor-grab touch-none outline-none active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          dragRef.current = null;
          setHover(null);
        }}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}