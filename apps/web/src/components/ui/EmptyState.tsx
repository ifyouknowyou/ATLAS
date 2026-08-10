export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-2 border border-dashed border-void-line py-14 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-tech">
        {title}
      </span>
      {detail && (
        <span className="max-w-md text-sm text-slate-tech/80">{detail}</span>
      )}
    </div>
  );
}