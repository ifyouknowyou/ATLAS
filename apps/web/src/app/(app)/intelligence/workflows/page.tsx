'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Play, Plus, Workflow } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';
import { formatWhen } from '@/lib/presentation';
import { AtlasScene } from '@/features/scenes/AtlasScene';

type WorkflowRecord = {
  id: string;
  name: string;
  description?: string | null;
  kind: string;
  steps: unknown;
  isPublished: boolean;
};

type WorkflowRun = {
  id: string;
  workflowId: string;
  status: string;
  createdAt: string;
};

export default function IntelligenceWorkflowsPage() {
  const token = useAuth((state) => state.token);
  const canCreate = useAuth((state) => state.has('workflow.create'));
  const canExecute = useAuth((state) => state.has('workflow.execute'));
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [createdWorkflow, setCreatedWorkflow] = useState<WorkflowRecord | null>(null);
  const workflows = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get<WorkflowRecord[]>('/workflows', token),
    enabled: Boolean(token),
  });
  const create = useMutation({
    mutationFn: () => api.post<WorkflowRecord>('/workflows', {
      name: name.trim(),
      kind: 'MANUAL',
      description: 'Created from the ATLAS workflow console.',
      steps: [],
    }, token),
    onSuccess: (created) => {
      setName('');
      setCreatedWorkflow(created);
      void client.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
  const run = useMutation({
    mutationFn: (workflowId: string) => api.post<WorkflowRun>(`/workflows/${workflowId}/trigger`, { context: {} }, token),
    onSuccess: (_, workflowId) => {
      void client.invalidateQueries({ queryKey: ['workflow-runs', workflowId] });
    },
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-void-line/70 pb-3">
        <div>
          <div className="mono-label flex items-center gap-2 text-phosphor"><Workflow className="h-3.5 w-3.5" /> AUTOMATION / HUMAN REVIEW</div>
          <h1 className="mt-1 font-mono text-xl tracking-wide text-slate-100">WORKFLOW CONTROL</h1>
        </div>
        {canCreate && <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (name.trim()) create.mutate(); }}>
          <input value={name} onChange={(event) => setName(event.target.value)} className="tech-input w-48" placeholder="New workflow name" aria-label="New workflow name" />
          <button type="submit" disabled={!name.trim() || create.isPending} className="tech-button-primary px-3 py-2 text-xs"><Plus className="h-3.5 w-3.5" /> CREATE</button>
        </form>}
      </header>

      {create.isError && <p role="alert" className="font-mono text-xs text-danger">{create.error instanceof Error ? create.error.message : 'Workflow creation failed'}</p>}

      <Panel title="WORKFLOW PIPELINES" actions={<span className="mono-label">{workflows.data?.length ?? 0} AVAILABLE</span>}>
        {workflows.isLoading ? <Spinner label="Loading workflows" /> : workflows.isError ? <EmptyState title="WORKFLOWS UNAVAILABLE" detail="The workflow service could not be reached." /> : !workflows.data?.length && !createdWorkflow ? <EmptyState title="NO PUBLISHED WORKFLOWS" detail="Create a workflow or ask an administrator to publish one." /> : (
          <div className="grid gap-3 xl:grid-cols-2">
            {[...(createdWorkflow && !workflows.data?.some((item) => item.id === createdWorkflow.id) ? [createdWorkflow] : []), ...(workflows.data ?? [])].map((workflow) => {
              const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
              return <WorkflowCard key={workflow.id} workflow={workflow} steps={steps} canExecute={canExecute} pending={run.isPending} onRun={() => run.mutate(workflow.id)} />;
            })}
          </div>
        )}
      </Panel>
      {run.isError && <p role="alert" className="font-mono text-xs text-danger">{run.error instanceof Error ? run.error.message : 'Could not start workflow'}</p>}
    </div>
  );
}

function WorkflowCard({ workflow, steps, canExecute, pending, onRun }: {
  workflow: WorkflowRecord;
  steps: unknown[];
  canExecute: boolean;
  pending: boolean;
  onRun: () => void;
}) {
  const token = useAuth((state) => state.token);
  const runs = useQuery({
    queryKey: ['workflow-runs', workflow.id],
    queryFn: () => api.get<WorkflowRun[]>(`/workflows/${workflow.id}/runs`, token),
    enabled: Boolean(token),
  });
  return <article className="panel overflow-hidden p-0">
    <div className="flex items-start justify-between gap-3 border-b border-void-line px-4 py-3">
      <div className="min-w-0"><h2 className="truncate font-mono text-sm text-slate-100">{workflow.name}</h2><p className="mt-1 text-xs text-slate-tech">{workflow.description || workflow.kind}</p></div>
      <StatusBadge tone={workflow.isPublished ? 'signal' : 'neutral'}>{workflow.isPublished ? 'PUBLISHED' : 'DRAFT'}</StatusBadge>
    </div>
    <div className="px-3 py-3">
      <AtlasScene
        kind="workflow"
        records={steps.map((step, index) => ({
          id: `${workflow.id}-step-${index}`,
          label: typeof step === 'object' && step !== null && 'type' in step ? String(step.type) : String(step),
          status: typeof step === 'object' && step !== null && 'status' in step ? String(step.status) : undefined,
        }))}
        className="h-56"
      />
    </div>
    <div className="flex items-center justify-between gap-3 border-t border-void-line px-4 py-2">
      <div className="min-w-0 flex items-center gap-2 font-mono text-[9px] text-slate-tech"><Activity className="h-3 w-3 text-phosphor" /> {runs.isLoading ? 'LOADING RUNS' : runs.isError ? 'RUN HISTORY UNAVAILABLE' : `${runs.data?.length ?? 0} RECENT RUNS`}</div>
      {canExecute && workflow.isPublished && <button type="button" disabled={pending} onClick={onRun} className="tech-button px-2 py-1 text-[10px]"><Play className="h-3 w-3" /> RUN</button>}
    </div>
    {runs.data?.length ? <div className="space-y-1 px-4 pb-3">{runs.data.slice(0, 3).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 font-mono text-[9px] text-slate-tech"><span>{formatWhen(item.createdAt)}</span><StatusBadge tone={item.status === 'COMPLETED' ? 'signal' : item.status === 'FAILED' ? 'danger' : 'amber'}>{item.status}</StatusBadge></div>)}</div> : null}
  </article>;
}
