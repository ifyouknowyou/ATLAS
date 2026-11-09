'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileText,
  History,
  Lightbulb,
  Network,
  PanelLeft,
  PanelRight,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAiChat, useAiMessages, useInvestigations } from '@/lib/queries';
import type { AiSourceRef, InvestigationRow } from '@/lib/queries';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SummaryPanel } from './components/SummaryPanel';
import { AtlasScene } from '@/features/scenes/AtlasScene';
import { cn } from '@/lib/cn';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sources: AiSourceRef[] | null;
  createdAt?: string;
}

type RightTab = 'INVESTIGATION' | 'SOURCES' | 'HISTORY' | 'RESOURCES';

const QUICK_ACTIONS = [
  { label: 'SUMMARIZE INVESTIGATION', description: 'Build a grounded overview', prompt: 'Summarize this investigation and identify its key entities, relationships, evidence highlights, and open questions.' },
  { label: 'FIND EVIDENCE GAPS', description: 'Surface missing support', prompt: 'Identify information and evidence gaps in this investigation. Explain why each gap matters and what an analyst should verify next.' },
  { label: 'ANALYZE RECENT EVENTS', description: 'Review the timeline', prompt: 'Analyze the available timeline and recent observations in this investigation. Distinguish recorded facts from hypotheses.' },
  { label: 'FIND CONFLICTS', description: 'Compare observations', prompt: 'Look for conflicting observations or records in this investigation. Cite the available sources and explain the limitation of the comparison.' },
  { label: 'EXPLORE ENTITIES', description: 'Map connected actors', prompt: 'Analyze the entities and relationships available in this investigation. Describe only connections supported by the records.' },
  { label: 'DRAFT REPORT BRIEF', description: 'Prepare an analyst brief', prompt: 'Draft a concise intelligence brief for this investigation with an executive summary, key findings, evidence references, limitations, and next steps.' },
] as const;

const PROMPTS = [
  'Summarize this investigation.',
  'Identify missing evidence.',
  'Explain the strongest relationship.',
  'Analyze recent timeline events.',
] as const;

