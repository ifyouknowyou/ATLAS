'use client';
import { useInvestigations } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';

interface InvestigationPickerProps {
  value?: string;
  onChange: (investigationId: string | undefined) => void;
}

/** Select the investigation the assistant should reason over. */
export function InvestigationPicker({ value, onChange }: InvestigationPickerProps) {
  const { data, isLoading } = useInvestigations({ limit: 50, archived: false });

  const items = data?.items ?? [];
  const hasAccess = !isLoading && items.length > 0;

  return (
    <Panel title="CONTEXT">
      <label className="flex flex-col gap-1">
        <span className="mono-label text-slate-tech">INVESTIGATION</span>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="tech-input h-8 border-void-line bg-void-raised font-mono text-[11px] uppercase tracking-widest text-phosphor focus:border-phosphor-faint/50 focus:outline-none"
          aria-label="Investigation context"
        >
          <option value="">ORG-WIDE</option>
          {hasAccess &&
            items.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.title}
              </option>
            ))}
        </select>
      </label>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-tech">
        {hasAccess
          ? 'Ground answers in records from the selected investigation.'
          : 'Choose an investigation you can access, or ask org-wide.'}
      </p>
    </Panel>
  );
}
