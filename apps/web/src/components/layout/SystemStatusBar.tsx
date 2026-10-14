'use client';

import { Activity, Database, Radio, ShieldCheck } from 'lucide-react';

const statuses = [
  { label: 'API', value: 'OPERATIONAL', icon: Activity, tone: 'text-phosphor' },
  { label: 'DATA', value: 'SYNCHRONIZED', icon: Database, tone: 'text-phosphor' },
  { label: 'REALTIME', value: 'CONNECTED', icon: Radio, tone: 'text-sky-300' },
  { label: 'SECURITY', value: 'ENFORCED', icon: ShieldCheck, tone: 'text-amber-signal' },
] as const;

export function SystemStatusBar() {
  return (
    <footer className="atlas-status-bar flex min-h-8 shrink-0 items-center justify-between gap-3 overflow-x-auto border-t border-void-line bg-void-raised/75 px-4 py-1.5 backdrop-blur-xl">
      <div className="flex min-w-max items-center gap-4">
        {statuses.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-tech/70">
            <Icon className={`h-3 w-3 ${tone}`} aria-hidden="true" />
            <span>{label}</span>
            <span className={tone}>{value}</span>
          </div>
        ))}
      </div>
      <div className="hidden min-w-max items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-tech/55 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-glow" aria-hidden="true" />
        ATLAS COMMAND NETWORK · SECURE CHANNEL
      </div>
    </footer>
  );
}