export function AssistantWorkspace() {
  const searchParams = useSearchParams();
  const [investigationId, setInvestigationId] = useState<string | undefined>(
    searchParams?.get('investigationId') ?? undefined,
  );
  const [input, setInput] = useState('');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>('INVESTIGATION');
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const [newChat, setNewChat] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const chat = useAiChat(investigationId);
  const historyQuery = useAiMessages(investigationId);
  const investigationsQuery = useInvestigations({ limit: 50, archived: false });

  const persisted = useMemo<ChatMessage[]>(
    () =>
      (historyQuery.data ?? []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sources: message.sources,
        createdAt: message.createdAt,
      })),
    [historyQuery.data],
  );
  const history = useMemo(
    () => [...persisted, ...optimistic.filter((message) => !persisted.some((item) => item.id === message.id))],
    [optimistic, persisted],
  );
  const visibleHistory = newChat ? optimistic : history;
  const investigations = investigationsQuery.data?.items ?? [];
  const investigation = investigations.find((item) => item.id === investigationId);
  const allSources = useMemo(
    () =>
      visibleHistory
        .flatMap((message) => message.sources ?? [])
        .filter((source, index, sources) => sources.findIndex((item) => `${item.kind}:${item.id}` === `${source.kind}:${source.id}`) === index),
    [visibleHistory],
  );
  const contextRecords = useMemo(
    () =>
      allSources.map((source) => ({
        id: `${source.kind}:${source.id}`,
        label: source.title,
        category: source.kind,
      })),
    [allSources],
  );

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;
    setInput('');
    const localId = `local-user-${Date.now()}`;
    setOptimistic((current) => [
      ...current,
      { id: localId, role: 'USER', content: trimmed, sources: null, createdAt: new Date().toISOString() },
    ]);
    void chat.mutateAsync({
      message: trimmed,
      history: visibleHistory.map((message) => ({ role: message.role, content: message.content })),
    }).then((reply) => {
      setOptimistic((current) => [
        ...current,
        { id: reply.messageId, role: 'ASSISTANT', content: reply.reply, sources: reply.sources, createdAt: new Date().toISOString() },
      ]);
      requestAnimationFrame(() => {
        const element = conversationRef.current;
        if (element && typeof element.scrollTo === 'function') {
          element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
        }
      });
    }).catch(() => undefined);
  };

  const runQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    if (action.label === 'SUMMARIZE INVESTIGATION') {
      setRightTab('INVESTIGATION');
    }
    submit(action.prompt);
  };

  return (
    <div className="assistant-workspace">
      <header className="assistant-hero panel">
        <div className="assistant-hero-grid" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="assistant-orbit"><BrainCircuit className="h-4 w-4" /></span>
              <span className="mono-label text-phosphor">ATLAS INTELLIGENCE ASSISTANT</span>
              <span className="assistant-status"><span /> ONLINE</span>
            </div>
            <h1 className="mt-3 font-mono text-2xl tracking-tight text-slate-100 sm:text-3xl">Investigation-aware intelligence.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-tech">
              Analyze authorized records, connect evidence, explore relationships, and identify information gaps without leaving your operational picture.
            </p>
          </div>
          <div className="assistant-context-badge">
            <ShieldCheck className="h-4 w-4 text-phosphor" />
            <div>
              <span className="mono-label block text-[9px]">ACTIVE SCOPE</span>
              <strong className="mt-1 block font-mono text-xs text-slate-100">
                {investigation ? investigation.title : investigationId ? 'CONTEXT UNAVAILABLE' : 'ORGANIZATION-WIDE'}
              </strong>
            </div>
          </div>
        </div>
      </header>

      <div className="assistant-toolbar">
        <div className="flex items-center gap-2">
          <button type="button" className="tech-button p-2" onClick={() => setLeftOpen((open) => !open)} aria-label={leftOpen ? 'Collapse context panel' : 'Open context panel'}>
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="mono-label hidden sm:inline">ANALYSIS WORKSPACE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="assistant-scope-dot" /> <span className="font-mono text-[10px] text-slate-tech">{investigation ? 'INVESTIGATION CONTEXT ACTIVE' : 'ORG CONTEXT ACTIVE'}</span>
          <button type="button" className="tech-button p-2" onClick={() => setRightOpen((open) => !open)} aria-label={rightOpen ? 'Collapse intelligence panel' : 'Open intelligence panel'}>
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={cn('assistant-columns', !leftOpen && 'assistant-columns-left-collapsed', !rightOpen && 'assistant-columns-right-collapsed')}>
        {leftOpen && (
          <aside className="assistant-left-panel" aria-label="Investigation context and quick actions">
            <ContextPanel
              investigationId={investigationId}
              investigation={investigation}
              investigations={investigations}
              loading={investigationsQuery.isLoading}
              onChange={(value) => {
                setInvestigationId(value);
                setOptimistic([]);
                setNewChat(false);
              }}
              onRefresh={() => void investigationsQuery.refetch()}
            />
            <SummaryPanel investigationId={investigationId} />
            <Panel title="QUICK INTELLIGENCE ACTIONS" actions={<Sparkles className="h-3.5 w-3.5 text-phosphor" />}>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.label} type="button" className="assistant-action" onClick={() => runQuickAction(action)} disabled={chat.isPending}>
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 text-phosphor-dim" />
                    <span><strong>{action.label}</strong><small>{action.description}</small></span>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="GROUNDED CONTEXT FIELD" actions={<span className="mono-label text-[9px]">{contextRecords.length} REFERENCES</span>}>
              <AtlasScene kind="constellation" records={contextRecords} className="h-[180px]" />
            </Panel>
          </aside>
        )}

        <main className="assistant-center-panel">
          <div className="panel flex min-h-[620px] flex-1 flex-col overflow-hidden">
            <div className="assistant-conversation-header">
              <div>
                <span className="mono-label text-phosphor">LIVE ANALYSIS CHANNEL</span>
                <h2 className="mt-1 font-mono text-sm text-slate-100">{investigation?.title ?? 'Organization intelligence'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[9px] text-slate-tech sm:inline">{visibleHistory.length} MESSAGES</span>
                <button
                  type="button"
                  className="tech-button gap-1.5 px-2 py-1.5 font-mono text-[9px] tracking-wider"
                  onClick={() => {
                    setNewChat(true);
                    setOptimistic([]);
                    setInput('');
                    setCopiedId(null);
                  }}
                  title="Start a new chat without deleting saved history"
                >
                  <Sparkles className="h-3 w-3" /> NEW CHAT
                </button>
                <button type="button" className="tech-button p-2" onClick={() => void historyQuery.refetch()} aria-label="Refresh conversation history" title="Refresh conversation history"><RefreshCw className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div ref={conversationRef} className="assistant-messages" aria-live="polite">
              {historyQuery.isLoading && <Spinner label="LOADING HISTORY" />}
              {historyQuery.isError && <ErrorNotice message="Conversation history could not be loaded." onRetry={() => void historyQuery.refetch()} />}
              {!historyQuery.isLoading && !historyQuery.isError && visibleHistory.length === 0 && (
                <EmptyState title="START A GROUNDED ANALYSIS" detail="Select an investigation or ask an organization-wide question. Responses are limited to records you are authorized to access." />
              )}
              {visibleHistory.map((message) => <MessageBubble key={message.id} message={message} copied={copiedId === message.id} onCopy={() => {
                void copyToClipboard(message.content).then(() => setCopiedId(message.id));
              }} />)}
              {chat.isPending && <MessageBubble message={{ id: 'pending', role: 'ASSISTANT', content: '', sources: null }} pending />}
            </div>
            <div className="assistant-composer-wrap">
              <div className="assistant-prompts" aria-label="Suggested prompts">
                {PROMPTS.filter((prompt) => !history.some((message) => message.content === prompt)).map((prompt) => (
                  <button key={prompt} type="button" onClick={() => submit(prompt)} disabled={chat.isPending}>{prompt}</button>
                ))}
              </div>
              <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); submit(input); }}>
                <div className="flex-1">
                  <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(input); }
                  }} rows={2} maxLength={8000} placeholder={investigation ? 'Ask anything about this investigation…' : 'Ask anything about authorized intelligence…'} aria-label="Assistant message" />
                  <div className="mt-1 flex justify-between px-1 font-mono text-[9px] text-slate-tech/60"><span>ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</span><span>{input.length}/8000</span></div>
                </div>
                <Button variant="primary" type="submit" disabled={chat.isPending || !input.trim()} aria-label="Send assistant message"><Send className="h-4 w-4" /><span className="hidden sm:inline">SEND</span></Button>
              </form>
              {chat.isError && <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-amber-signal" role="alert"><CircleAlert className="h-3.5 w-3.5" />{chat.error instanceof Error ? chat.error.message : 'AI assistant unavailable'}</p>}
            </div>
          </div>
        </main>

        {rightOpen && (
          <aside className="assistant-right-panel" aria-label="Investigation intelligence">
            <RightPanel tab={rightTab} onTabChange={setRightTab} investigation={investigation} sources={allSources} history={history} />
          </aside>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ investigationId, investigation, investigations, loading, onChange, onRefresh }: {
  investigationId?: string;
  investigation?: InvestigationRow;
  investigations: InvestigationRow[];
  loading: boolean;
  onChange: (value: string | undefined) => void;
  onRefresh: () => void;
}) {
  return (
    <Panel title="INVESTIGATION CONTEXT" actions={<button type="button" className="text-slate-tech hover:text-phosphor" onClick={onRefresh} aria-label="Refresh investigations"><RefreshCw className="h-3.5 w-3.5" /></button>}>
      <label className="block">
        <span className="mono-label text-[9px]">ANALYSIS SCOPE</span>
        <select value={investigationId ?? ''} onChange={(event) => onChange(event.target.value || undefined)} className="tech-input mt-2 h-9 font-mono text-[11px]" aria-label="Investigation context">
          <option value="">ORGANIZATION-WIDE</option>
          {investigations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      {loading && <div className="mt-3"><Spinner label="LOADING AUTHORIZED CASES" /></div>}
      {investigation ? (
        <div className="mt-4 border-t border-void-line pt-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge>{investigation.status}</Badge><Badge>{investigation.priority}</Badge><Badge>{investigation.classification}</Badge>
          </div>
          <p className="mt-3 font-mono text-xs text-slate-100">{investigation.title}</p>
          {investigation.description && <p className="mt-1 text-[11px] leading-relaxed text-slate-tech">{investigation.description}</p>}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Stat label="ENTITIES" value={investigation._count?.entities} href={`/investigations/${investigation.id}?tab=ENTITIES`} />
            <Stat label="EVIDENCE" value={investigation._count?.evidence} href={`/investigations/${investigation.id}?tab=EVIDENCE`} />
            <Stat label="TASKS" value={investigation._count?.tasks} href={`/investigations/${investigation.id}?tab=TASKS`} />
            <Stat label="MEMBERS" value={investigation._count?.members} href={`/investigations/${investigation.id}?tab=MEMBERS`} />
          </div>
          <Link href={`/investigations/${investigation.id}`} className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] text-phosphor hover:text-slate-100">VIEW INVESTIGATION <ExternalLink className="h-3 w-3" /></Link>
        </div>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-tech">Organization-wide analysis uses only records available to your current organization and permissions.</p>
      )}
    </Panel>
  );
}

function RightPanel({ tab, onTabChange, investigation, sources, history }: {
  tab: RightTab;
  onTabChange: (tab: RightTab) => void;
  investigation?: InvestigationRow;
  sources: AiSourceRef[];
  history: ChatMessage[];
}) {
  const tabs: Array<{ value: RightTab; label: string; icon: typeof Database }> = [
    { value: 'INVESTIGATION', label: 'CASE', icon: Database },
    { value: 'SOURCES', label: 'SOURCES', icon: BookOpen },
    { value: 'HISTORY', label: 'HISTORY', icon: History },
    { value: 'RESOURCES', label: 'LINKS', icon: Network },
  ];
  return (
    <Panel className="assistant-right-card p-0">
      <div role="tablist" aria-label="Assistant intelligence panels" className="assistant-tabs">
        {tabs.map(({ value, label, icon: Icon }) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => onTabChange(value)} className={cn(tab === value && 'is-active')}><Icon className="h-3.5 w-3.5" /><span>{label}</span></button>)}
      </div>
      <div className="p-4">
        {tab === 'INVESTIGATION' && <div className="space-y-4"><div><span className="mono-label text-phosphor">CURRENT INTELLIGENCE</span><h2 className="mt-2 font-mono text-sm text-slate-100">{investigation?.title ?? 'Organization-wide context'}</h2><p className="mt-2 text-[11px] leading-relaxed text-slate-tech">{investigation?.description ?? 'No investigation selected. Choose a case to narrow the assistant context.'}</p></div><div className="assistant-trust-note"><ShieldCheck className="h-4 w-4 text-phosphor" /><span>Sources and analysis are restricted to authorized records.</span></div></div>}
        {tab === 'SOURCES' && <SourceList sources={sources} />}
        {tab === 'HISTORY' && <HistoryList history={history} />}
        {tab === 'RESOURCES' && <ResourceLinks investigationId={investigation?.id} />}
      </div>
    </Panel>
  );
}

