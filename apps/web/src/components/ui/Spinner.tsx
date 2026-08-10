export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-tech">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-void-line border-t-phosphor" />
      {label && <span className="font-mono text-xs uppercase tracking-widest">{label}</span>}
    </div>
  );
}