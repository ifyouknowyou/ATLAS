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

export type { MutationResult };