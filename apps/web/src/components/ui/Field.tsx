export function Field({
  label,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mono-label block">{label}</span>
      <input
        autoComplete="off"
        spellCheck={false}
        {...inputProps}
        className={`tech-input mt-1.5 ${error ? 'border-danger/70' : ''}`}
      />
      {error && (
        <span className="mt-1 block font-mono text-[11px] text-danger">
          {error}
        </span>
      )}
    </label>
  );
}