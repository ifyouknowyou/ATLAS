'use client';
import { useMemo } from 'react';
import { useGraphBrowse } from '@/lib/queries';
import { useGraphStore } from './store';
import type { GraphNode, GraphEdge } from './types';
import { GraphViewport } from './components/GraphViewport';
import { GraphSearch } from './components/GraphSearch';
import { FilterPanel } from './components/FilterPanel';
import { DetailsPanel } from './components/DetailsPanel';
import { ExplorerList } from './components/ExplorerList';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

/** Full-page intelligence workspace for the /graph route. */
export function GraphWorkspace() {
  const { data, isLoading, isError } = useGraphBrowse({ limit: 500 });

  const graph = useMemo(() => {
    if (!data) return null;
    const nodes: GraphNode[] = data.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: String(n.type),
      confidence: n.confidence,
      latitude: n.latitude,
      longitude: n.longitude,
      investigationId: n.investigationId,
      tags: n.tags,
      x: 0,
      y: 0,
    }));
    const edges: GraphEdge[] = data.edges.map((e) => ({
      id: e.id,
      sourceId: e.sourceId,
      targetId: e.targetId,
      kind: String(e.kind),
      confidence: e.confidence,
    }));
    return { nodes, edges };
  }, [data]);

  // Seed the engine store once data arrives so non-canvas panels share it.
  useMemo(() => {
    if (graph && graph.nodes.length > 0) {
      useGraphStore.setState({ data: graph });
    }
  }, [graph]);

  const focus = (id: string) => {
    useGraphStore.setState({ selectedNodeIds: [id] });
  };

  if (isLoading) return <Spinner label="Loading intelligence graph" />;
  if (isError || !graph) {
    return <EmptyState title="GRAPH UNAVAILABLE" detail="Could not load the intelligence graph." />;
  }
  if (graph.nodes.length === 0) {
    return <EmptyState title="NO ENTITIES" detail="Create entities or open an investigation to populate the graph." />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[250px_1fr_290px]">
      <div className="flex flex-col gap-4">
        <GraphSearch onFocusNode={focus} />
        <FilterPanel />
        <Panel title="ENTITIES" className="flex max-h-[440px] flex-col">
          <ExplorerList entityHref={(id) => `/entities/${id}`} />
        </Panel>
      </div>
      <GraphViewport data={graph} height="h-[640px]" />
      <DetailsPanel entityHref={(id) => `/entities/${id}`} />
    </div>
  );
}