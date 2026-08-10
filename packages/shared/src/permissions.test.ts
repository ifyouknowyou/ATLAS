import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { PERMISSIONS, ROLES } from './types';
import { can, domainOf, permissionsForRole } from './permissions';

describe('permissionsForRole', () => {
  it('grants every permission to OWNER and ADMIN', () => {
    for (const role of ['OWNER', 'ADMIN'] as const) {
      assert.deepEqual(permissionsForRole(role), PERMISSIONS);
    }
  });

  it('grants only READ permissions to VIEWER', () => {
    const viewer = permissionsForRole('VIEWER');
    assert.ok(can(viewer, 'investigation.read'));
    assert.ok(can(viewer, 'entity.read'));
    assert.ok(can(viewer, 'evidence.read'));
    assert.ok(can(viewer, 'report.read'));
    assert.ok(!can(viewer, 'investigation.create'));
    assert.ok(!can(viewer, 'members.manage'));
    assert.ok(!can(viewer, 'settings.manage'));
  });

  it('never grants delete to non-admin roles', () => {
    for (const role of ['ANALYST', 'INVESTIGATOR', 'VIEWER'] as const) {
      const granted = permissionsForRole(role);
      assert.ok(!can(granted, 'investigation.delete'), `${role} must not delete investigations`);
      assert.ok(!can(granted, 'entity.delete'), `${role} must not delete entities`);
      assert.ok(!can(granted, 'workspace.manage'), `${role} must not manage workspaces`);
    }
  });

  it('returns a fresh array on every call (no shared mutation)', () => {
    const a = permissionsForRole('ANALYST');
    const b = permissionsForRole('ANALYST');
    assert.notStrictEqual(a, b);
  });

  it('covers every declared role and permission', () => {
    for (const role of ROLES) permissionsForRole(role);
    for (const permission of PERMISSIONS) domainOf(permission);
  });
});