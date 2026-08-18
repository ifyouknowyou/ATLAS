'use client';

export default function IntelligenceWorkflows() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Workflows</h1>
          <p className="text-sm text-gray-400">Human-in-the-loop automations.</p>
        </div>
        <button className="btn-primary">New workflow</button>
      </header>

      <section className="grid gap-4">
        <div className="surface p-6">
          <div className="mb-2 text-sm font-semibold text-white">Entity triage pipeline</div>
          <div className="text-xs text-gray-400">Auto-route entities above confidence 0.92 for analyst review.</div>
          <div className="mt-3 flex gap-2">
            <button className="btn-ghost">View</button>
            <button className="btn-ghost">History</button>
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <div className="text-xs tracking-wider text-gray-400">Recent runs</div>
        <div className="mt-4 space-y-2 text-sm">
          <RunRow name="Entity triage pipeline" status="passed" time="12m" />
          <RunRow name="Watchlist enrichment" status="passed" time="1h" />
          <RunRow name="Report evidence link" status="failed" time="3h" />
        </div>
      </section>
    </main>
  );
}

function RunRow({ name, status, time }: { name: string; status: 'passed' | 'failed'; time: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-gray-200">{name}</span>
      <span className={`text-[10px] tracking-wider ${status === 'passed' ? 'text-teal' : 'text-red'}`}>{status.toUpperCase()}</span>
      <span className="text-xs text-gray-500">{time} ago</span>
    </div>
  );
}