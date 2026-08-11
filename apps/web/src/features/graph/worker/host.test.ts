import { createSimulationHost } from './host';

describe('createSimulationHost', () => {
  it('falls back to the main thread when Worker is unavailable', () => {
    const original = globalThis.Worker;
    (globalThis as { Worker?: unknown }).Worker = undefined;
    const host = createSimulationHost({});
    expect(host).toBeDefined();
    expect(() => {
      host.setData({ nodes: [], edges: [] });
      host.setLayout('grid', 800, 600);
      host.pause();
      host.resume();
      host.dispose();
    }).not.toThrow();
    (globalThis as { Worker?: unknown }).Worker = original;
  });

  it('uses the worker path when Worker exists', () => {
    const original = globalThis.Worker;
    class FakeWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      postMessage = jest.fn();
      terminate = jest.fn();
    }
    (globalThis as { Worker?: unknown }).Worker = FakeWorker as unknown as typeof Worker;
    const host = createSimulationHost({});
    expect(host).toBeDefined();
    host.setData({ nodes: [], edges: [] });
    host.dispose();
    (globalThis as { Worker?: unknown }).Worker = original;
  });
});