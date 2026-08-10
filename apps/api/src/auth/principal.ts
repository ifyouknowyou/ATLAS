import { Request } from 'express';
import type {
  Permission,
  Role,
} from '@atlas/shared';

/** Resolved, up-to-date identity attached by AuthGuard after validation. */
export interface AuthenticatedPrincipal {
  userId: string;
  organizationId: string;
  /** Current workspace (membership activeWorkspace, may be null). */
  workspaceId: string | null;
  role: Role;
  /** Freshly recomputed from the membership row — never from the token. */
  permissions: Permission[];
}

/** Decoded session token payload (populated by AuthGuard). */
export interface SessionPayload {
  sub: string;
  sid: string;
  oid: string;
}

/** Express request augmented with the authenticated principal. */
export interface AuthenticatedRequest extends Request {
  principal: AuthenticatedPrincipal;
  sessionPayload?: SessionPayload;
}