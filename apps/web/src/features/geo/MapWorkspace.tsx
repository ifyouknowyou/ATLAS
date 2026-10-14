'use client';

import { useMemo, useState } from 'react';
import { Crosshair, Layers3, LocateFixed, Map as MapIcon, RotateCcw } from 'lucide-react';
import { useArcs, useLocations } from '@/lib/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

const WORLD = { minLat: -60, maxLat: 80, minLng: -180, maxLng: 180 };

export function MapWorkspace() {
  const locations = useLocations({ limit: 500 });
  const arcs = useArcs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = locations.data?.find((node) => node.id === selectedId) ?? null;

  const projected = useMemo(
    () => (locations.data ?? []).map((node) => ({
      ...node,
      latitude: node.latitude ?? 0,
      longitude: node.longitude ?? 0,
      point: project(node.latitude, node.longitude),
    })),
    [locations.data],
  );

  if (locations.isLoading) return <Spinner label="Surveying geospatial intelligence" />;
  if (locations.isError) return <EmptyState title="MAP OFFLINE" detail="Geospatial data could not be loaded. Retry the route to reconnect." />;
  if (!locations.data?.length) {
    return <EmptyState title="NO GEOLOCATED ENTITIES" detail="Entities with coordinates will appear here when available." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono-label flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-glow" /> GEOINT / LIVE LAYER</div>
          <h1 className="mt-2 font-mono text-2xl tracking-wide text-slate-100">GEOSPATIAL COMMAND</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-tech">Coordinate-aware entities and relationships rendered from the authorized ATLAS data layer.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-tech">
          <span className="text-phosphor">{locations.data.length}</span> LOCATIONS
          <span className="text-void-line">·</span>
          <span className="text-phosphor">{arcs.data?.length ?? 0}</span> ARCS
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="atlas-scene relative min-h-[580px] overflow-hidden rounded-lg border border-void-line bg-[#07111c]">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(79,216,200,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(79,216,200,.12) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute inset-[8%] rounded-[50%] border border-phosphor-faint/30 shadow-[0_0_80px_rgba(79,216,200,.08),inset_0_0_80px_rgba(79,216,200,.06)]" />
          <div className="absolute inset-x-[8%] top-1/2 border-t border-phosphor-faint/20" />
          <div className="absolute left-1/2 inset-y-[8%] border-l border-phosphor-faint/20" />
          <div className="absolute left-4 top-4 flex items-center gap-2"><Crosshair className="h-3.5 w-3.5 text-phosphor" /><span className="mono-label">WORLD / COORDINATE GRID</span></div>
          <div className="absolute right-4 top-4 flex gap-2">
            <button type="button" className="tech-button p-2" aria-label="Reset map view" title="Reset map view"><RotateCcw className="h-3.5 w-3.5" /></button>
            <button type="button" className="tech-button p-2" aria-label="Center on locations" title="Center on locations"><LocateFixed className="h-3.5 w-3.5" /></button>
          </div>
          <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full" role="img" aria-label="Geospatial entity map">
            {arcs.data?.map((arc, index) => {
              const source = project(arc.source.latitude, arc.source.longitude);
              const target = project(arc.target.latitude, arc.target.longitude);
              return <line key={`${arc.kind}-${index}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#4fd8c8" strokeOpacity=".38" strokeDasharray="5 7" />;
            })}
            {projected.map((node) => (
              <g key={node.id} className="cursor-pointer" onClick={() => setSelectedId(node.id)}>
                <circle cx={node.point.x} cy={node.point.y} r={selectedId === node.id ? 9 : 5} fill={selectedId === node.id ? '#e8b64c' : '#4fd8c8'} fillOpacity=".9" />
                <circle cx={node.point.x} cy={node.point.y} r="13" fill="none" stroke="#4fd8c8" strokeOpacity=".18" />
                <title>{node.name} · {node.type}</title>
              </g>
            ))}
          </svg>
          <div className="absolute bottom-4 left-4 flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-slate-tech/70"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-phosphor" /> ENTITY</span><span className="flex items-center gap-1.5"><span className="h-px w-4 bg-phosphor" /> RELATIONSHIP ARC</span></div>
        </div>

        <aside className="panel flex flex-col p-4">
          <div className="flex items-center justify-between"><div className="panel-title flex items-center gap-2"><Layers3 className="h-3.5 w-3.5 text-phosphor" /> LOCATION INDEX</div><MapIcon className="h-4 w-4 text-slate-tech/60" /></div>
          <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {projected.map((node) => <button key={node.id} type="button" onClick={() => setSelectedId(node.id)} className={cn('w-full border-l-2 px-3 py-2 text-left transition-colors', selectedId === node.id ? 'border-phosphor bg-phosphor-dim/10' : 'border-transparent hover:border-phosphor-faint hover:bg-void-raised')}><div className="truncate font-mono text-xs text-slate-100">{node.name}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-tech">{node.type} · {node.latitude.toFixed(2)}, {node.longitude.toFixed(2)}</div></button>)}
          </div>
          {selected && <div className="mt-4 border-t border-void-line pt-3"><div className="mono-label text-phosphor">FOCUS ENTITY</div><div className="mt-1 font-mono text-sm text-slate-100">{selected.name}</div><div className="mt-1 text-xs text-slate-tech">{selected.tags?.join(' · ') || 'No tags attached'}</div></div>}
        </aside>
      </section>
    </div>
  );
}

function project(latitude: number | null | undefined, longitude: number | null | undefined) {
  const lat = latitude ?? 0;
  const lng = longitude ?? 0;
  return { x: ((lng - WORLD.minLng) / (WORLD.maxLng - WORLD.minLng)) * 1000, y: ((WORLD.maxLat - lat) / (WORLD.maxLat - WORLD.minLat)) * 560 };
}
