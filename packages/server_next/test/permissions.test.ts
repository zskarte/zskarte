import { describe, expect, it } from 'vitest';
import { PERMISSION_KEYS, ROLE_PERMISSIONS, hasPermission } from '../src/auth/permissions.js';
import { ROLES } from '../src/auth/roles.js';

describe('role permissions', () => {
  it('defines every role and only known permission keys', () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...ROLES].sort());
    const known = new Set(PERMISSION_KEYS);
    for (const permissions of Object.values(ROLE_PERMISSIONS)) {
      for (const permission of permissions) expect(known.has(permission)).toBe(true);
    }
  });

  it.each([
    ['organization', 'operation.patch', false],
    ['organization', 'organization.updateSettings', false],
    ['operationwrite', 'journal.create', true],
    ['operationwrite', 'operation.create', true],
    ['operationwrite', 'operation.submitChangeset', true],
    ['organization', 'operation.submitChangeset', true],
    ['operationread', 'journal.create', false],
    ['guest', 'mapSnapshot.list', false],
    ['public', 'organization.forLogin', true],
    ['public', 'operation.byId', false],
  ] as const)('%s permission for %s is %s', (role, permission, expected) => {
    expect(hasPermission(role, permission)).toBe(expected);
  });
});
