import { permissionsForRole, type Role } from '@atlas/shared';
import { useAuth } from './auth-store';

function seed(role: Role) {
  localStorage.clear();
  useAuth.setState({
    hydrated: true,
    token: 'tok',
    principal: {
      userId: 'u1',
      organizationId: 'o1',
      workspaceId: null,
      role,
      permissions: [...permissionsForRole(role)],
    },
  });
}

describe('auth-store', () => {
  it('has()/anyOf() reflect the server-provided permission snapshot', () => {
    seed('VIEWER');
    const state = useAuth.getState();
    expect(state.has('entity.read')).toBe(true);
    expect(state.has('entity.create')).toBe(false);
    expect(state.anyOf(['entity.create', 'entity.read'])).toBe(true);
    expect(state.anyOf(['entity.create', 'workspace.manage'])).toBe(false);
  });

  it('logout clears the stored credential snapshot', async () => {
    seed('OWNER');
    await useAuth.getState().logout();
    const state = useAuth.getState();
    expect(state.token).toBeNull();
    expect(state.principal).toBeNull();
  });
});