import { cn } from '@/lib/cn';

export function Panel({
  children,
  className,
  title,
  actions,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn('panel p-4', className)}>
      {(title || actions) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="panel-title">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}