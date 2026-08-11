import { shortestPath, neighborhood } from './pathfinding';
import { SMALL_GRAPH, DISCONNECTED_GRAPH } from './__tests__/fixtures';

describe('shortestPath', () => {
  it('finds a path between connected nodes', () => {
    const result = shortestPath(SMALL_GRAPH, 'n1', 'n3', 4);
    expect(result.found).toBe(true);
    expect(result.nodeIds[0]).toBe('n1');
    expect(result.nodeIds[result.nodeIds.length - 1]).toBe('n3');
    expect(result.hops).toBeGreaterThan(0);
  });

  it('returns found:false for a disconnected pair', () => {
    const result = shortestPath(DISCONNECTED_GRAPH, 'a1', 'b1', 4);
    expect(result.found).toBe(false);
    expect(result.nodeIds).toEqual([]);
  });

  it('returns an immediate path when source === target', () => {
    const result = shortestPath(SMALL_GRAPH, 'n1', 'n1');
    expect(result.found).toBe(true);
    expect(result.hops).toBe(0);
  });
});

describe('neighborhood', () => {
  it('returns center plus direct neighbors at depth 1', () => {
    const result = neighborhood(SMALL_GRAPH, 'n1', 1);
    expect(result.nodeIds).toContain('n1');
    expect(result.nodeIds).toContain('n2');
    expect(result.nodeIds).not.toContain('n4');
  });
});