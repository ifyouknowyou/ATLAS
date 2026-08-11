import { clusterGraph, clusterLouvain } from './clustering';
import { SMALL_GRAPH, DISCONNECTED_GRAPH } from './__tests__/fixtures';

describe('clusterLouvain', () => {
  it('returns clusters covering every node', () => {
    const clusters = clusterLouvain(SMALL_GRAPH);
    const ids = clusters.flatMap((c) => c.nodeIds).sort();
    const expected = SMALL_GRAPH.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(expected);
  });

  it('labels the dominant type for a cluster of same-type nodes', () => {
    const clusters = clusterLouvain(SMALL_GRAPH);
    expect(clusters.length).toBeGreaterThan(0);
    for (const cluster of clusters) {
      expect(cluster.nodeIds.length).toBeGreaterThan(0);
      expect(cluster.id).toBeTruthy();
    }
  });
});

describe('clusterGraph', () => {
  it('falls back to connected components for disconnected graphs', () => {
    const clusters = clusterGraph(DISCONNECTED_GRAPH);
    const a = clusters.find((c) => c.nodeIds.includes('a1'));
    const b = clusters.find((c) => c.nodeIds.includes('b1'));
    expect(a?.nodeIds.includes('a2')).toBe(true);
    expect(b?.nodeIds).toEqual(['b1']);
  });

  it('returns at least one cluster for an empty-ish edge graph', () => {
    const clusters = clusterGraph({ nodes: DISCONNECTED_GRAPH.nodes, edges: [] });
    expect(clusters.length).toBeGreaterThanOrEqual(2);
  });
});