'use client';
import { ENTITY_TYPES, RELATIONSHIP_TYPES } from '@atlas/shared';
import { useGraphStore } from '../store';
import { emptyFilter, connectedComponents } from '../engine/filters';
import { typeCounts } from '../engine/metrics';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';

/**
 * Graph filter panel: entity types, relationship types, connected
 * components, and a reset. Filters are applied through the engine.
 */
export function FilterPanel() {
  const filterState = useGraphStore((s) => s.filterState);
  const toggleFilter = useGraphStore((s) => s.toggleFilter);
  const setFilters = useGraphStore((s) => s.setFilters);
  const data = useGraphStore((s) => s.data);

  const counts = typeCounts(data);
  const components = connectedComponents(data).sort((a, b) => b.length - a.length).slice(0, 6);

  return (
    <Panel title="FILTERS" className="flex flex-col gap-3">
      <div>
        <span className="mono-label text-slate-tech">ENTITY TYPES</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {ENTITY_TYPES.map((t) => {
            const active = filterState.entityTypes.has(t);
            const count = counts.get(t) ?? 0;
            return (
              <button
                key={t}
                onClick={() => toggleFilter('entityTypes', t)}
                className={`mono-label rounded border px-1.5 py-0.5 text-[9px] ${
                  active
                    ? 'border-phosphor-faint bg-phosphor-faint/20 text-phosphor'
                    : 'border-void-line text-slate-tech'
                }`}
              >
                {t} {count > 0 ? count : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="mono-label text-slate-tech">RELATIONSHIP TYPES</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {RELATIONSHIP_TYPES.map((t) => {
            const active = filterState.relationshipTypes.has(t);
            return (
              <button
                key={t}
                onClick={() => toggleFilter('relationshipTypes', t)}
                className={`mono-label rounded border px-1.5 py-0.5 text-[9px] ${
                  active
                    ? 'border-amber-signal bg-amber-signal/20 text-amber-signal'
                    : 'border-void-line text-slate-tech'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="mono-label text-slate-tech">COMPONENTS</span>
        <div className="mt-1 flex flex-col gap-1">
          {components.map((comp, i) => (
            <span key={i} className="font-mono text-[10px] text-slate-tech">
              {i + 1}. {comp.length} nodes
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-2">
        <Button variant="primary" onClick={() => setFilters(emptyFilter())}>
          <span className="mono-label">RESET FILTERS</span>
        </Button>
      </div>
    </Panel>
  );
}