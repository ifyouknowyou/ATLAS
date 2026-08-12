'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import { useAuth } from './auth-store';

function useToken() {
  return useAuth((s) => s.token);
}

function qs(params: Record<string, string | number | boolean | undefined> | undefined): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) usp.set(key, String(value));
  }
  const q = usp.toString();
  return q ? `?${q}` : '';
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function useOrganization() {
  const token = useToken();
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => api.get<Record<string, unknown>>('/organizations/me', token),
    enabled: Boolean(token),
  });
}

export interface InvestigationRow {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  classification: string;
  ownerId?: string | null;
  archivedAt?: string | null;
  updatedAt: string;
  _count?: { entities: number; evidence: number; tasks: number; members: number };
}

export function useInvestigations(params?: {
  status?: string;
  priority?: string;
  classification?: string;
  ownerId?: string;
  q?: string;
  sortBy?: string;
  order?: string;
  archived?: boolean;
  limit?: number;
  offset?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['investigations', params],
    queryFn: () =>
      api.get<{ items: InvestigationRow[]; total: number }>(
        `/investigations${qs(params)}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

export function useInvestigation(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () =>
      api.get<Record<string, unknown>>(`/investigations/${id}`, token),
    enabled: Boolean(token && id),
  });
}

export function useDashboard(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () =>
      api.get<{
        counts: Record<string, number>;
        recentActivity: Array<Record<string, unknown>>;
        graph: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };
      }>(`/investigations/${id}/dashboard`, token),
    enabled: Boolean(token && id),
  });
}

export function useMembers(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['members', id],
    queryFn: () =>
      api.get<Array<Record<string, unknown>>>(`/investigations/${id}/members`, token),
    enabled: Boolean(token && id),
  });
}

export function useActivity(id: string | undefined, limit = 30) {
  const token = useToken();
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/investigations/${id}/activity${qs({ limit })}`,
        token,
      ),
    enabled: Boolean(token && id),
  });
}

export function useTasks(investigationId: string | undefined, params?: { status?: string }) {
  const token = useToken();
  return useQuery({
    queryKey: ['tasks', investigationId, params],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/investigations/${investigationId}/tasks${qs(params)}`,
        token,
      ),
    enabled: Boolean(token && investigationId),
  });
}

export function useEntities(params?: {
  type?: string;
  status?: string;
  investigationId?: string;
  q?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['entities', params],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/entities${qs(params)}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

export function useEntity(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['entity', id],
    queryFn: () => api.get<Record<string, unknown>>(`/entities/${id}`, token),
    enabled: Boolean(token && id),
  });
}

export function useRelationships(params?: {
  investigationId?: string;
  type?: string;
  entityId?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['relationships', params],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/relationships${qs(params)}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

export function useEvidence(params?: {
  type?: string;
  status?: string;
  classification?: string;
  investigationId?: string;
  q?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence', params],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/evidence${qs(params)}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

export function useNotes(investigationId: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['notes', investigationId],
    queryFn: () =>
      api.get<{ items: Array<Record<string, unknown>>; total: number }>(
        `/notes${qs({ investigationId })}`,
        token,
      ),
    enabled: Boolean(token && investigationId),
  });
}

export function useSearch(q: string, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ['search', q],
    queryFn: () =>
      api.get<Array<{ kind: string; id: string; label: string; detail?: string; href: string }>>(
        `/search${qs({ q })}`,
        token,
      ),
    enabled: Boolean(token && q.length >= 2 && enabled),
  });
}

// ---------------------------------------------------------------------------
// Mutations (with cache invalidation)
// ---------------------------------------------------------------------------

export interface MutationResult<T = unknown> {
  data?: T;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  mutate: () => void;
}

export function useCreateInvestigation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post('/investigations', body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['investigations'] }),
  });
}

export function usePatchInvestigation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/investigations/${id}`, body, token),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] });
      void queryClient.invalidateQueries({ queryKey: ['investigation', vars.id] });
    },
  });
}

export function useArchiveInvestigation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/investigations/${id}/archive`, {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRestoreInvestigation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/investigations/${id}/restore`, {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateEntity() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/entities', body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['entities'] }),
  });
}

export function usePatchEntity() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/entities/${id}`, body, token),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['entities'] });
      void queryClient.invalidateQueries({ queryKey: ['entity', vars.id] });
    },
  });
}

export function useCreateRelationship() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/relationships', body, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['relationships'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateNote() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/notes', body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useCreateEvidence() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/evidence', body, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateTask() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ investigationId, body }: { investigationId: string; body: Record<string, unknown> }) =>
      api.post(`/investigations/${investigationId}/tasks`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function usePatchTask() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/tasks/${id}`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useAddMember() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ investigationId, body }: { investigationId: string; body: Record<string, unknown> }) =>
      api.post(`/investigations/${investigationId}/members`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useRemoveMember() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ investigationId, userId }: { investigationId: string; userId: string }) =>
      api.delete(`/investigations/${investigationId}/members/${userId}`, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
}


