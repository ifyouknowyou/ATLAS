import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { GraphData } from '../types';

interface SimNode extends SimulationNodeDatum {
  id: string;
  confidence: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  id: string;
}

export interface SimulationOptions {
  /** Deterministic when true: fixed iterations, no live ticking. */
  deterministic?: boolean;
  iterations?: number;
  width?: number;
  height?: number;
  linkDistance?: number;
  chargeStrength?: number;
}

/**
 * Force-directed simulation (Phase 3 §7).
 *
 * d3-force's internal RNG is not seedable, so determinism is achieved by
 * seeding initial positions and running a fixed number of iterations. For
 * live interactive use, `step()` is driven from rAF outside this module.
 */
export class ForceSimulation {
  private simulation: Simulation<SimNode, SimLink> | null = null;
  private simNodes: SimNode[] = [];
  private simLinks: SimLink[] = [];
  private readonly options: Required<SimulationOptions>;

  constructor(options: SimulationOptions = {}) {
    this.options = {
      deterministic: true,
      iterations: 120,
      width: 800,
      height: 600,
      linkDistance: 60,
      chargeStrength: -220,
      ...options,
    };
  }

  setData(data: GraphData): void {
    this.simNodes = data.nodes.map((n) => ({
      id: n.id,
      confidence: n.confidence,
      x: n.x,
      y: n.y,
      fx: n.fx ?? undefined,
      fy: n.fy ?? undefined,
    }));
    this.simLinks = data.edges
      .map((e) => {
        const source = this.simNodes.find((n) => n.id === e.sourceId);
        const target = this.simNodes.find((n) => n.id === e.targetId);
        if (!source || !target) return null;
        return { id: e.id, source, target } as SimLink;
      })
      .filter((l): l is SimLink => l !== null);
  }

  start(): void {
    if (this.simulation) this.simulation.stop();
    const { width, height, linkDistance, chargeStrength } = this.options;
    this.simulation = forceSimulation<SimNode>(this.simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(this.simLinks)
          .id((d) => d.id)
          .distance(linkDistance),
      )
      .force('charge', forceManyBody<SimNode>().strength(chargeStrength))
      .force('center', forceCenter<SimNode>(width / 2, height / 2))
      .force('collide', forceCollide<SimNode>(14).radius((d) => 6 + d.confidence / 25));
  }

  /** Run a fixed number of iterations, then stop (deterministic mode). */
  run(): void {
    this.start();
    for (let i = 0; i < this.options.iterations; i += 1) {
      this.simulation?.tick();
    }
    this.simulation?.stop();
  }

  /** Advance one tick (interactive mode). */
  step(): void {
    this.simulation?.tick();
  }

  pause(): void {
    this.simulation?.stop();
  }

  resume(): void {
    this.simulation?.alpha(0.3).restart();
  }

  setNodeFixed(id: string, fixed: boolean): void {
    const node = this.simNodes.find((n) => n.id === id);
    if (!node) return;
    if (fixed) {
      node.fx = node.x;
      node.fy = node.y;
    } else {
      node.fx = undefined;
      node.fy = undefined;
    }
  }

  positions(): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    for (const node of this.simNodes) {
      positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
    }
    return positions;
  }

  dispose(): void {
    this.simulation?.stop();
    this.simulation = null;
  }
}

/** Convenience: deterministic positions for a graph. */
export function computeForcePositions(
  data: GraphData,
  options?: SimulationOptions,
): Map<string, { x: number; y: number }> {
  const sim = new ForceSimulation(options);
  sim.setData(data);
  sim.run();
  const positions = sim.positions();
  sim.dispose();
  return positions;
}