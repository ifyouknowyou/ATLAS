import { EmptyState } from './EmptyState';

/**
 * Professional placeholder for modules deliberately deferred to later phases.
 * Keeps routes alive with clear boundaries and honest "phase" labeling.
 */
export function PlaceholderPage({
  title,
  icon,
  phase,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  phase: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded border border-void-line bg-void-raised text-phosphor-dim">
            {icon}
          </div>
          <div>
            <h1 className="font-mono text-lg tracking-wide text-slate-100">
              {title}
            </h1>
            <span className="mono-label mt-0.5">{phase}</span>
          </div>
        </div>
      </header>

      <EmptyState title={title} detail={description} />
      {children}
    </div>
  );
}