'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { isWebGLAvailable } from './webgl';
import { GlobeFallback } from './components/GlobeFallback';
import { GlobeHud } from './components/GlobeHud';
import { useArcs, useLocations } from '@/lib/queries';

const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), {
  ssr: false,
  loading: () => <GlobeLoader />,
});

/**
 * Public globe entry point. Decides between the live 3D scene and a graceful
 * 2D fallback, and isolates the Three.js bundle behind a dynamic import.
 */
export function GlobeViewport({ className }: { className?: string }) {
  const [supported] = useState(() => isWebGLAvailable());
  const locations = useLocations({ limit: 500 });
  const arcs = useArcs();
  const nodes = (locations.data ?? []).filter(
    (node) => node.latitude != null && node.longitude != null,
  ).map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    latitude: node.latitude as number,
    longitude: node.longitude as number,
  }));
  const liveArcs = (arcs.data ?? []).flatMap((arc, index) => {
    const source = nodes.find((node) => node.latitude === arc.source.latitude && node.longitude === arc.source.longitude);
    const target = nodes.find((node) => node.latitude === arc.target.latitude && node.longitude === arc.target.longitude);
    return source && target ? [{ source: source.id, target: target.id, key: `${source.id}-${target.id}-${index}` }] : [];
  });

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-lg border border-void-line bg-radial-void',
        className,
      )}
    >
      <div className="absolute inset-0">
        {supported ? <GlobeCanvas nodes={nodes} arcs={liveArcs} /> : <GlobeFallback />}
      </div>
      {supported && <GlobeHud nodes={nodes} />}
    </div>
  );
}

function GlobeLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-void-line border-t-phosphor" />
        <span className="mono-label">ORBITING GLOBE</span>
      </div>
    </div>
  );
}