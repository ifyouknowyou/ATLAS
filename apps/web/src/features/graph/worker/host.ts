import type { GraphData, GraphLayout, EngineCallbacks } from '../types';
import { ForceSimulation } from '../engine/simulation';
import { computeLayout } from '../engine/layout';

export interface SimulationHost {
  setData(data: GraphData): void;
  setLayout(layout: GraphLayout, width: number, height: number): void;
  setNodeFixed(id: string, fixed: boolean): void;
  pause(): void;
  resume(): void;
  step(): void;
  run(): void;
  dispose(): void;
}

type WorkerModule = Worker & { onmessage: ((e: MessageEvent) => void) | null };

/**
 * Creates a simulation host that runs the d3-force layout in a Web Worker,
 * falling back to the main thread when workers are unavailable (§8).
 * SSR-safe: call only inside useEffect (client).
 */
export function createSimulationHost(callbacks: EngineCallbacks): SimulationHost {
  if (typeof Worker !== 'undefined') {
    try {
      // Webpack 5 bundles string-form worker URLs; the literal is also safe for
      // jest's CJS transform (import.meta would not survive compilation).
      const worker = new Worker('./graph.worker.ts') as WorkerModule;
      let positionsHandler: ((nodes: Array<{ id: string; x: number; y: number }>) => void) | null = null;

      worker.onmessage = (event: MessageEvent) => {
        const message = event.data as { kind: string; payload?: unknown };
        if (message.kind === 'positions' && message.payload) {
          positionsHandler?.(
            (message.payload as { nodes: Array<{ id: string; x: number; y: number }> }).nodes,
          );
        }
        if (message.kind === 'done') {
          callbacks.onPositions?.([]);
          callbacks.onStatus?.({ running: false, tick: 0, iteration: 0 });
        }
      };

      const wrapper: SimulationHost = {
        setData(data: GraphData) {
          positionsHandler = (nodes) => callbacks.onPositions?.(nodes);
          worker.postMessage({ type: 'setData', data });
        },
        setLayout(layout: GraphLayout, w: number, h: number) {
          worker.postMessage({ type: 'setLayout', layout, width: w, height: h });
        },
        setNodeFixed(id: string, fixed: boolean) {
          worker.postMessage({ type: 'setNodeFixed', id, fixed });
        },
        pause() {
          worker.postMessage({ type: 'pause' });
        },
        resume() {
          worker.postMessage({ type: 'resume' });
        },
        step() {
          worker.postMessage({ type: 'step' });
        },
        run() {
          worker.postMessage({ type: 'run' });
        },
        dispose() {
          worker.postMessage({ type: 'dispose' });
          worker.terminate();
        },
      };
      wrapper.setData = wrapper.setData.bind(wrapper);
      return wrapper;
    } catch {
      // Worker URL failed to resolve (e.g. some bundlers) — fall through.
    }
  }
  return createMainThreadHost(callbacks);
}

/** Main-thread fallback — identical API, uses the same pure engine. */
function createMainThreadHost(callbacks: EngineCallbacks): SimulationHost {
  let sim: ForceSimulation | null = null;
  let layout: GraphLayout = 'force';
  let width = 800;
  let height = 600;
  let data: GraphData | null = null;
  let rafId = -1;
  let running = false;

  function restart(): void {
    sim?.dispose();
    if (!data) return;
    if (layout === 'force') {
      sim = new ForceSimulation({ width, height, deterministic: false });
      sim.setData(data);
      sim.start();
    } else {
      const positions = computeLayout(layout, data, { width, height });
      sim = new ForceSimulation({ width, height, deterministic: false });
      sim.setData({
        ...data,
        nodes: data.nodes.map((n) => ({ ...n, ...(positions.get(n.id) ?? {}) })),
      });
      sim.start();
      for (let i = 0; i < 5; i += 1) sim.step();
      sim.pause();
      emitPositions();
      callbacks.onStatus?.({ running: false, tick: 0, iteration: 0 });
    }
  }

  function emitPositions(): void {
    if (!sim) return;
    const positions = sim.positions();
    callbacks.onPositions?.(
      [...positions.entries()].map(([id, p]) => ({ id, x: p.x, y: p.y })),
    );
  }

  function tick(): void {
    rafId = -1;
    if (!sim || !running) return;
    sim.step();
    emitPositions();
    callbacks.onStatus?.({ running: true, tick: rafCounter++ , iteration: 0 });
    rafId = requestAnimationFrame(tick);
  }

  let rafCounter = 0;

  return {
    setData(next: GraphData) {
      data = next;
      restart();
    },
    setLayout(next: GraphLayout, w: number, h: number) {
      layout = next;
      width = w;
      height = h;
      restart();
    },
    setNodeFixed(id: string, fixed: boolean) {
      sim?.setNodeFixed(id, fixed);
    },
    pause() {
      running = false;
      if (rafId !== -1) {
        cancelAnimationFrame(rafId);
        rafId = -1;
      }
      sim?.pause();
      callbacks.onStatus?.({ running: false, tick: rafCounter, iteration: 0 });
    },
    resume() {
      running = true;
      sim?.resume();
      if (rafId === -1) rafId = requestAnimationFrame(tick);
      callbacks.onStatus?.({ running: true, tick: rafCounter, iteration: 0 });
    },
    step() {
      sim?.step();
      emitPositions();
    },
    run() {
      if (layout === 'force') {
        sim?.run();
        emitPositions();
      }
      callbacks.onStatus?.({ running: false, tick: rafCounter, iteration: 0 });
      callbacks.onPositions?.([]);
    },
    dispose() {
      if (rafId !== -1) cancelAnimationFrame(rafId);
      rafId = -1;
      sim?.dispose();
      sim = null;
    },
  };
}