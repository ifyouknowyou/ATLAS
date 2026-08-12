'use client';

import { useEffect, useState } from 'react';
import { useEvidenceDetail } from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { api } from '@/lib/api-client';

/**
 * Evidence preview pane (§13, §14). Renders images/PDFs through a short-lived
 * signed URL fetched with the bearer token — the browser never sees a permanent
 * storage URL. For unsupported kinds we show the metadata facts only.
 */
export function EvidenceViewer({ id }: { id: string }) {
  const token = useAuth((s) => s.token);
  const { data: evidence, isLoading } = useEvidenceDetail(id);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const mime = (evidence?.mimeType as string | undefined) ?? '';
  const isImage = mime.startsWith('image/');
  const isPdf = mime === 'application/pdf';

  useEffect(() => {
    if (!token || !id) return;
    let cancelled = false;
    api
      .get<{ url: string }>(`/evidence/${id}/signed-url`, token)
      .then((res) => {
        if (!cancelled) setSignedUrl(res.url);
      })
      .catch(() => {
        // Preview unavailable — metadata panel still shows the facts.
      });
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-tech">Loading viewer</p>
      </div>
    );
  }

  if (isImage && signedUrl) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded border border-void-line bg-void-raised/40 p-4">
        <img
          src={signedUrl}
          alt={String(evidence?.name ?? 'evidence preview')}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  if ((isPdf || mime.startsWith('text/') || mime === 'application/json') && signedUrl) {
    return (
      <div className="h-full min-h-[420px] w-full overflow-hidden rounded border border-void-line bg-void-raised/40">
        <object
          data={signedUrl}
          type={mime || 'application/octet-stream'}
          className="h-full w-full"
          aria-label={String(evidence?.name ?? 'document preview')}
        >
          <p className="p-6 text-center font-mono text-xs uppercase tracking-widest text-slate-tech">
            Preview unavailable for this file type
          </p>
        </object>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 rounded border border-void-line bg-void-raised/40 p-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-tech">
        PREVIEW NOT AVAILABLE
      </span>
      <span className="text-sm text-slate-tech/80">
        {mime || 'unknown'} — open in the evidence record for metadata, versions and chain of custody
      </span>
    </div>
  );
}
