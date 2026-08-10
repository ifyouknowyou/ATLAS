'use client';

/**
 * Graceful degradation when WebGL is unavailable: a readable 2D signal-map
 * placeholder instead of a blank canvas. No 3D bundle is loaded in this mode.
 */
export function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-void-line">
          <span className="animate-pulse-slow text-2xl text-phosphor">◎</span>
        </div>
        <span className="mono-label">WEBGL UNAVAILABLE</span>
        <p className="text-sm text-slate-tech">
          The 3D intelligence space requires hardware-accelerated WebGL.
          Enable hardware acceleration or use a modern browser to activate the
          live globe.
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-tech/60">
          Fallback mode — core platform is unaffected
        </span>
      </div>
    </div>
  );
}