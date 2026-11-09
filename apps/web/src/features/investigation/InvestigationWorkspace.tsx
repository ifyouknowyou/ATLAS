'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Archive, BrainCircuit, FileText, GitBranch, Map, RotateCcw, Upload, Plus, CheckSquare } from 'lucide-react';
import {
  useArchiveInvestigation,
  useInvestigation,
  useRestoreInvestigation,
} from '@/lib/queries';
import { recentViewed } from '@/lib/favorites';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { classificationTone, priorityTone, statusTone } from '@/lib/presentation';
import { cn } from '@/lib/cn';
import { OverviewTab } from './tabs/OverviewTab';
import { EntitiesTab } from './tabs/EntitiesTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { EvidenceTab } from './tabs/EvidenceTab';
import { NotesTab } from './tabs/NotesTab';
import { TasksTab } from './tabs/TasksTab';
import { MembersTab } from './tabs/MembersTab';
import { ActivityTab } from './tabs/ActivityTab';
import { TimelineWorkspace } from '@/features/timeline/TimelineWorkspace';

const SECTIONS = [
  'OVERVIEW',
  'ENTITIES',
  'RELATIONSHIPS',
  'EVIDENCE',
  'TIMELINE',
  'NOTES',
  'TASKS',
  'MEMBERS',
  'ACTIVITY',
  'GRAPH',
  'REPORTS',
] as const;
type Section = (typeof SECTIONS)[number];

/** Investigation dashboard: the Phase 2 investigation workspace. */
export function InvestigationWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = String(searchParams.get('tab') ?? 'OVERVIEW').toUpperCase();
  const [section, setSection] = useState<Section>(
    (SECTIONS as readonly string[]).includes(requestedTab) ? (requestedTab as Section) : 'OVERVIEW',
  );
  const archive = useArchiveInvestigation();
  const restore = useRestoreInvestigation();

  const query = useInvestigation(id);
  const investigation = query.data as
    | (Record<string, unknown> & {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        priority: string;
        classification: string;
        archivedAt?: string | null;
        owner?: { displayName: string } | null;
        workspace?: { id: string; name: string } | null;
        myRole?: string;
        _count?: Record<string, number>;
      })
    | undefined;

  useEffect(() => {
    if (investigation?.id) {
      recentViewed.record(investigation.id);
    }
  }, [investigation?.id]);

  useEffect(() => {
    router.replace(`/investigations/${id}?tab=${section}`, { scroll: false });
  }, [id, section, router]);

  if (query.isLoading) return <Spinner label="Opening case file" />;
  if (query.isError) {
    return (
      <div className="panel flex flex-col items-center gap-3 py-16 text-center" role="alert">
        <span className="mono-label text-amber-signal">CASE FILE UNAVAILABLE</span>
        <span className="max-w-md text-sm text-slate-tech">The investigation could not be loaded. Check your access or try again.</span>
        <button type="button" className="tech-button" onClick={() => void query.refetch()}>RETRY</button>
      </div>
    );
  }
  if (!investigation) {
    return (
      <div className="panel flex flex-col items-center gap-2 py-16 text-center">
        <span className="mono-label">CASE NOT FOUND</span>
        <span className="text-sm text-slate-tech">
          This case is not accessible to your organization.
        </span>
      </div>
    );
  }

  const canManage = investigation.myRole === 'LEAD' || investigation.myRole === 'ORG_ADMIN';
  const title = typeof investigation.title === 'string' ? investigation.title : 'Untitled';

  const doArchive = () => {
    const mutation = investigation.archivedAt ? restore : archive;
    void mutation.mutateAsync(id).then(() => router.refresh());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href="/investigations"
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-tech hover:text-phosphor"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> CASE REGISTER
        </Link>
      </div>

      <header className="panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone(investigation.status)}>{investigation.status}</StatusBadge>
          <StatusBadge tone={priorityTone(investigation.priority)}>{investigation.priority}</StatusBadge>
          <StatusBadge tone={classificationTone(investigation.classification)}>
            {investigation.classification}
          </StatusBadge>
          {investigation.archivedAt && <StatusBadge tone="amber">ARCHIVED</StatusBadge>}
          <span className="ml-auto flex items-center gap-3 font-mono text-[10px] text-slate-tech/70">
            {investigation.owner && <span>OVR · {investigation.owner.displayName}</span>}
            {investigation.workspace && <span>WS · {investigation.workspace.name}</span>}
            <span>YOU · {investigation.myRole}</span>
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl tracking-wide text-slate-100">{title}</h1>
            {investigation.description && (
              <p className="mt-2 max-w-3xl text-sm text-slate-tech">{String(investigation.description)}</p>
            )}
          </div>
          {canManage && (
            <button
              type="button"
              onClick={doArchive}
              disabled={archive.isPending || restore.isPending}
              className={cn(
                'tech-button shrink-0 px-3 py-2',
                investigation.archivedAt && 'border-phosphor-faint text-phosphor',
              )}
            >
              {investigation.archivedAt ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" /> RESTORE
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" /> ARCHIVE
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Investigation record counts">
        <CountCard label="ENTITIES" value={investigation._count?.entities} href={`/investigations/${id}?tab=ENTITIES`} />
        <CountCard label="RELATIONSHIPS" value={investigation._count?.relationships} href={`/investigations/${id}?tab=RELATIONSHIPS`} />
        <CountCard label="EVIDENCE" value={investigation._count?.evidence} href={`/investigations/${id}?tab=EVIDENCE`} />
        <CountCard label="TASKS" value={investigation._count?.tasks} href={`/investigations/${id}?tab=TASKS`} />
      </section>

      <section className="panel p-4" aria-labelledby="investigation-actions">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mono-label text-phosphor">CASE OPERATIONS</div>
            <h2 id="investigation-actions" className="mt-1 font-mono text-sm tracking-wide text-slate-100">QUICK ACTIONS</h2>
          </div>
          <span className="text-xs text-slate-tech">Actions stay scoped to this investigation.</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionLink href={`/investigations/${id}?tab=ENTITIES`} icon={<Plus />} label="ADD ENTITY" />
          <ActionLink href={`/investigations/${id}?tab=EVIDENCE`} icon={<Upload />} label="ADD EVIDENCE" />
          <ActionLink href={`/investigations/${id}?tab=TASKS`} icon={<CheckSquare />} label="CREATE TASK" />
          <ActionLink href={`/graph?investigationId=${id}`} icon={<GitBranch />} label="OPEN GRAPH" />
          <ActionLink href={`/map?investigationId=${id}`} icon={<Map />} label="OPEN MAP" />
          <ActionLink href={`/assistant?investigationId=${id}`} icon={<BrainCircuit />} label="ASK ASSISTANT" />
          <ActionLink href={`/reports?investigationId=${id}`} icon={<FileText />} label="CREATE REPORT" />
        </div>
      </section>

      <nav className="flex gap-1 overflow-x-auto border-b border-void-line pb-px" aria-label="Investigation sections">
        {SECTIONS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            className={cn(
              'whitespace-nowrap rounded-t border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors',
              section === key
                ? 'border-phosphor text-phosphor'
                : 'border-transparent text-slate-tech hover:text-slate-200',
            )}
          >
            {key}
          </button>
        ))}
      </nav>

      <SectionBody section={section} id={id} />
    </div>
  );
}

