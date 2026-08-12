'use client';

import { useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  Check,
  Download,
  FilePlus2,
  FileText,
  GitCommitVertical,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  useAddReportBlock,
  useAddReportSection,
  useAiGenerateReport,
  useApproveReport,
  useDeleteReportBlock,
  usePublishReport,
  useReport,
  useReportQuality,
  useReviewReport,
  useSubmitReport,
  useUpdateReportBlock,
} from '@/lib/queries';
import { useAuth } from '@/lib/auth-store';
import { useRealtimeStore } from '@/lib/realtime-store';
import { usePresence } from '@/lib/use-presence';
import { api } from '@/lib/api-client';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ClassificationBadge } from '@/components/ui/ClassificationBadge';
import { RealtimeStatusPill } from '@/components/ui/RealtimeStatusPill';
import { Modal } from '@/components/ui/Modal';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/cn';

const BLOCK_TYPES = ['TEXT', 'HEADING', 'EVIDENCE', 'ENTITY', 'TIMELINE', 'AI_SUMMARY', 'CALLOUT', 'TABLE', 'PAGE_BREAK'];

interface Block {
  id: string;
  sectionId: string;
  type: string;
  position: number;
  content?: { text?: string; heading?: string; [k: string]: unknown } | null;
  aiGenerated?: boolean;
  aiStatus?: string | null;
}

interface Section {
  id: string;
  key: string;
  title: string;
  position: number;
  isRequired: boolean;
  collapsed?: boolean;
  blocks: Block[];
}

interface ReportDetail {
  id: string;
  title: string;
  status: string;
  classification: string;
  aiGenerated: boolean;
  aiStatus?: string | null;
  currentVersion: number;
  sections: Section[];
  citations: Array<Record<string, unknown>>;
}

/**
 * Report workspace — 3-panel builder per §56: SECTIONS | CANVAS | INSPECTOR.
 * Autosave posts block deltas to the server (baseVersion-agnostic here; the
 * server bumps currentVersion); the realtime store surfaces truthful status.
 */
