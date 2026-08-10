'use client';

import { useState } from 'react';
import { Plus, UserMinus } from 'lucide-react';
import { useAddMember, useMembers, useRemoveMember } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

const ROLES = ['LEAD', 'ANALYST', 'CONTRIBUTOR', 'VIEWER'];

interface OrgUser {
  user: { id: string; displayName: string; email: string };
}

export function MembersTab({ id }: { id: string }) {
  const token = useAuth((s) => s.token);
  const query = useMembers(id);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const [showAdd, setShowAdd] = useState(false);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const members = (query.data ?? []) as Array<Record<string, unknown>>;

  const loadUsers = async () => {
    setError(null);
    try {
      const list = await api.get<OrgUser[]>('/users', token);
      setUsers(list);
      setShowAdd(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cannot list organization members');
    }
  };

  const add = async (userId: string, role: string) => {
    setError(null);
    try {
      await addMember.mutateAsync({ investigationId: id, body: { userId, role } });
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add member');
    }
  };

  const remove = async (userId: string) => {
    await removeMember.mutateAsync({ investigationId: id, userId }).catch(() => undefined);
  };

  const existingIds = new Set(members.map((m) => (m.user as { id: string }).id));

  return (
    <Panel title="INVESTIGATION MEMBERS" actions={
      <Button variant="primary" onClick={() => void loadUsers()}><Plus className="h-4 w-4" /> ADD MEMBER</Button>
    }>
      {error && (
        <div className="mb-3 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{error}</div>
      )}
      {showAdd && (
        <div className="mb-4 max-h-64 overflow-y-auto rounded border border-void-line bg-void-raised/60 p-3">
          <div className="mono-label mb-2">ORGANIZATION MEMBERS</div>
          {users
            .filter((u) => !existingIds.has(u.user.id))
            .slice(0, 20)
            .map((u) => (
              <div key={u.user.id} className="flex items-center justify-between py-1.5">
                <span className="truncate font-mono text-xs text-slate-200">
                  {u.user.displayName} <span className="text-slate-tech/60">· {u.user.email}</span>
                </span>
                <select defaultValue="CONTRIBUTOR" onChange={(e) => void add(u.user.id, e.target.value)} className="tech-input w-auto py-1 text-xs">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
        </div>
      )}
      {query.isLoading ? (
        <Spinner label="Reading members" />
      ) : members.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest text-slate-tech/70">No members</p>
      ) : (
        <div className="space-y-1">
          {members.map((m) => {
            const user = m.user as { id: string; displayName: string; email: string };
            return (
              <div key={String(m.id)} className="flex items-center gap-3 rounded border border-void-line/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">{user.displayName}</span>
                <span className="hidden font-mono text-[10px] text-slate-tech/70 md:inline">{user.email}</span>
                <StatusBadge tone={m.role === 'LEAD' ? 'signal' : 'neutral'}>{String(m.role)}</StatusBadge>
                <button
                  type="button"
                  aria-label="Remove member"
                  onClick={() => void remove(user.id)}
                  className="text-slate-tech/50 hover:text-danger"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}