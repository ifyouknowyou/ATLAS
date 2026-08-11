'use client';
import { useEntity } from '@/lib/queries';
import { useGraphStore } from '../store';
import { nodeColor } from '../palette';
import { confidenceLabel, formatWhen } from '@/lib/presentation';
import { Spinner } from '@/components/ui/Spinner';
import { Panel } from '@/components/ui/Panel';
import Link from 'next/link';

interface DetailsPanelProps {
  entityHref?: (id: string) => string;
}

/** Contextual details for the selected node (or an empty prompt). */
export function DetailsPanel({ entityHref }: DetailsPanelProps) {
  const selectedId = useGraphStore((s) => s.selectedNodeIds[0] ?? null);
  const setHover = useGraphStore((s) => s.setHover);
  const focusNode = useGraphStore((s) => s.centerOn);
  const query = useEntity(selectedId ?? undefined);
  const entity = query.data as Record<string, unknown> | undefined;

  if (!selectedId) {
    return (
      <Panel title="DETAILS">
        <p className="font-mono text-[11px] text-slate-tech">
          Select a node to inspect its entity profile.
        </p>
      </Panel>
    );
  }

  if (query.isLoading) {
    return <Panel title="DETAILS"><Spinner label="Loading entity" /></Panel>;
  }

  if (!entity) {
    return (
      <Panel title="DETAILS">
        <p className="font-mono text-[11px] text-amber-signal">ENTITY NOT FOUND</p>
      </Panel>
    );
  }

  const name = String(entity.name ?? entity.displayName ?? 'Unknown');
  const type = String(entity.type ?? 'OTHER');
  const confidence = Number(entity.confidence ?? 0);

  return (
    <Panel title="DETAILS">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: nodeColor(type) }} />
        <h3 className="text-sm font-semibold text-void">{name}</h3>
      </div>
      <dl className="mt-2 space-y-1 font-mono text-[11px] text-slate-tech">
        <div className="flex justify-between">
          <dt>TYPE</dt>
          <dd className="text-phosphor">{type}</dd>
        </div>
        <div className="flex justify-between">
          <dt>CONFIDENCE</dt>
          <dd>{confidenceLabel(confidence)}</dd>
        </div>
        {typeof entity.status === 'string' && (
          <div className="flex justify-between">
            <dt>STATUS</dt>
            <dd>{entity.status}</dd>
          </div>
        )}
        {typeof entity.createdAt === 'string' && (
          <div className="flex justify-between">
            <dt>UPDATED</dt>
            <dd>{formatWhen(String(entity.updatedAt ?? entity.createdAt))}</dd>
          </div>
        )}
      </dl>
      {typeof entity.summary === 'string' && entity.summary.length > 0 && (
        <p className="mt-2 text-[12px] text-void">{entity.summary}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="tech-button"
          onClick={() => {
            setHover(selectedId);
            focusNode(selectedId);
          }}
        >
          <span className="mono-label">FOCUS</span>
        </button>
        {entityHref && (
          <Link className="tech-button" href={entityHref(selectedId)}>
            <span className="mono-label">OPEN</span>
          </Link>
        )}
      </div>
    </Panel>
  );
}