export default function ReportWorkspacePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const has = useAuth((s) => s.has);
  const { data: report, isLoading, isError } = useReport(id) as {
    data?: ReportDetail;
    isLoading: boolean;
    isError: boolean;
  };
  const quality = useReportQuality(id);
  const addSection = useAddReportSection(id);
  const addBlock = useAddReportBlock(id);
  const updateBlock = useUpdateReportBlock(id);
  const deleteBlock = useDeleteReportBlock(id);
  const submit = useSubmitReport(id);
  const review = useReviewReport(id);
  const approve = useApproveReport(id);
  const publish = usePublishReport(id);
  const aiGenerate = useAiGenerateReport(id);
  const { activeUsers } = usePresence({ resourceType: 'REPORT', resourceId: id });

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [aiModal, setAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const realtimeState = useRealtimeStore((s) => s.connectionState);
  const delta = useRealtimeStore((s) => s.reportDeltas[id]);

  const sections = useMemo(() => report?.sections ?? [], [report]);
  const selectedSection =
    sections.find((s) => s.id === selectedSectionId) ?? sections[0] ?? null;

  if (isLoading) return <Spinner label="Loading report workspace" />;
  if (isError || !report) return notFound();

  const status = report.status;

  const onAddSection = () => {
    addSection.mutate(
      { key: `section-${Date.now()}`, title: 'New Section' },
      { onSuccess: (data) => setSelectedSectionId((data as { id?: string }).id ?? null) },
    );
  };

  const onAddBlock = (type: string) => {
    if (!selectedSection) return;
    addBlock.mutate(
      { sectionId: selectedSection.id, body: { type, content: { text: '' } } },
      {
        onSuccess: (data) => {
          setEditingBlockId((data as { id?: string }).id ?? null);
          setDraftText('');
        },
      },
    );
  };

  const onUpdateBlockText = (block: Block) => {
    updateBlock.mutate({
      blockId: block.id,
      body: { content: { ...(block.content ?? {}), text: draftText } },
    });
    setEditingBlockId(null);
  };

  const onExport = (format: string) => {
    api.download(`/reports/${id}/export?format=${format}`, useAuth.getState().token).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id.slice(0, 8)}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const qualityIssues = (quality.data?.issues ?? []) as Array<{ message: string; severity: string }>;
  const qualityValid = quality.data?.valid;

  return (
    <div className="flex h-full min-h-0 flex-col space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-slate-100">{report.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge tone={status === 'PUBLISHED' ? 'signal' : status === 'APPROVED' ? 'signal' : status === 'IN_REVIEW' ? 'amber' : status === 'ARCHIVED' ? 'neutral' : 'neutral'}>
              {status}
            </StatusBadge>
            <ClassificationBadge classification={report.classification} />
            <span className="font-mono text-[10px] text-slate-tech/70">v{report.currentVersion}</span>
            {activeUsers.length > 0 && (
              <span className="font-mono text-[10px] text-phosphor">● {activeUsers.length} ACTIVE</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RealtimeStatusPill />
          {message && <span className="font-mono text-[10px] text-phosphor">{message}</span>}
          {error && <span className="font-mono text-[10px] text-danger">{error}</span>}
        </div>
      </div>

      {!qualityValid && qualityIssues.length > 0 && (
        <div className="rounded border border-amber-signal/40 bg-amber-signal/10 px-3 py-2 font-mono text-[11px] text-amber-signal">
          QUALITY: {qualityIssues.map((i) => i.message).join('; ')}
        </div>
      )}

      {/* 3-panel body */}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_1fr_260px]">
        {/* SECTIONS */}
        <Panel title="SECTIONS" actions={has('report.update') && status === 'DRAFT' && (
          <button type="button" onClick={onAddSection} aria-label="Add section" className="rounded p-1 text-slate-tech hover:text-phosphor">
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}>
          <ul className="space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedSectionId(s.id)}
                  className={cn(
                    'w-full rounded border px-2 py-1.5 text-left font-mono text-[11px] transition-colors',
                    selectedSection?.id === s.id
                      ? 'border-phosphor-faint bg-phosphor-dim/10 text-phosphor'
                      : 'border-void-line/60 text-slate-tech hover:text-slate-200',
                  )}
                >
                  {s.isRequired && <span className="mr-1 text-amber-signal">*</span>}
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* CANVAS */}
        <Panel
          title={selectedSection ? selectedSection.title.toUpperCase() : 'CANVAS'}
          actions={
            selectedSection && has('report.update') && status === 'DRAFT' && (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onAddBlock('TEXT')} className="rounded p-1 text-slate-tech hover:text-phosphor" aria-label="Add text">
                  <FileText className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onAddBlock('HEADING')} className="rounded p-1 text-slate-tech hover:text-phosphor" aria-label="Add heading">
                  <FilePlus2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onAddBlock('AI_SUMMARY')} className="rounded p-1 text-slate-tech hover:text-phosphor" aria-label="AI summary">
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          }
        >
          {!selectedSection ? (
            <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">
              Add a section to begin
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSection.blocks.length === 0 && (
                <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/60">
                  No blocks in this section
                </p>
              )}
              {selectedSection.blocks.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    'rounded border border-void-line/60 px-3 py-2',
                    b.aiGenerated && 'border-phosphor-faint/40 bg-phosphor-dim/5',
                  )}
                >
                  {editingBlockId === b.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="tech-input min-h-[80px] font-mono text-xs"
                        placeholder="Block content…"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => onUpdateBlockText(b)} variant="primary" className="!py-1 text-[11px]">
                          <Check className="h-3 w-3" /> SAVE
                        </Button>
                        <Button onClick={() => setEditingBlockId(null)} className="!py-1 text-[11px]">
                          CANCEL
                        </Button>
                        <Button
                          onClick={() => deleteBlock.mutate(b.id)}
                          variant="danger"
                          className="ml-auto !py-1 text-[11px]"
                        >
                          DELETE
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (status !== 'DRAFT' || !has('report.update')) return;
                        setEditingBlockId(b.id);
                        setDraftText(b.content?.text ?? b.content?.heading ?? '');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="mono-label text-slate-tech/60">{b.type}</span>
                        {b.aiGenerated && (
                          <StatusBadge tone="amber">AI — REVIEW REQUIRED</StatusBadge>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">
                        {b.content?.text ?? b.content?.heading ?? '—'}
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* INSPECTOR */}
        <div className="space-y-3">
          <Panel title="INSERT BLOCK">
            <div className="flex flex-wrap gap-1">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!has('report.update') || status !== 'DRAFT'}
                  onClick={() => onAddBlock(t)}
                  className="rounded border border-void-line px-2 py-1 font-mono text-[10px] text-slate-tech transition-colors hover:border-phosphor-faint hover:text-phosphor disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="AI TOOLS">
            <div className="space-y-2">
              <Button onClick={() => setAiModal(true)} disabled={!has('report.update')} className="w-full">
                <Sparkles className="h-3.5 w-3.5" /> GENERATE WITH AI
              </Button>
              <Button
                onClick={() =>
                  aiGenerate.mutate({}, {
                    onSuccess: () => setMessage('Draft generated — review required'),
                    onError: (err: unknown) => setError(err instanceof ApiError ? err.message : 'AI failed'),
                  })
                }
                disabled={!has('report.update')}
                className="w-full"
              >
                <RefreshCw className="h-3.5 w-3.5" /> DRAFT FROM CONTEXT
              </Button>
            </div>
          </Panel>

          <Panel title="WORKFLOW">
            {status === 'DRAFT' && (
              <Button
                onClick={() =>
                  submit.mutate(undefined, {
                    onSuccess: () => setMessage('Submitted for review'),
                    onError: (err: unknown) =>
                      setError(err instanceof ApiError ? err.message : 'Failed'),
                  })
                }
                className="w-full"
              >
                <Send className="h-3.5 w-3.5" /> SUBMIT FOR REVIEW
              </Button>
            )}
            {status === 'IN_REVIEW' && (
              <>
                <Button
                  onClick={() =>
                    review.mutate({ decision: 'APPROVE' }, {
                      onSuccess: () => setMessage('Approved'),
                      onError: (err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed'),
                    })
                  }
                  className="w-full"
                >
                  <Check className="h-3.5 w-3.5" /> APPROVE
                </Button>
                <Button
                  onClick={() =>
                    review.mutate({ decision: 'REQUEST_CHANGES', comment: '' }, {
                      onError: (err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed'),
                    })
                  }
                  className="mt-2 w-full"
                >
                  REQUEST CHANGES
                </Button>
              </>
            )}
            {status === 'APPROVED' && (
              <Button
                onClick={() =>
                  approve.mutate(undefined, {
                    onSuccess: () => setMessage('Explicit approval recorded'),
                    onError: (err: unknown) =>
                      setError(err instanceof ApiError ? err.message : 'Failed'),
                  })
                }
                className="w-full"
              >
                <Check className="h-3.5 w-3.5" /> RECORD EXPLICIT APPROVAL
              </Button>
            )}
            {status === 'APPROVED' && has('report.publish') && (
              <Button
                onClick={() =>
                  publish.mutate(undefined, {
                    onSuccess: () => setMessage('Published'),
                    onError: (err: unknown) =>
                      setError(err instanceof ApiError ? err.message : 'Failed'),
                  })
                }
                variant="primary"
                className="mt-2 w-full"
              >
                <Send className="h-3.5 w-3.5" /> PUBLISH
              </Button>
            )}
          </Panel>

          <Panel title="EXPORT">
            <div className="flex gap-1">
              {['PDF', 'HTML', 'JSON'].map((f) => (
                <Button key={f} onClick={() => onExport(f)} className="flex-1 !px-1 text-[11px]">
                  <Download className="h-3 w-3" /> {f}
                </Button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* AI generation modal */}
      <Modal open={aiModal} onClose={() => setAiModal(false)} title="AI REPORT GENERATION">
        <div className="space-y-3">
          <p className="text-xs text-slate-tech">
            Generated content is marked <span className="text-amber-signal">AI GENERATED — REVIEW REQUIRED</span> and
            will never be published until a human verifies it.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="tech-input min-h-[100px] font-mono text-xs"
            placeholder="e.g. Write an executive summary grounded in the investigation evidence…"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setAiModal(false)}>CANCEL</Button>
            <Button
              type="button"
              variant="primary"
              disabled={!aiPrompt.trim() || aiGenerate.isPending}
              onClick={() => {
                aiGenerate.mutate(
                  { prompt: aiPrompt },
                  {
                    onSuccess: () => {
                      setAiModal(false);
                      setMessage('AI content generated — review required');
                    },
                    onError: (err: unknown) => setError(err instanceof ApiError ? err.message : 'AI failed'),
                  },
                );
              }}
            >
              <Sparkles className="h-3.5 w-3.5" /> GENERATE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
