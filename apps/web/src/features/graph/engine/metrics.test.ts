import { boundsOf, degreeOf, largestComponentSize, typeCounts } from './metrics';
import { SMALL_GRAPH } from './__tests__/fixtures';

describe('metrics', () => {
  it('computes bounds over node positions', () => {
    const bounds = boundsOf([
      { x: 1, y: 2 },
      { x: 5, y: 6 },
    ]);
    expect(bounds).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 6 });
  });

  it('returns a safe default for empty data', () => {
    expect(boundsOf([])).toEqual({ minX: -1, minY: -1, maxX: 1, maxY: 1 });
  });

  it('finds the largest component (n4 is disconnected in the fixture)', () => {
    expect(largestComponentSize(SMALL_GRAPH)).toBe(3);
  });

  it('counts types', () => {
    const counts = typeCounts(SMALL_GRAPH);
    expect(counts.get('PERSON')).toBe(2);
  });

  it('computes node degree', () => {
    expect(degreeOf(SMALL_GRAPH, 'n1')).toBe(2);
  });
});