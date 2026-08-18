'use client';

export default function IntelligenceAnalytics() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-gray-400">Graph and anomaly analytics.</p>
        </div>
        <button className="btn-primary">Run analysis</button>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <input
          className=" rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
          placeholder="Investigation ID"
        />
        <select className=" rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
          <option>Centrality</option>
          <option>Community</option>
          <option>Path analysis</option>
          <option>Change detection</option>
        </select>
        <div />
      </section>

      <section className="surface p-6">
        <div className="text-xs tracking-wider text-gray-400">Recent analyses</div>
        <div className="mt-4 space-y-2 text-sm">
          <AnalysisRow type="Centrality" investigation="INV-402" status="completed" time="3h ago" />
          <AnalysisRow type="Community detection" investigation="INV-402" status="completed" time="1d ago" />
          <AnalysisRow type="Path analysis" investigation="INV-419" status="failed" time="2d ago" />
        </div>
      </section>
    </main>
  );
}

function AnalysisRow({ type, investigation, status, time }: { type: string; investigation: string; status: 'completed' | 'failed'; time: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-gray-200">
        {type}
      </span>
      <span className="text-xs text-gray-500">{investigation}</span>
      <span className={`text-[10px] tracking-wider ${status === 'completed' ? 'text-teal' : 'text-red'}`}>{status.toUpperCase()}</span>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}