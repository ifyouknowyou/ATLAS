'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useUploadEvidence } from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/cn';

const MAX_MB = 25;

/**
 * Drag-and-drop evidence ingestion (§4). Validates size client-side (the
 * server re-validates magic bytes/MIME), then multipart-uploads to
 * /evidence/upload. Rejections surface inline, never silently dropped.
 */
export function EvidenceDropzone({
  onUploaded,
  classification,
  investigationId,
}: {
  onUploaded?: (id: string) => void;
  classification?: string;
  investigationId?: string;
}) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadEvidence();
  const hasPermission = useAuth((s) => s.has?.('evidence.create') ?? false);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      setError(null);
      if (!file) return;
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File exceeds ${MAX_MB} MiB upload limit`);
        return;
      }
      const fields: Record<string, string> = {};
      if (classification) fields.classification = classification;
      if (investigationId) fields.investigationId = investigationId;
      upload.mutate(
        { file, fields },
        {
          onSuccess: (data) => onUploaded?.(data.id),
          onError: (err) =>
            setError(err instanceof Error ? err.message : 'Upload failed'),
        },
      );
    },
    [upload, classification, investigationId, onUploaded],
  );

  if (!hasPermission) {
    return (
      <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
        Evidence upload requires a higher role
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors',
          drag
            ? 'border-phosphor bg-phosphor-dim/10'
            : 'border-void-line bg-void-raised/50 hover:border-phosphor-faint',
        )}
      >
        <UploadCloud className={cn('h-8 w-8', drag ? 'text-phosphor' : 'text-slate-tech')} />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-tech">
          {upload.isPending ? 'UPLOADING…' : 'DROP EVIDENCE OR CLICK TO BROWSE'}
        </span>
        <span className="text-[11px] text-slate-tech/70">
          PDF · images · text · JSON · zip — up to {MAX_MB} MiB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error && (
        <p className="mt-2 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
