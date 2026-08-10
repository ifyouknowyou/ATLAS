'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { isWebGLAvailable } from './webgl';
import { GlobeFallback } from './components/GlobeFallback';
import { GlobeHud } from './components/GlobeHud';

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

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-lg border border-void-line bg-radial-void',
        className,
      )}
    >
      <div className="absolute inset-0">
        {supported ? <GlobeCanvas /> : <GlobeFallback />}
      </div>
      {supported && <GlobeHud />}
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