import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResponse, Permission } from '@atlas/shared';
import { api } from './api-client';

/** Client session store for the automatically initialized demo principal. */
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
  sessionError: string | null;
  refreshSession: () => Promise<void>;
  has: (permission: Permission) => boolean;
  anyOf: (permissions: Permission[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => {
      const establishDemoSession = async () => {
        const response = await api.post<LoginResponse>('/auth/demo-session', {});
        set({
          token: response.accessToken,
          principal: response.session,
          hydrated: true,
          sessionError: null,
        });
      };

      return {
        token: null,
        principal: null,
        hydrated: false,
        sessionError: null,

        async refreshSession() {
          const token = get().token;
          if (!token) {
            try {
              await establishDemoSession();
            } catch (error) {
              set({
                principal: null,
                hydrated: true,
                sessionError:
                  error instanceof Error
                    ? error.message
                    : 'Could not initialize the demo session',
              });
            }
            return;
          }
          try {
            const { session } = await api.get<{ session: SessionPrincipal }>(
              '/auth/session',
              token,
            );
            set({ principal: session, hydrated: true, sessionError: null });
          } catch {
            set({ token: null, principal: null });
            try {
              await establishDemoSession();
            } catch (error) {
              set({
                hydrated: true,
                sessionError:
                  error instanceof Error
                    ? error.message
                    : 'Could not initialize the demo session',
              });
            }
          }
        },

        has(permission) {
          return get().principal?.permissions.includes(permission) ?? false;
        },

        anyOf(permissions) {
          return permissions.some((p) => get().has(p));
        },
      };
    },
    {
      name: 'atlas.session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        principal: state.principal,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark client state hydrated after localStorage rehydration.
        useAuth.setState({ hydrated: true });
        return state;
      },
    },
  ),
);