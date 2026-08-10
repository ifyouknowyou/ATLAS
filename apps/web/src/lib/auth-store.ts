import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse, Permission } from '@atlas/shared';
import { api } from './api-client';

/**
 * Client session store. Holds the opaque access token + the permission-ful
 * principal returned by the server. This is UX state only — every protected
 * operation is re-authorized server-side.
 *
 * Phase 7 hardening: move to HttpOnly SameSite cookies via a same-origin proxy
 * so tokens never live in localStorage.
 */
export interface SessionPrincipal {
  userId: string;
  organizationId: string;
  workspaceId: string | null;
  role: string;
  permissions: Permission[];
}

interface AuthState {
  token: string | null;
  principal: SessionPrincipal | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  has: (permission: Permission) => boolean;
  anyOf: (permissions: Permission[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      principal: null,
      hydrated: false,

      async login(email, password) {
        const response = await api.post<LoginResponse>('/auth/login', {
          email,
          password,
        });
        set({
          token: response.accessToken,
          principal: {
            userId: response.session.userId,
            organizationId: response.session.organizationId,
            workspaceId: response.session.workspaceId,
            role: response.session.role,
            permissions: response.session.permissions,
          },
        });
      },

      /** Re-resolve the principal from the API so role changes apply at once. */
      async refreshSession() {
        const token = get().token;
        if (!token) {
          set({ principal: null, hydrated: true });
          return;
        }
        try {
          const { session } = await api.get<{ session: SessionPrincipal }>(
            '/auth/session',
            token,
          );
          set({ principal: session, hydrated: true });
        } catch {
          set({ token: null, principal: null, hydrated: true });
        }
      },

      async logout() {
        const token = get().token;
        if (token) {
          await api.post('/auth/logout', {}, token).catch(() => undefined);
        }
        set({ token: null, principal: null });
      },

      has(permission) {
        return get().principal?.permissions.includes(permission) ?? false;
      },

      anyOf(permissions) {
        return permissions.some((p) => get().has(p));
      },
    }),
    {
      name: 'atlas.session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        principal: state.principal,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark client-state hydrated after localStorage rehydration so
        // RouteGuard doesn't flash the login page.
        useAuth.setState({ hydrated: true });
        return state;
      },
    },
  ),
);