function SectionBody({ section, id }: { section: Section; id: string }) {
  switch (section) {
    case 'OVERVIEW':
      return <OverviewTab id={id} />;
    case 'ENTITIES':
      return <EntitiesTab id={id} />;
    case 'RELATIONSHIPS':
      return <RelationshipsTab id={id} />;
    case 'EVIDENCE':
      return <EvidenceTab id={id} />;
    case 'NOTES':
      return <NotesTab id={id} />;
    case 'TASKS':
      return <TasksTab id={id} />;
    case 'MEMBERS':
      return <MembersTab id={id} />;
    case 'ACTIVITY':
      return <ActivityTab id={id} />;
    case 'TIMELINE':
      return <TimelineWorkspace investigationId={id} />;
    case 'GRAPH':
      return <Link href={`/graph?investigationId=${id}`} className="tech-button">OPEN KNOWLEDGE GRAPH</Link>;
    case 'REPORTS':
      return <Link href={`/reports?investigationId=${id}`} className="tech-button">OPEN REPORTS</Link>;
    default:
      return null;
  }
}

function CountCard({ label, value, href }: { label: string; value?: number; href: string }) {
  return (
    <Link href={href} className="panel surface-hover p-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-phosphor">
      <div className="mono-label">{label}</div>
      <div className="mt-1 font-mono text-xl text-slate-100">{value ?? '—'}</div>
    </Link>
  );
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="tech-button text-[10px] uppercase tracking-wider">
      {icon}
      {label}
    </Link>
  );
}
