'use client';

export default function IntelligenceAlerts() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Alerts</h1>
          <p className="text-sm text-gray-400">Active alerts that may require triage.</p>
        </div>
      </header>

      <section className="surface p-6">
        <div className="space-y-3">
          <AlertRow title="Asset watchlist match" severity="HIGH" time="2h" />
          <AlertRow title="Network anomaly detected" severity="MEDIUM" time="5h" />
          <AlertRow title="New relationship suggested" severity="LOW" time="8h" />
        </div>
      </section>
    </main>
  );
}

function AlertRow({ title, severity, time }: { title: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; time: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-gray-500">{time} ago</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full border px-3 py-1 text-[10px] tracking-wider" data-severity={severity.toLowerCase()}>
          {severity}
        </span>
        <button className="btn-ghost">Acknowledge</button>
      </div>
    </div>
  );
}