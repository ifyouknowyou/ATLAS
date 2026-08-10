import { cn } from '@/lib/cn';

type Tone = 'signal' | 'amber' | 'neutral' | 'danger';

const tones: Record<Tone, string> = {
  signal: 'border-phosphor-faint/60 bg-phosphor-dim/10 text-phosphor',
  amber: 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal',
  neutral: 'border-void-line bg-void-raised text-slate-tech',
  danger: 'border-danger/50 bg-danger/10 text-danger',
};

export function StatusBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}