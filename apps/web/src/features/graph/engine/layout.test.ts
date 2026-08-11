import { computeLayout } from './layout';
import { SMALL_GRAPH, DISCONNECTED_GRAPH } from './__tests__/fixtures';

describe('computeLayout', () => {
  it('produces a position for every node in every layout', () => {
    for (const layout of ['force', 'radial', 'hierarchical', 'grid'] as const) {
      const positions = computeLayout(layout, SMALL_GRAPH, { width: 800, height: 600 });
      for (const node of SMALL_GRAPH.nodes) {
        expect(positions.get(node.id)).toBeDefined();
      }
    }
  });

  it('is deterministic for the force layout', () => {
    const a = computeLayout('force', SMALL_GRAPH, { width: 800, height: 600 });
    const b = computeLayout('force', SMALL_GRAPH, { width: 800, height: 600 });
    for (const [id, p] of a) {
      expect(p.x).toBeCloseTo(b.get(id)!.x, 4);
      expect(p.y).toBeCloseTo(b.get(id)!.y, 4);
    }
  });

  it('grid layout uses whole output bounds', () => {
    const positions = computeLayout('grid', DISCONNECTED_GRAPH, { width: 400, height: 300 });
    const xs = [...positions.values()].map((p) => p.x);
    expect(Math.max(...xs)).toBeLessThanOrEqual(400);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
  });
});