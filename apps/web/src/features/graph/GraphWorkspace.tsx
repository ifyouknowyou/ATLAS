'use client';
import { useEffect, useMemo, useState } from 'react';
import { Box, Boxes } from 'lucide-react';
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
import { InvestigationGraph as Graph3DViewport } from '@/features/investigation/graph3d/GraphViewport';
import { useGraph } from '@/features/investigation/graph3d/store';

/** Full-page intelligence workspace for the /graph route. */
export function GraphWorkspace() {
  const [view, setView] = useState<'2d' | '3d'>('3d');
  const { data, isLoading, isError } = useGraphBrowse({ limit: 500 });
  const selectedNodeIds = useGraphStore((state) => state.selectedNodeIds);
  const set3dSelection = useGraph((state) => state.setSelected);

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

  // Hydrate shared graph state after the query resolves so search and panels
  // always observe the same dataset, including after a fresh navigation.
  useEffect(() => {
    if (graph) {
      useGraphStore.getState().setData(graph);
    }
  }, [graph]);

  useEffect(() => {
    set3dSelection(selectedNodeIds[0] ?? null);
  }, [selectedNodeIds, set3dSelection]);

  const focus = (id: string) => {
    useGraphStore.setState({ selectedNodeIds: [id] });
  };
  const selectFrom3d = (id: string | null) => {
    useGraphStore.setState({ selectedNodeIds: id ? [id] : [] });
  };

  if (isLoading) return <Spinner label="Loading intelligence graph" />;
  if (isError || !graph) {
    return <EmptyState title="GRAPH UNAVAILABLE" detail="Could not load the intelligence graph." />;
  }
  if (graph.nodes.length === 0) {
    return <EmptyState title="NO ENTITIES" detail="Create entities or open an investigation to populate the graph." />;
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div><div className="mono-label flex items-center gap-2 text-phosphor"><Boxes className="h-3.5 w-3.5" /> ENTITY / RELATIONSHIP INTELLIGENCE</div><h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">KNOWLEDGE GRAPH</h1></div>
        <div className="flex rounded border border-void-line p-0.5" role="group" aria-label="Graph visualization">
          <button type="button" aria-pressed={view === '3d'} onClick={() => setView('3d')} className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[9px] tracking-widest ${view === '3d' ? 'bg-phosphor-dim/15 text-phosphor' : 'text-slate-tech hover:text-slate-100'}`}><Boxes className="h-3 w-3" /> 3D</button>
          <button type="button" aria-pressed={view === '2d'} onClick={() => setView('2d')} className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[9px] tracking-widest ${view === '2d' ? 'bg-phosphor-dim/15 text-phosphor' : 'text-slate-tech hover:text-slate-100'}`}><Box className="h-3 w-3" /> 2D</button>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[250px_1fr_290px]">
      <div className="flex flex-col gap-4">
        <GraphSearch onFocusNode={focus} />
        <FilterPanel />
        <Panel title="ENTITIES" className="flex max-h-[440px] flex-col">
          <ExplorerList entityHref={(id) => `/entities/${id}`} />
        </Panel>
      </div>
      {view === '3d'
        ? <Graph3DViewport nodes={graph.nodes} edges={graph.edges} className="h-[640px]" entityHref={(id) => `/entities/${id}`} onSelectNode={selectFrom3d} />
        : <GraphViewport data={graph} height="h-[640px]" onSelectNode={selectFrom3d} />}
      <DetailsPanel entityHref={(id) => `/entities/${id}`} />
      </div>
    </div>
  );
}