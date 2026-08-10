'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreateNote, useNotes } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';

export function NotesTab({ id }: { id: string }) {
  const query = useNotes(id);
  const [creating, setCreating] = useState(false);
  const items = (query.data?.items ?? []) as Array<Record<string, unknown>>;

  return (
    <Panel title="INVESTIGATION NOTES" actions={
      <Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> ADD NOTE</Button>
    }>
      {creating && <NoteForm id={id} onDone={() => setCreating(false)} />}
      {query.isLoading ? (
        <Spinner label="Reading notes" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">No notes yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((note) => (
            <article key={String(note.id)} className="rounded border border-void-line/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-100">{String(note.title)}</span>
                <StatusBadge tone={note.visibility === 'PRIVATE' ? 'amber' : 'neutral'}>
                  {String(note.visibility)}
                </StatusBadge>
              </div>
              {String(note.body ?? '') && <p className="mt-1.5 whitespace-pre-wrap text-[11px] text-slate-tech">{String(note.body)}</p>}
              <div className="mt-2 font-mono text-[10px] text-slate-tech/60">
                {(note.createdBy as { displayName?: string } | null)?.displayName ?? '—'}
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}

function NoteForm({ id, onDone }: { id: string; onDone: () => void }) {
  const create = useCreateNote();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('INVESTIGATION');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ title, content, visibility, investigationId: id });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save note');
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mb-4 rounded border border-void-line bg-void-raised/60 p-4">
      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
          minLength={1}
          className="tech-input"
        />
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="tech-input w-auto text-xs">
          <option value="INVESTIGATION">INVESTIGATION</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Analytical notes…"
        required
        className="tech-input mt-2 min-h-[90px]"
      />
      {error && (
        <div className="mt-2 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" onClick={onDone}>CANCEL</Button>
        <Button type="submit" variant="primary" disabled={create.isPending}>{create.isPending ? 'SAVING…' : 'SAVE NOTE'}</Button>
      </div>
    </form>
  );
}