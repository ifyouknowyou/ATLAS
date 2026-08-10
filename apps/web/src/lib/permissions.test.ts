import { describe, expect, it } from '@jest/globals';
import { permissionsForRole, ROLES, PERMISSIONS, can } from '@atlas/shared';

describe('shared permission matrix (frontend view)', () => {
  it('exposes the same five roles', () => {
    expect(ROLES).toHaveLength(5);
  });

  it('VIEWER may only read', () => {
    const viewer = permissionsForRole('VIEWER');
    expect(can(viewer, 'entity.read')).toBe(true);
    expect(can(viewer, 'entity.create')).toBe(false);
    expect(can(viewer, 'investigation.create')).toBe(false);
  });

  it('INVESTIGATOR and ANALYST can create but never delete', () => {
    for (const role of ['INVESTIGATOR', 'ANALYST'] as const) {
      const granted = permissionsForRole(role);
      expect(can(granted, 'entity.create')).toBe(true);
      expect(can(granted, 'investigation.delete')).toBe(false);
      expect(can(granted, 'members.manage')).toBe(false);
    }
  });

  it('every permission is represented by at least one role', () => {
    const union = new Set<string>();
    ROLES.forEach((role) => permissionsForRole(role).forEach((p) => union.add(p)));
    PERMISSIONS.forEach((p) => expect(union.has(p)).toBe(true));
  });
});