import { permissionsForRole, type Role } from '@atlas/shared';
import { useAuth } from './auth-store';
import { api } from './api-client';

jest.mock('./api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.setState({
      token: null,
      principal: null,
      hydrated: false,
      sessionError: null,
    });
  });

  it('has()/anyOf() reflect the server-provided permission snapshot', () => {
    seed('VIEWER');
    const state = useAuth.getState();
    expect(state.has('entity.read')).toBe(true);
    expect(state.has('entity.create')).toBe(false);
    expect(state.anyOf(['entity.create', 'entity.read'])).toBe(true);
    expect(state.anyOf(['entity.create', 'workspace.manage'])).toBe(false);
  });

  it('automatically starts a demo session without asking for credentials', async () => {
    jest.mocked(api.post).mockResolvedValueOnce({
      accessToken: 'demo-token',
      session: {
        userId: 'demo-owner',
        organizationId: 'demo-org',
        workspaceId: 'demo-workspace',
        role: 'OWNER',
        permissions: [...permissionsForRole('OWNER')],
      },
    });

    await useAuth.getState().refreshSession();

    expect(api.post).toHaveBeenCalledWith('/auth/demo-session', {});
    expect(useAuth.getState()).toMatchObject({
      token: 'demo-token',
      principal: {
        userId: 'demo-owner',
        organizationId: 'demo-org',
        role: 'OWNER',
      },
      hydrated: true,
      sessionError: null,
    });
  });
});