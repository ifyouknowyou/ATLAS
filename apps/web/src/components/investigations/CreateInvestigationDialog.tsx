'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateInvestigation } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
const CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

export function CreateInvestigationDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useCreateInvestigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [classification, setClassification] = useState('INTERNAL');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const created = await create.mutateAsync({
        title,
        description: description || undefined,
        status,
        classification,
      });
      onClose();
      if (created && typeof created === 'object' && 'id' in created) {
        router.push(`/investigations/${String((created as { id: string }).id)}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create case');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="panel-title mb-4">NEW INVESTIGATION</h2>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <Field label="TITLE" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Investigation title" required minLength={3} />
          <label className="block">
            <span className="mono-label block">DESCRIPTION</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context and scope…"
              className="tech-input mt-1.5 min-h-[90px]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mono-label block">STATUS</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="tech-input mt-1.5">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mono-label block">CLASSIFICATION</span>
              <select value={classification} onChange={(e) => setClassification(e.target.value)} className="tech-input mt-1.5">
                {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {error && (
            <div className="rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose}>CANCEL</Button>
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? 'CREATING…' : 'CREATE CASE'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}