import type { Permission, Role } from './types';

/**
 * Central permission evaluation.
 *
 * The permission matrix lives here (shared between API enforcement and the
 * frontend's UX-only checks). The server is always the enforcement point —
 * role checks in UI are never a security boundary, only an affordance.
 */

const ALL: Permission[] = [
  'investigation.read',
  'investigation.create',
  'investigation.update',
  'investigation.delete',

  'entity.read',
  'entity.create',
  'entity.update',
  'entity.delete',

  'evidence.read',
  'evidence.create',
  'evidence.update',
  'evidence.delete',

  'report.read',
  'report.create',
  'report.publish',

  'workspace.manage',
  'members.manage',
  'settings.manage',
];

/** Default permission set granted to each role. */
const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: ALL,
  ADMIN: ALL,
  ANALYST: [
    'investigation.read',
    'investigation.create',
    'investigation.update',
    'entity.read',
    'entity.create',
    'entity.update',
    'evidence.read',
    'evidence.create',
    'report.read',
    'report.create',
  ],
  INVESTIGATOR: [
    'investigation.read',
    'entity.read',
    'entity.create',
    'entity.update',
    'evidence.read',
    'evidence.create',
    'evidence.update',
    'report.read',
    'report.create',
  ],
  VIEWER: [
    'investigation.read',
    'entity.read',
    'evidence.read',
    'report.read',
  ],
};

export function permissionsForRole(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/** Permission names are `domain.action` — derive the domain. */
export function domainOf(permission: Permission): string {
  return permission.split('.')[0] ?? permission;
}

export function can(
  granted: readonly Permission[],
  required: Permission,
): boolean {
  return granted.includes(required);
}