/**
 * Phase 3 — Graph & Geospatial query hooks.
 * All fetch through the centralized api-client; keys are invalidation targets
 * for SSE-driven cache updates.
 */

export interface GraphNodeRow {
  id: string;
  name: string;
  type: string;
  confidence: number;
  latitude?: number | null;
  longitude?: number | null;
  investigationId?: string | null;
  tags?: string[];
}

export interface GraphEdgeRow {
  id: string;
  kind: string;
  direction: string;
  confidence: number;
  sourceId: string;
  targetId: string;
  investigationId?: string | null;
}

export interface GraphPayload {
  nodes: GraphNodeRow[];
  edges: GraphEdgeRow[];
  meta: { totalEntities: number; truncated?: boolean };
}

export interface NeighborhoodPayload {
  center: GraphNodeRow;
  nodes: GraphNodeRow[];
  edges: GraphEdgeRow[];
  depth: number;
  truncated?: boolean;
}

export interface PathPayload {
  nodes: GraphNodeRow[];
  edges: GraphEdgeRow[];
  found: boolean;
  hops: number;
}

export interface TimelineRow {
  id: string;
  title: string;
  description?: string | null;
  kind: string;
  occurredAt: string;
  investigationId?: string | null;
  entityId?: string | null;
  createdByDisplayName?: string | null;
}

