import type { Permission, Role } from './types';

/**
 * Shape of the authenticated principal after token verification.
 * The API derives this from the DB membership row on every request
 * (never from client input) so role/permission changes apply immediately.
 */
export interface SessionPrincipal {
  userId: string;
  organizationId: string;
  /** Current workspace (membership activeWorkspace; may be null). */
  workspaceId: string | null;
  role: Role;
}

export interface DecodedSession {
  sub: string; // userId
  sid: string; // random session id (server-held, revocable)
  /** Current membership snapshot, refreshed by the server. */
  principal: SessionPrincipal;
}

/** What the API attaches to an authenticated request after guard evaluation. */
export interface AuthenticatedRequest {
  /** Session token that was validated. */
  session: DecodedSession;
  /** Resolved, up-to-date (server-read) principal for this request. */
  principal: SessionPrincipal & { permissions: Permission[] };
}

export interface LoginResponse {
  accessToken: string;
  session: SessionPrincipal & { permissions: Permission[] };
}