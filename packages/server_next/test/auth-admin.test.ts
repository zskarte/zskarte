import { beforeEach, describe, expect, it } from 'vitest';
import {
  BASELINE_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
  getAllCachedRolePermissions,
  getCachedRolePermissions,
  hasPermission,
  loadRolePermissionsFromDb,
  resetPermissionCache,
  setRolePermissionInCache,
} from '../src/auth/permissions.js';
import { ROLES, isRole } from '../src/auth/roles.js';
import { rolePermissions } from '../src/db/auth-schema.js';
import type { Database } from '../src/db/client.js';

describe('auth admin role & permissions', () => {
  beforeEach(() => {
    resetPermissionCache();
  });

  describe('ROLES definition', () => {
    it('includes admin in ROLES list and isRole correctly identifies it', () => {
      expect(ROLES).toContain('admin');
      expect(isRole('admin')).toBe(true);
      expect(isRole('organization')).toBe(true);
      expect(isRole('invalid_role')).toBe(false);
      expect(isRole(123)).toBe(false);
    });
  });

  describe('rolePermissions schema', () => {
    it('defines role_permissions table structure with primary key columns', () => {
      expect(rolePermissions).toBeDefined();
      expect(rolePermissions.role).toBeDefined();
      expect(rolePermissions.permission).toBeDefined();
      expect(rolePermissions.createdAt).toBeDefined();
    });
  });

  describe('admin permissions matrix', () => {
    it('contains all PERMISSION_KEYS for admin role in baseline and cannot be modified', () => {
      const adminPerms = BASELINE_ROLE_PERMISSIONS.admin;
      expect(adminPerms.size).toBe(PERMISSION_KEYS.length);
      for (const key of PERMISSION_KEYS) {
        expect(adminPerms.has(key)).toBe(true);
        expect(hasPermission('admin', key)).toBe(true);
      }

      // Admin permissions remain hardcoded and fixed even if attempted to disable
      setRolePermissionInCache('admin', 'operation.create', false);
      expect(hasPermission('admin', 'operation.create')).toBe(true);
    });

    it('reflects dynamic modifications in cache for non-admin roles', () => {
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);

      setRolePermissionInCache('guest', 'mapSnapshot.list', false);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
    });
  });

  describe('DB-backed permission resolution (loadRolePermissionsFromDb)', () => {
    it('populates cache from DB rows while preserving all fixed admin permissions', async () => {
      const fakeDb = {
        select: () => ({
          from: async () => [
            { role: 'admin', permission: 'operation.byId', createdAt: new Date() },
            { role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() },
          ],
        }),
      } as unknown as Database;

      await loadRolePermissionsFromDb(fakeDb);

      expect(hasPermission('admin', 'operation.byId')).toBe(true);
      expect(hasPermission('admin', 'operation.create')).toBe(true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);
      expect(hasPermission('guest', 'operation.byId')).toBe(false);
    });

    it('resets to baseline when DB returns no rows', async () => {
      // Modify cache first
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);

      const emptyDb = {
        select: () => ({
          from: async () => [],
        }),
      } as unknown as Database;

      await loadRolePermissionsFromDb(emptyDb);

      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      expect(hasPermission('admin', 'operation.create')).toBe(true);
    });
  });
});
