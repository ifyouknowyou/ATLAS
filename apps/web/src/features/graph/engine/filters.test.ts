import {
  applyFilters,
  connectedComponents,
  emptyFilter,
  filterByGeoRegion,
  isFiltering,
} from './filters';
import { GEO_GRAPH, SMALL_GRAPH } from './__tests__/fixtures';

describe('applyFilters', () => {
  it('returns the same data for an empty filter', () => {
    const result = applyFilters(SMALL_GRAPH, emptyFilter());
    expect(result.nodes).toHaveLength(4);
    expect(result.edges).toHaveLength(3);
  });

  it('filters by entity type and drops orphaned edges', () => {
    const filter = emptyFilter();
    filter.entityTypes.add('PERSON');
    const result = applyFilters(SMALL_GRAPH, filter);
    expect(result.nodes.every((n) => n.type === 'PERSON')).toBe(true);
    expect(result.edges).toHaveLength(0);
  });

  it('reports when filtering is active', () => {
    const filter = emptyFilter();
    expect(isFiltering(filter)).toBe(false);
    filter.entityTypes.add('PERSON');
    expect(isFiltering(filter)).toBe(true);
  });
});

describe('connectedComponents', () => {
  it('separates components (n4 is isolated in the fixture)', () => {
    const components = connectedComponents(SMALL_GRAPH);
    expect(components).toHaveLength(2);
    const largest = components.sort((a, b) => b.length - a.length)[0];
    expect(largest).toHaveLength(3);
    expect(largest).toContain('n1');
  });
});

describe('filterByGeoRegion', () => {
  it('keeps only nodes inside the region', () => {
    const result = filterByGeoRegion(GEO_GRAPH, {
      minLat: 40,
      maxLat: 60,
      minLng: -10,
      maxLng: 30,
    });
    expect(result.nodes.map((n) => n.id).sort()).toEqual(['g1', 'g2']);
  });
});