function SourceList({ sources }: { sources: AiSourceRef[] }) {
  if (!sources.length) return <EmptyState title="NO SOURCES YET" detail="Grounded source references will appear here after the assistant responds." />;
  return <div className="space-y-2">{sources.map((source) => <SourceChip key={`${source.kind}:${source.id}`} source={source} detailed />)}</div>;
}

function HistoryList({ history }: { history: ChatMessage[] }) {
  if (!history.length) return <EmptyState title="NO CONVERSATION HISTORY" detail="Persisted assistant messages will appear here for the selected context." />;
  return <div className="space-y-2">{history.slice().reverse().map((message) => <div key={message.id} className="border-b border-void-line pb-2"><div className="flex items-center justify-between gap-2"><span className="mono-label text-[9px] text-phosphor-faint">{message.role}</span>{message.createdAt && <time className="font-mono text-[9px] text-slate-tech/60">{formatTime(message.createdAt)}</time>}</div><p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-tech">{message.content || 'Processing…'}</p></div>)}</div>;
}

function ResourceLinks({ investigationId }: { investigationId?: string }) {
  const links = investigationId ? [
    [`/investigations/${investigationId}`, 'Investigation workspace', FileText],
    [`/graph?investigationId=${investigationId}`, 'Knowledge graph', Network],
    [`/timeline?investigationId=${investigationId}`, 'Timeline analysis', Clock3],
    [`/evidence?investigationId=${investigationId}`, 'Evidence vault', BookOpen],
    [`/entities?investigationId=${investigationId}`, 'Entity register', Database],
    [`/reports?investigationId=${investigationId}`, 'Reports', FileText],
  ] as const : [['/investigations', 'Investigation register', FileText], ['/search', 'Unified search', Database]] as const;
  return <div className="space-y-1.5">{links.map(([href, label, Icon]) => <Link key={href} href={href} className="assistant-resource"><Icon className="h-3.5 w-3.5 text-phosphor-dim" /><span>{label}</span><ChevronRight className="ml-auto h-3 w-3 text-slate-tech" /></Link>)}</div>;
}

function MessageBubble({ message, pending = false, copied, onCopy }: { message: ChatMessage; pending?: boolean; copied?: boolean; onCopy?: () => void }) {
  const isUser = message.role === 'USER';
  return <div className={cn('assistant-message-row', isUser && 'is-user')}><div className={cn('assistant-message', isUser ? 'assistant-message-user' : 'assistant-message-ai')}>
    <div className="flex items-center justify-between gap-3"><span className="mono-label text-[9px]">{isUser ? 'ANALYST INPUT' : 'ATLAS ANALYSIS'}</span>{message.createdAt && <time className="font-mono text-[9px] text-slate-tech/60">{formatTime(message.createdAt)}</time>}</div>
    {pending ? <Spinner label="REASONING OVER AUTHORIZED RECORDS" /> : <><ResponseContent content={message.content} /><div className="mt-3 flex flex-wrap items-center gap-2">{message.sources?.map((source) => <SourceChip key={`${source.kind}-${source.id}`} source={source} />)}{!isUser && onCopy && <button type="button" onClick={onCopy} className="assistant-message-action" aria-label="Copy response">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? 'COPIED' : 'COPY'}</button>}</div></>}
  </div></div>;
}

function ResponseContent({ content }: { content: string }) {
  const sections = parseSections(content);
  if (!sections.length) return <p className="whitespace-pre-wrap text-[13px] leading-7 text-slate-100">{content}</p>;
  return <div className="space-y-3">{sections.map((section) => <section key={section.title}><h3 className="assistant-section-title">{section.title}</h3><p className="whitespace-pre-wrap text-[13px] leading-7 text-slate-100">{section.body}</p></section>)}</div>;
}

function parseSections(content: string): Array<{ title: string; body: string }> {
  const lines = content.split(/\r?\n/);
  const headings = /^(executive summary|key findings?|evidence references?|entity analysis|relationship analysis|timeline overview|potential risks?|information gaps?|analytical limitations?|recommended next steps?)\s*:?\s*$/i;
  const sections: Array<{ title: string; body: string }> = [];
  let current: { title: string; body: string } | null = null;
  for (const line of lines) {
    const match = line.trim().match(headings);
    if (match) {
      if (current) sections.push({ ...current, body: current.body.trim() });
      current = { title: match[1].toUpperCase(), body: '' };
    } else if (current) current.body += `${line}\n`;
  }
  if (current) sections.push({ ...current, body: current.body.trim() });
  return sections.filter((section) => section.body);
}

function SourceChip({ source, detailed = false }: { source: AiSourceRef; detailed?: boolean }) {
  const href = source.kind === 'ENTITY' ? `/entities/${source.id}` : source.kind === 'EVIDENCE' ? `/evidence/${source.id}` : source.kind === 'WEB' ? source.id : undefined;
  const content = <><span className="text-phosphor-faint">{source.kind}</span><span className="truncate">{source.title}</span>{detailed && source.snippet && <span className="mt-1 line-clamp-2 text-[10px] text-slate-tech">{source.snippet}</span>}</>;
  if (!href) return <div className={cn('assistant-source-chip', detailed && 'assistant-source-detail')}>{content}</div>;
  return <a href={href} target={source.kind === 'WEB' ? '_blank' : undefined} rel={source.kind === 'WEB' ? 'noreferrer' : undefined} className={cn('assistant-source-chip', detailed && 'assistant-source-detail')} title={source.snippet}>{content}{detailed && <ExternalLink className="ml-auto h-3 w-3 shrink-0" />}</a>;
}

function Stat({ label, value, href }: { label: string; value?: number; href: string }) {
  return <Link href={href} className="rounded border border-void-line bg-void-raised/60 p-2 transition-colors hover:border-phosphor-faint/50"><span className="mono-label block text-[8px]">{label}</span><strong className="mt-1 block font-mono text-sm text-slate-100">{value ?? '—'}</strong></Link>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-phosphor-faint/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-phosphor-dim">{children}</span>;
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex flex-col items-center gap-3 py-12 text-center"><CircleAlert className="h-6 w-6 text-amber-signal" /><p className="font-mono text-xs text-amber-signal">{message}</p><Button onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" /> RETRY</Button></div>;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
