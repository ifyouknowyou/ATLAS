import { cn } from '@/lib/cn';

export function MetricTile({
  label,
  value,
  hint,
  busy,
}: {
  label: string;
  value: number | string | null;
  hint?: string;
  busy?: boolean;
}) {
  return (
    <div className="panel relative overflow-hidden p-4">
      <div className="absolute -right-4 -top-6 h-16 w-16 rounded-full bg-phosphor-faint opacity-40 blur-2xl" />
      <div className="mono-label">{label}</div>
      <div className="mt-2 font-mono text-3xl font-medium tracking-tight text-slate-100">
        {busy ? (
          <span className="inline-block h-6 w-10 animate-pulse rounded bg-void-line" />
        ) : (
          value ?? '—'
        )}
      </div>
      {hint && (
        <div className={cn('mt-1 font-mono text-[11px] text-slate-tech')}>
          {hint}
        </div>
      )}
    </div>
  );
}