/** Org-wide (optionally investigation-scoped) graph browse. */
export function useGraphBrowse(params?: {
  investigationId?: string;
  entityType?: string;
  relationshipType?: string;
  geoOnly?: boolean;
  q?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['graph', params],
    queryFn: () =>
      api.get<GraphPayload>(
        `/graph${qs({
          ...(params?.investigationId ? { investigationId: params.investigationId } : {}),
          ...(params?.entityType ? { entityType: params.entityType } : {}),
          ...(params?.relationshipType ? { relationshipType: params.relationshipType } : {}),
          ...(params?.geoOnly ? { geoOnly: 'true' } : {}),
          ...(params?.q ? { q: params.q } : {}),
          ...(params?.limit ? { limit: params.limit } : { limit: 300 }),
        })}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

/** Investigation-scoped graph for the workspace GRAPH tab. */
export function useGraphForInvestigation(investigationId: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ['graph', 'investigation', investigationId],
    queryFn: () => api.get<GraphPayload>(`/graph?investigationId=${investigationId}`, token),
    enabled: Boolean(token && investigationId),
  });
}

/** Neighborhood expansion around an entity. */
export function useNeighborhood(
  centerId: string | undefined,
  depth = 1,
  investigationId?: string,
) {
  const token = useToken();
  return useQuery({
    queryKey: ['graph', 'neighborhood', centerId, depth, investigationId],
    queryFn: () =>
      api.get<NeighborhoodPayload>(
        `/graph/neighborhood${qs({
          centerId,
          depth,
          ...(investigationId ? { investigationId } : {}),
        })}`,
        token,
      ),
    enabled: Boolean(token && centerId),
  });
}

/** Shortest path between two entities. */
export function useGraphPath(
  sourceId: string | undefined,
  targetId: string | undefined,
  enabled = false,
) {
  const token = useToken();
  return useQuery({
    queryKey: ['graph', 'path', sourceId, targetId],
    queryFn: () =>
      api.get<PathPayload>(
        `/graph/path${qs({ sourceId, targetId, maxHops: 4 })}`,
        token,
      ),
    enabled: Boolean(token && sourceId && targetId && enabled),
  });
}

/** All geolocated entities (globe markers + map). */
export function useLocations(params?: {
  investigationId?: string;
  entityType?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['geo', 'locations', params],
    queryFn: () =>
      api.get<GraphNodeRow[]>(
        `/geo/locations${qs({
          ...(params?.investigationId ? { investigationId: params.investigationId } : {}),
          ...(params?.entityType ? { entityType: params.entityType } : {}),
          ...(params?.limit ? { limit: params.limit } : { limit: 500 }),
        })}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

/** Entities inside a bounding box (map view). */
export function useBoundingBox(params: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  investigationId?: string;
  entityType?: string;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['geo', 'bbox', params],
    queryFn: () =>
      api.get<GraphNodeRow[]>(
        `/geo/bounding-box${qs({
          minLat: params.minLat,
          maxLat: params.maxLat,
          minLng: params.minLng,
          maxLng: params.maxLng,
          ...(params.investigationId ? { investigationId: params.investigationId } : {}),
          ...(params.entityType ? { entityType: params.entityType } : {}),
        })}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

/** Connection arcs between geolocated entities (globe/map overlays). */
export function useArcs(investigationId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['geo', 'arcs', investigationId],
    queryFn: () =>
      api.get<Array<{ source: { latitude: number; longitude: number }; target: { latitude: number; longitude: number }; kind: string; confidence: number }>>(
        `/geo/arcs${qs(investigationId ? { investigationId } : {})}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

/** Timeline events (org-wide, investigation- or entity-scoped). */
export function useTimeline(params?: {
  investigationId?: string;
  entityId?: string;
  kind?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const token = useToken();
  return useQuery({
    queryKey: ['timeline', params],
    queryFn: () =>
      api.get<{ items: TimelineRow[]; total: number }>(
        `/timeline${qs({
          ...(params?.investigationId ? { investigationId: params.investigationId } : {}),
          ...(params?.entityId ? { entityId: params.entityId } : {}),
          ...(params?.kind ? { kind: params.kind } : {}),
          ...(params?.from ? { from: params.from } : {}),
          ...(params?.to ? { to: params.to } : {}),
          ...(params?.limit ? { limit: params.limit } : { limit: 100 }),
        })}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

// ---------------------------------------------------------------------------
// AI assistant (Phase 4)
// ---------------------------------------------------------------------------

export interface AiSourceRef {
  kind: 'ENTITY' | 'EVIDENCE' | 'NOTE';
  id: string;
  title: string;
  snippet?: string;
  investigationId?: string | null;
}

export interface AiMessageRow {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sources: AiSourceRef[] | null;
  createdAt: string;
}

export interface AiChatReply {
  reply: string;
  sources: AiSourceRef[];
  messageId: string;
}

export interface AiSummaryPayload {
  overview: string;
  keyEntities: string[];
  keyRelationships: string[];
  evidenceHighlights: string[];
  openQuestions: string[];
}

/** Assistant chat — returns the reply plus grounded sources. */
export function useAiChat(investigationId?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      message: string;
      history?: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>;
    }) =>
      api.post<AiChatReply>(
        `/ai/chat`,
        { investigationId, message: vars.message, history: vars.history },
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
    },
  });
}

/** Structured investigation summary. */
export function useAiSummarize() {
  const token = useToken();
  return useMutation({
    mutationFn: (vars: { investigationId?: string }) =>
      api.post<{ summary: AiSummaryPayload; sources: AiSourceRef[] }>(
        `/ai/summarize`,
        { investigationId: vars.investigationId },
        token,
      ),
  });
}

/** Persisted assistant conversation history. */
export function useAiMessages(investigationId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['ai-messages', investigationId],
    queryFn: () =>
      api.get<AiMessageRow[]>(
        `/ai/messages${qs(investigationId ? { investigationId } : {})}`,
        token,
      ),
    enabled: Boolean(token),
  });
}

// ---------------------------------------------------------------------------
// Phase 5 — Evidence Vault
// ---------------------------------------------------------------------------

export interface EvidenceDetail extends Record<string, unknown> {
  id: string;
  name: string;
  kind: string;
  classification: string;
  status: string;
  hash?: string | null;
  mimeType?: string | null;
  size?: number | null;
  processingStatus?: string | null;
  investigationId?: string | null;
  createdAt: string;
}

export function useEvidenceDetail(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence', id],
    queryFn: () => api.get<EvidenceDetail>(`/evidence/${id}`, token),
    enabled: Boolean(token && id),
  });
}

export function useEvidenceVersions(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence-versions', id],
    queryFn: () => api.get<unknown[]>(`/evidence/${id}/versions`, token),
    enabled: Boolean(token && id),
  });
}

export function useEvidenceAccessHistory(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence-access', id],
    queryFn: () => api.get<unknown[]>(`/evidence/${id}/access-history`, token),
    enabled: Boolean(token && id),
  });
}

export function useEvidenceAnnotations(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence-annotations', id],
    queryFn: () => api.get<unknown[]>(`/evidence/${id}/annotations`, token),
    enabled: Boolean(token && id),
  });
}

export function useEvidenceLinks(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence-links', id],
    queryFn: () => api.get<unknown[]>(`/evidence/${id}/links`, token),
    enabled: Boolean(token && id),
  });
}

export function useEvidenceProcessing(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['evidence-processing', id],
    queryFn: () => api.get<unknown[]>(`/evidence/${id}/processing`, token),
    enabled: Boolean(token && id),
  });
}

export function useUploadEvidence() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { file: File; fields: Record<string, string> }) =>
      api.upload<{ id: string; hash: string; versionNumber: number }>(
        '/evidence/upload',
        vars.file,
        vars.fields,
        token,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateEvidenceAnnotation(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post(`/evidence/${id}/annotations`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['evidence-annotations'] }),
  });
}

export function useResolveAnnotation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ annotationId, resolved }: { annotationId: string; resolved: boolean }) =>
      api.post(`/evidence/annotations/${annotationId}/resolve`, { resolved }, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['evidence-annotations'] }),
  });
}

export function useProcessEvidence(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kind: string) =>
      api.post(`/evidence/${id}/process`, { kind }, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evidence-processing'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence', id] });
    },
  });
}

export function useArchiveEvidence(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archived: boolean) =>
      api.post(`/evidence/${id}/${archived ? 'archive' : 'restore'}`, {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence', id] });
    },
  });
}

// ---------------------------------------------------------------------------
// Phase 5 — Reports
// ---------------------------------------------------------------------------

export interface ReportRow {
  id: string;
  title: string;
  status: string;
  classification: string;
  aiGenerated: boolean;
  aiStatus?: string | null;
  currentVersion: number;
  investigationId?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useReports(params?: { status?: string; investigationId?: string; q?: string }) {
  const token = useToken();
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => api.get<{ items: ReportRow[]; total: number }>(`/reports${qs(params)}`, token),
    enabled: Boolean(token),
  });
}

export function useReport(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => api.get<Record<string, unknown>>(`/reports/${id}`, token),
    enabled: Boolean(token && id),
  });
}

export function useReportTemplates() {
  const token = useToken();
  return useQuery({
    queryKey: ['report-templates'],
    queryFn: () => api.get<unknown[]>('/reports/templates', token),
    enabled: Boolean(token),
  });
}

export function useCreateReport() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/reports', body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useCreateReportFromTemplate() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/reports/from-template', body, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

export function useAddReportSection(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/reports/${id}/sections`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useAddReportBlock(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, body }: { sectionId: string; body: Record<string, unknown> }) =>
      api.post(`/reports/${id}/sections/${sectionId}/blocks`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useUpdateReportBlock(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, body }: { blockId: string; body: Record<string, unknown> }) =>
      api.patch(`/reports/${id}/blocks/${blockId}`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useDeleteReportBlock(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => api.delete(`/reports/${id}/blocks/${blockId}`, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useAddReportCitation(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/reports/${id}/citations`, body, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
      void queryClient.invalidateQueries({ queryKey: ['report-citations'] });
    },
  });
}

export function useReportQuality(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['report-quality', id],
    queryFn: () => api.get<{ valid: boolean; issues: unknown[] }>(`/reports/${id}/quality`, token),
    enabled: Boolean(token && id),
  });
}

export function useReportVersions(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['report-versions', id],
    queryFn: () => api.get<unknown[]>(`/reports/${id}/versions`, token),
    enabled: Boolean(token && id),
  });
}

export function useSubmitReport(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/reports/${id}/submit`, {}, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useReviewReport(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { decision: string; comment?: string }) =>
      api.post(`/reports/${id}/review`, body, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useApproveReport(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) => api.post(`/reports/${id}/approve`, { comment }, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function usePublishReport(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/reports/${id}/publish`, {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useAiGenerateReport(id?: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { sectionKey?: string; prompt?: string }) =>
      api.post(`/reports/${id}/ai/generate`, body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['report', id] }),
  });
}

export function useAiReviewReport(id?: string) {
  const token = useToken();
  return useMutation({
    mutationFn: () => api.post(`/reports/${id}/ai/review`, {}, token),
  });
}

// ---------------------------------------------------------------------------
// Phase 5 — Collaboration
// ---------------------------------------------------------------------------

export function useComments(targetType?: string, targetId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['comments', targetType, targetId],
    queryFn: () =>
      api.get<unknown[]>(`/comments${qs({ targetType, targetId })}`, token),
    enabled: Boolean(token && targetType && targetId),
  });
}

export function useCreateComment() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { targetType: string; targetId: string; body: string }) =>
      api.post('/comments', body, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useReplyToComment() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      api.post(`/comments/${commentId}/replies`, { body }, token),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useNotifications() {
  const token = useToken();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<unknown[]>('/notifications', token),
    enabled: Boolean(token),
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  const token = useToken();
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get<number>('/notifications/unread-count', token),
    enabled: Boolean(token),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

export function usePresenceActive(resourceType?: string, resourceId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['presence', resourceType, resourceId],
    queryFn: () =>
      api.get<unknown[]>(`/collaboration/${resourceType}/${resourceId}/presence`, token),
    enabled: Boolean(token && resourceType && resourceId),
    refetchInterval: 30_000,
  });
}
