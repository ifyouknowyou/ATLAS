'use client';
import { useState } from 'react';
import type { AiSummaryPayload } from '@/lib/queries';
import { useAiSummarize } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface SummaryPanelProps {
  investigationId?: string;
}

/** Generate + display a structured investigation summary (knowledge-graph reasoning). */
export function SummaryPanel({ investigationId }: SummaryPanelProps) {
  const summarize = useAiSummarize();
  const [summary, setSummary] = useState<AiSummaryPayload | null>(null);

  const run = () => {
    setSummary(null);
    void summarize
      .mutateAsync({ investigationId })
      .then((res) => setSummary(res.summary))
      .catch(() => undefined);
  };

  return (
    <Panel
      title="INVESTIGATION SUMMARY"
      actions={
        <Button
          variant="default"
          onClick={run}
          disabled={summarize.isPending}
          title="Generate a structured intelligence summary"
        >
          {summarize.isPending ? 'GENERATING' : 'GENERATE'}
        </Button>
      }
    >
      {summarize.isPending && <Spinner label="REASONING OVER RECORDS" />}
      {summarize.isError && !summarize.isPending && (
        <p className="font-mono text-[11px] text-amber-signal">
          {summarize.error instanceof Error ? summarize.error.message : 'Summary unavailable'}
        </p>
      )}
      {summary && (
        <div className="space-y-3 text-[12px] text-void">
          <p className="leading-relaxed">{summary.overview}</p>
          <SummarySection title="KEY ENTITIES" items={summary.keyEntities} />
          <SummarySection title="KEY RELATIONSHIPS" items={summary.keyRelationships} />
          <SummarySection title="EVIDENCE HIGHLIGHTS" items={summary.evidenceHighlights} />
          <SummarySection title="OPEN QUESTIONS" items={summary.openQuestions} />
        </div>
      )}
      {!summary && !summarize.isPending && !summarize.isError && (
        <p className="font-mono text-[10px] leading-relaxed text-slate-tech">
          Generate a structured summary of key entities, relationships, evidence, and open
          questions — grounded in records in scope.
        </p>
      )}
    </Panel>
  );
}

function SummarySection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mono-label mb-1 text-[9px] text-phosphor-faint">{title}</h4>
      <ul className="list-inside list-disc space-y-1">
        {items.map((item, i) => (
          <li key={i} className="font-mono text-[11px] leading-snug text-slate-tech">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}