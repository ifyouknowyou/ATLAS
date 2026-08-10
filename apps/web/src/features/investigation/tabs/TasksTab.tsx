'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreateTask, usePatchTask, useTasks } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { formatWhen } from '@/lib/presentation';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const;

export function TasksTab({ id }: { id: string }) {
  const query = useTasks(id);
  const patch = usePatchTask();
  const [creating, setCreating] = useState(false);

  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;
  const byStatus = (status: string) => items.filter((t) => t.status === status);

  const move = async (taskId: string, status: string) => {
    await patch.mutateAsync({ id: taskId, body: { status } }).catch(() => undefined);
  };

  return (
    <Panel title="INVESTIGATION TASKS" actions={
      <Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> ADD TASK</Button>
    }>
      {creating && <TaskForm id={id} onDone={() => setCreating(false)} />}
      {query.isLoading ? (
        <Spinner label="Reading tasks" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col} className="rounded border border-void-line/60 p-2">
              <div className="mono-label px-1 pb-2">{col}</div>
              <div className="space-y-2">
                {byStatus(col).length === 0 && (
                  <p className="px-1 py-2 text-center font-mono text-[10px] text-slate-tech/60">—</p>
                )}
                {byStatus(col).map((task) => (
                  <div key={String(task.id)} className="rounded border border-void-line bg-void-raised px-2 py-2">
                    <div className="text-[11px] text-slate-100">{String(task.title)}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-tech/70">
                        {(task.assignee as { displayName?: string } | null)?.displayName ?? 'unassigned'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void move(String(task.id), nextStatus(col))}
                        className="font-mono text-[9px] uppercase tracking-widest text-phosphor hover:text-phosphor-dim"
                      >
                        →
                      </button>
                    </div>
                    {task.dueAt && (
                      <div className="mt-1 font-mono text-[9px] text-slate-tech/60">due {formatWhen(String(task.dueAt))}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function nextStatus(current: string): string {
  switch (current) {
    case 'TODO':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'DONE';
    case 'BLOCKED':
      return 'IN_PROGRESS';
    default:
      return 'TODO';
  }
}

function TaskForm({ id, onDone }: { id: string; onDone: () => void }) {
  const create = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ investigationId: id, body: { title, description: description || undefined } });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create task');
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mb-4 rounded border border-void-line bg-void-raised/60 p-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required minLength={2} className="tech-input" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details (optional)" className="tech-input mt-2" />
      {error && (
        <div className="mt-2 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" onClick={onDone}>CANCEL</Button>
        <Button type="submit" variant="primary" disabled={create.isPending}>{create.isPending ? 'SAVING…' : 'CREATE TASK'}</Button>
      </div>
    </form>
  );
}