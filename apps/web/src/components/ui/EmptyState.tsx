import type { ReactNode } from 'react';

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-2 border border-dashed border-void-line py-14 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-tech">
        {title}
      </span>
      {detail && (
        <span className="max-w-md text-sm text-slate-tech/80">{detail}</span>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}