import { beforeEach, describe, expect, it } from 'vitest';
import {
  BASELINE_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
  ROLE_PERMISSIONS,
  getAllCachedRolePermissions,
  getCachedRolePermissions,
  hasPermission,
  resetPermissionCache,
  setRolePermissionInCache,
} from '../src/auth/permissions.js';
import { ROLES } from '../src/auth/roles.js';

describe('role permissions', () => {
  beforeEach(() => {
    resetPermissionCache();
  });

  it('defines every role and only known permission keys', () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...ROLES].sort());
    expect(Object.keys(BASELINE_ROLE_PERMISSIONS).sort()).toEqual([...ROLES].sort());
    const known = new Set(PERMISSION_KEYS);
    for (const permissions of Object.values(ROLE_PERMISSIONS)) {
      for (const permission of permissions) expect(known.has(permission)).toBe(true);
    }
  });

  it('grants all permissions to the admin role in baseline', () => {
    for (const key of PERMISSION_KEYS) {
      expect(hasPermission('admin', key)).toBe(true);
    }
  });

  it.each([
    ['admin', 'operation.submitChangeset', true],
    ['admin', 'organization.updateSettings', true],
    ['organization', 'operation.submitChangeset', true],
    ['organization', 'operation.patch', false],
    ['organization', 'organization.updateSettings', false],
    ['operationwrite', 'operation.submitChangeset', true],
    ['operationwrite', 'journal.create', true],
    ['operationwrite', 'operation.create', true],
    ['operationread', 'operation.submitChangeset', false],
    ['operationread', 'journal.create', false],
    ['guest', 'operation.submitChangeset', false],
    ['guest', 'mapSnapshot.byId', false],
    ['guest', 'mapSnapshot.list', false],
    ['public', 'organization.forLogin', true],
    ['public', 'operation.byId', false],
    ['public', 'operation.submitChangeset', false],
  ] as const)('%s permission for %s is %s', (role, permission, expected) => {
    expect(hasPermission(role, permission)).toBe(expected);
  });

  describe('in-memory cache and dynamic updates', () => {
    it('allows toggling permissions in real-time in memory', () => {
      expect(hasPermission('operationwrite', 'operation.create')).toBe(true);
      setRolePermissionInCache('operationwrite', 'operation.create', false);
      expect(hasPermission('operationwrite', 'operation.create')).toBe(false);

      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);
    });

    it('resets cache back to baseline permissions', () => {
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);

      resetPermissionCache();
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
    });

    it('retrieves cached permissions for single and all roles', () => {
      const adminPerms = getCachedRolePermissions('admin');
      expect(adminPerms.size).toBe(PERMISSION_KEYS.length);

      const allPerms = getAllCachedRolePermissions();
      expect(Object.keys(allPerms).sort()).toEqual([...ROLES].sort());
      expect(allPerms.guest.has('mapSnapshot.list')).toBe(false);
    });
  });
});
