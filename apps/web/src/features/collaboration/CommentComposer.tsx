'use client';

import { useState } from 'react';
import { useCreateComment, useComments, useReplyToComment } from '@/lib/queries';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api-client';

interface CommentRow {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  resolvedAt?: string | null;
  author?: { id: string; displayName: string } | null;
  replies?: Array<{ id: string; authorId: string; body: string; createdAt: string; author?: { id: string; displayName: string } | null }>;
}

/**
 * Contextual comment thread + composer (§39, §40). Mentions (@displayName)
 * are passed through verbatim; the server resolves them only over users who
 * can read the target. Content is rendered as text (React escapes it — no
 * dangerous innerHTML), so stored HTML never executes.
 */
export function CommentComposer({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: string;
}) {
  const comments = useComments(targetType, targetId);
  const create = useCreateComment();
  const replyTo = useReplyToComment();
  const [body, setBody] = useState('');
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const items = (comments.data ?? []) as CommentRow[];

  const submit = () => {
    if (!body.trim()) return;
    setError(null);
    create.mutate(
      { targetType, targetId, body: body.trim() },
      {
        onSuccess: () => setBody(''),
        onError: (err: unknown) =>
          setError(err instanceof ApiError ? err.message : 'Failed to comment'),
      },
    );
  };

  const submitReply = (commentId: string) => {
    if (!replyBody.trim()) return;
    replyTo.mutate(
      { commentId, body: replyBody.trim() },
      {
        onSuccess: () => {
          setReplyFor(null);
          setReplyBody('');
        },
        onError: (err: unknown) =>
          setError(err instanceof ApiError ? err.message : 'Failed to reply'),
      },
    );
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="py-4 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/60">
            No comments yet
          </p>
        )}
        {items.map((c) => (
          <div key={c.id} className="rounded border border-void-line/60 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-phosphor">
                {c.author?.displayName ?? '—'}
              </span>
              <span className="font-mono text-[10px] text-slate-tech/60">
                {new Date(c.createdAt).toLocaleString()}
              </span>
              {c.resolvedAt && <span className="font-mono text-[9px] text-slate-tech/50">RESOLVED</span>}
            </div>
            <p className="mt-1 text-xs text-slate-200">{c.body}</p>
            <button
              type="button"
              onClick={() => setReplyFor(replyFor === c.id ? null : c.id)}
              className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-tech hover:text-phosphor"
            >
              REPLY
            </button>
            {c.replies && c.replies.length > 0 && (
              <div className="mt-2 space-y-1 border-l border-void-line pl-2">
                {c.replies.map((r) => (
                  <div key={r.id} className="text-[11px]">
                    <span className="font-mono text-[9px] text-slate-tech">{r.author?.displayName ?? '—'}:</span>{' '}
                    <span className="text-slate-300">{r.body}</span>
                  </div>
                ))}
              </div>
            )}
            {replyFor === c.id && (
              <div className="mt-2 flex gap-2">
                <input
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Reply…"
                  className="tech-input flex-1 !py-1 text-xs"
                />
                <Button onClick={() => submitReply(c.id)} className="!py-1 text-[11px]">
                  SEND
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded border border-danger/40 bg-danger/10 px-2 py-1.5 font-mono text-[11px] text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Add a comment… (use @name to mention)"
          className="tech-input flex-1 text-xs"
          aria-label="Comment body"
        />
        <Button onClick={submit} variant="primary" disabled={!body.trim()}>
          COMMENT
        </Button>
      </div>
    </div>
  );
}
