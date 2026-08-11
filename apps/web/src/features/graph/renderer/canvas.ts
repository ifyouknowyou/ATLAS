import type { GraphData, GraphNode, Viewport, Cluster } from '../types';
import { nodeColor, nodeSize, edgeWidth } from '../palette';


export interface RenderOptions {
  selectedIds?: Set<string>;
  hoveredId?: string | null;
  pathIds?: Set<string>;
  clusters?: Cluster[];
  collapsedClusterIds?: Set<string>;
  showLabels?: boolean;
  labelThreshold?: number; // zoom scale at which labels appear
  maxNodes?: number; // >0: LOD — skip labels/shadows for large graphs
}

const LABEL_THRESHOLD = 0.9;
const HOVER_GLOW = 'rgba(79,216,200,0.35)';
const SELECT_STROKE = '#e8b64c';
const PATH_STROKE = '#4fd8c8';

/**
 * Canvas 2D renderer. Draws the graph in screen space given a world viewport.
 * Progressive: heavy effects (labels, shadows, gradients) are LOD-gated.
 */
export class GraphRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    data: GraphData,
    viewport: Viewport,
    opts: RenderOptions = {},
  ): void {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(viewport.x * viewport.scale, viewport.y * viewport.scale);
    ctx.scale(viewport.scale, viewport.scale);

    const large = data.nodes.length > (opts.maxNodes ?? 800);
    const showLabels = (opts.showLabels ?? true) && !large && viewport.scale >= (opts.labelThreshold ?? LABEL_THRESHOLD);
    this.drawEdges(ctx, data, opts);
    this.drawClusters(ctx, data, opts);
    this.drawNodes(ctx, data, opts, showLabels);
    ctx.restore();
  }

  private drawEdges(
    ctx: CanvasRenderingContext2D,
    data: GraphData,
    opts: RenderOptions,
  ): void {
    for (const edge of data.edges) {
      const source = data.nodes.find((n) => n.id === edge.sourceId);
      const target = data.nodes.find((n) => n.id === edge.targetId);
      if (!source || !target) continue;
      const onPath = opts.pathIds?.has(edge.id) ?? false;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = onPath ? PATH_STROKE : '#22384f';
      ctx.lineWidth = edgeWidth(edge.confidence) / (1 + data.nodes.length / 1200);
      ctx.globalAlpha = onPath ? 0.95 : 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private drawClusters(
    ctx: CanvasRenderingContext2D,
    data: GraphData,
    opts: RenderOptions,
  ): void {
    const collapsed = opts.collapsedClusterIds;
    if (!collapsed || collapsed.size === 0) return;
    const members = data.nodes.filter((n) => collapsed.has(n.id));
    if (members.length === 0) return;
    const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(79,216,200,0.10)';
    ctx.fill();
    ctx.strokeStyle = '#4fd8c8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4fd8c8';
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${members.length}`, cx, cy + 4);
  }

  private drawNodes(
    ctx: CanvasRenderingContext2D,
    data: GraphData,
    opts: RenderOptions,
    showLabels: boolean,
  ): void {
    for (const node of data.nodes) {
      const isSelected = opts.selectedIds?.has(node.id) ?? false;
      const isHovered = opts.hoveredId === node.id;
      const onPath = opts.pathIds?.has(node.id) ?? false;
      const r = nodeSize(node.confidence);
      const color = nodeColor(String(node.type));

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = HOVER_GLOW;
        ctx.fill();
      }
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = SELECT_STROKE;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (onPath) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = PATH_STROKE;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (showLabels) {
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#a9c1d8';
        ctx.fillText(String(node.name).slice(0, 24), node.x + r + 4, node.y + 3);
      }
    }
  }
}

export function createGraphRenderer(): GraphRenderer {
  return new GraphRenderer();
}

export type { GraphNode, Viewport };