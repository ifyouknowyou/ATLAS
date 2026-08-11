'use client';
import { useGraphStore } from '../store';
import { nodeColor } from '../palette';
import { cn } from '@/lib/cn';

interface ExplorerListProps {
  entityHref?: (id: string) => string;
}

/**
 * Keyboard/list fallback for the graph (§33). Non-canvas users can browse,
 * select, and open entities without WebGL or canvas interaction.
 */
export function ExplorerList({ entityHref }: ExplorerListProps) {
  const data = useGraphStore((s) => s.data);
  const selectedId = useGraphStore((s) => s.selectedNodeIds[0] ?? null);
  const selectNode = useGraphStore((s) => s.selectNode);
  const setHover = useGraphStore((s) => s.setHover);

  if (data.nodes.length === 0) {
    return (
      <p className="font-mono text-[11px] text-slate-tech">NO ENTITIES LOADED</p>
    );
  }

  const sorted = [...data.nodes].sort((a, b) => b.confidence - a.confidence);

  return (
    <ul className="max-h-64 space-y-0.5 overflow-auto pr-1" role="listbox" aria-label="Entity explorer">
      {sorted.map((node) => {
        const active = node.id === selectedId;
        return (
          <li
            key={node.id}
            role="option"
            aria-selected={active}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded px-2 py-1 font-mono text-[11px]',
              active ? 'bg-phosphor-faint/20 text-phosphor' : 'text-slate-tech hover:bg-void-line/40',
            )}
            onClick={() => {
              selectNode(node.id);
              setHover(node.id);
            }}
            onMouseEnter={() => setHover(node.id)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: nodeColor(String(node.type)) }} />
            <span className="truncate text-void">{node.name}</span>
            <span className="ml-auto text-slate-tech">{String(node.type)}</span>
            {entityHref && (
              <a href={entityHref(node.id)} className="mono-label text-[9px] text-phosphor" onClick={(e) => e.stopPropagation()}>
                OPEN
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}