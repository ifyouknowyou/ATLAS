import { render, screen } from '@testing-library/react';
import { permissionsForRole, type Role } from '@atlas/shared';
import { Sidebar } from './Sidebar';
import { useAuth, type SessionPrincipal } from '@/lib/auth-store';

jest.mock('next/navigation', () => ({
  usePathname: () => '/overview',
}));

function principalFor(role: Role): SessionPrincipal {
  return {
    userId: 'u1',
    organizationId: 'o1',
    workspaceId: 'w1',
    role,
    permissions: [...permissionsForRole(role)],
  };
}

describe('Sidebar (permission-aware navigation)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ hydrated: true, token: 't', principal: null });
  });

  it('hides Settings from a VIEWER (no settings.manage)', () => {
    useAuth.setState({ principal: principalFor('VIEWER') });
    render(<Sidebar />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('shows intelligence entries the VIEWER can read', () => {
    useAuth.setState({ principal: principalFor('VIEWER') });
    render(<Sidebar />);
    for (const label of ['Overview', 'Investigations', 'Entities']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('shows Settings to an OWNER', () => {
    useAuth.setState({ principal: principalFor('OWNER') });
    render(<Sidebar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});