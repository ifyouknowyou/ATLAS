import { useGraphStore } from './store';

beforeEach(() => useGraphStore.getState().reset());

describe('useGraphStore', () => {
  it('applies deltas without a full rebuild', () => {
    useGraphStore.setState({
      data: {
        nodes: [
          { id: 'a', name: 'A', type: 'PERSON', confidence: 50, x: 0, y: 0 },
          { id: 'b', name: 'B', type: 'ORGANIZATION', confidence: 50, x: 0, y: 0 },
        ],
        edges: [{ id: 'e1', sourceId: 'a', targetId: 'b', kind: 'RELATED_TO', confidence: 50 }],
      },
    });
    useGraphStore.getState().applyDelta({
      addedNodes: [{ id: 'c', name: 'C', type: 'DOMAIN', confidence: 10, x: 0, y: 0 }],
      removedNodeIds: ['b'],
      removedEdgeIds: ['e1'],
      addedEdges: [{ id: 'e2', sourceId: 'a', targetId: 'c', kind: 'CONTROLS', confidence: 60 }],
    });
    const { data } = useGraphStore.getState();
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'c']);
    expect(data.edges.map((e) => e.id)).toEqual(['e2']);
  });

  it('selects and toggles a node', () => {
    useGraphStore.getState().selectNode('a');
    expect(useGraphStore.getState().selectedNodeIds).toEqual(['a']);
    useGraphStore.getState().selectNode('a');
    expect(useGraphStore.getState().selectedNodeIds).toEqual([]);
  });

  it('toggles entity-type filters', () => {
    useGraphStore.getState().toggleFilter('entityTypes', 'PERSON');
    expect([...useGraphStore.getState().filterState.entityTypes]).toEqual(['PERSON']);
    useGraphStore.getState().toggleFilter('entityTypes', 'PERSON');
    expect(useGraphStore.getState().filterState.entityTypes.size).toBe(0);
  });

  it('isolates a node to its direct neighborhood', () => {
    useGraphStore.setState({
      data: {
        nodes: [
          { id: 'a', name: 'A', type: 'PERSON', confidence: 50, x: 0, y: 0 },
          { id: 'b', name: 'B', type: 'PERSON', confidence: 50, x: 0, y: 0 },
          { id: 'c', name: 'C', type: 'PERSON', confidence: 50, x: 0, y: 0 },
        ],
        edges: [
          { id: 'e1', sourceId: 'a', targetId: 'b', kind: 'RELATED_TO', confidence: 50 },
          { id: 'e2', sourceId: 'b', targetId: 'c', kind: 'RELATED_TO', confidence: 50 },
        ],
      },
    });
    useGraphStore.getState().isolateNode('a');
    const { data } = useGraphStore.getState();
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b']);
    expect(data.edges).toHaveLength(1);
  });
});