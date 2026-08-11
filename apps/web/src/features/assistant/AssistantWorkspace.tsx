'use client';
import { useMemo, useState } from 'react';
import { useAiChat, useAiMessages } from '@/lib/queries';
import type { AiSourceRef } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SummaryPanel } from './components/SummaryPanel';
import { InvestigationPicker } from './components/InvestigationPicker';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sources: AiSourceRef[] | null;
}

/**
 * Full-page AI assistant workspace for the /assistant route (Phase 4 §?).
 * Left: investigation context + summary. Center: grounded chat thread.
 */
export function AssistantWorkspace() {
  const [investigationId, setInvestigationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const chat = useAiChat(investigationId);
  const historyQuery = useAiMessages(investigationId);

  const history = useMemo<ChatMessage[]>(
    () =>
      (historyQuery.data ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sources,
      })),
    [historyQuery.data],
  );

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;
    setInput('');
    void chat.mutateAsync({
      message: trimmed,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-4">
        <InvestigationPicker value={investigationId} onChange={setInvestigationId} />
        <SummaryPanel investigationId={investigationId} />
      </div>
      <Panel
        title="ASSISTANT"
        className="flex h-[640px] flex-col"
        actions={
          investigationId ? (
            <span className="mono-label text-[9px] text-slate-tech">
              INVESTIGATION CONTEXT
            </span>
          ) : undefined
        }
      >
        <div className="flex-1 space-y-3 overflow-auto pr-1">
          {historyQuery.isLoading && <Spinner label="LOADING HISTORY" />}
          {!historyQuery.isLoading && history.length === 0 && (
            <EmptyState
              title="START A CONVERSATION"
              detail="Ask the assistant about entities, evidence, and notes in scope. Answers are grounded in tenant-isolated records."
            />
          )}
          {history.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {chat.isPending && (
            <MessageBubble
              message={{ id: 'pending', role: 'ASSISTANT', content: '', sources: null }}
              pending
            />
          )}
        </div>

        <form
          className="mt-3 flex items-end gap-2 border-t border-void-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={2}
            placeholder="Ask about this investigation…"
            className="tech-input min-h-0 flex-1 resize-none border-void-line bg-void-raised font-mono text-[12px] text-phosphor focus:border-phosphor-faint/50 focus:outline-none"
            aria-label="Assistant message"
          />
          <Button variant="primary" type="submit" disabled={chat.isPending || !input.trim()}>
            SEND
          </Button>
        </form>
        {chat.isError && (
          <p className="mt-2 font-mono text-[11px] text-amber-signal">
            {chat.error instanceof Error ? chat.error.message : 'AI assistant unavailable'}
          </p>
        )}
      </Panel>
    </div>
  );
}

function MessageBubble({
  message,
  pending = false,
}: {
  message: ChatMessage;
  pending?: boolean;
}) {
  const isUser = message.role === 'USER';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded border px-3 py-2 ${
          isUser
            ? 'border-phosphor-faint/40 bg-phosphor-faint/10'
            : 'border-void-line bg-void-raised'
        }`}
      >
        {pending ? (
          <Spinner label="THINKING" />
        ) : (
          <>
            <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-void">
              {message.content}
            </p>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.sources.map((s) => (
                  <SourceChip key={`${s.kind}-${s.id}`} source={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: AiSourceRef }) {
  return (
    <a
      href={source.investigationId ? `/entities/${source.id}` : undefined}
      className="mono-label inline-flex items-center gap-1 rounded border border-void-line/60 bg-void px-1.5 py-0.5 text-[9px] text-slate-tech hover:border-phosphor-faint/40"
      title={source.snippet}
    >
      <span className="text-phosphor-faint">{source.kind}</span>
      {source.title}
    </a>
  );
}