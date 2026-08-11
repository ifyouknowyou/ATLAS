/// <reference lib="webworker" />
import type { GraphData, GraphLayout } from '../types';
import { ForceSimulation } from '../engine/simulation';
import { computeLayout } from '../engine/layout';

/**
 * Web Worker running the force simulation off the main thread (§8).
 * The worker is self-contained: it only imports the pure engine modules.
 */

type WorkerRequest =
  | { type: 'init'; layout: GraphLayout; width: number; height: number }
  | { type: 'setData'; data: GraphData }
  | { type: 'setLayout'; layout: GraphLayout; width: number; height: number }
  | { type: 'setNodeFixed'; id: string; fixed: boolean }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'step' }
  | { type: 'run'; iterations?: number }
  | { type: 'dispose' };

let sim: ForceSimulation | null = null;
let layout: GraphLayout = 'force';
let width = 800;
let height = 600;
let data: GraphData | null = null;
let rafId = -1;

function post(kind: 'positions' | 'status' | 'done', payload?: unknown): void {
  const transfer: MessagePort | undefined = undefined;
  (self as unknown as { postMessage: (m: unknown, t?: unknown) => void }).postMessage(
    { kind, payload },
    transfer,
  );
}

function restartSimulation(): void {
  sim?.dispose();
  if (!data) return;
  if (layout === 'force') {
    sim = new ForceSimulation({ width, height, deterministic: false });
    sim.setData(data);
    sim.start();
  } else {
    const positions = computeLayout(layout, data, { width, height });
    sim = new ForceSimulation({ width, height, deterministic: false });
    sim.setData({ ...data, nodes: data.nodes.map((n) => ({ ...n, ...(positions.get(n.id) ?? {}) })) });
    sim.start();
    for (let i = 0; i < 5; i += 1) sim.step();
    sim.pause();
    emitPositions();
  }
}

function emitPositions(): void {
  if (!sim) return;
  const positions = sim.positions();
  post('positions', {
    nodes: [...positions.entries()].map(([id, p]) => ({ id, x: p.x, y: p.y })),
  });
}

const tick = (): void => {
  rafId = -1;
  if (!sim) return;
  sim.step();
  emitPositions();
  rafId = (self as unknown as { requestAnimationFrame: (cb: () => void) => number }).requestAnimationFrame(tick);
};

(self as unknown as { onmessage: (e: MessageEvent) => void }).onmessage = (
  event: MessageEvent,
): void => {
  const request = event.data as WorkerRequest;
  switch (request.type) {
    case 'init':
      layout = request.layout;
      width = request.width;
      height = request.height;
      restartSimulation();
      break;
    case 'setData':
      data = request.data;
      restartSimulation();
      if (layout === 'force') {
        sim?.run();
        emitPositions();
        post('done');
      } else {
        emitPositions();
        post('done');
      }
      break;
    case 'setLayout':
      layout = request.layout;
      width = request.width;
      height = request.height;
      restartSimulation();
      break;
    case 'setNodeFixed':
      sim?.setNodeFixed(request.id, request.fixed);
      break;
    case 'pause':
      if (rafId !== -1) {
        (self as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame(rafId);
        rafId = -1;
      }
      sim?.pause();
      break;
    case 'resume':
      sim?.resume();
      if (rafId === -1) {
        rafId = (self as unknown as { requestAnimationFrame: (cb: () => void) => number }).requestAnimationFrame(tick);
      }
      break;
    case 'step':
      sim?.step();
      emitPositions();
      break;
    case 'run':
      sim?.run();
      emitPositions();
      post('done');
      break;
    case 'dispose':
      if (rafId !== -1) {
        (self as unknown as { cancelAnimationFrame: (id: number) => void }).cancelAnimationFrame(rafId);
        rafId = -1;
      }
      sim?.dispose();
      sim = null;
      break;
    default:
      post('status', { running: Boolean(sim) });
  }
};

// Default export for module workers.
export default undefined;