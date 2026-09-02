import { beforeEach, describe, expect, it } from 'vitest';
import {
  PERMISSION_KEYS,
  getAllCachedRolePermissions,
  getAllCachedRolePermissionsSync,
  getCachedRolePermissions,
  getCachedRolePermissionsSync,
  hasPermission,
  hasPermissionSync,
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
    it('contains all PERMISSION_KEYS for admin role and cannot be modified', async () => {
      const fakeDb = {
        select: () => ({
          from: async () => [
            { role: 'admin', permission: 'operation.byId', createdAt: new Date() },
            { role: 'organization', permission: 'operation.byId', createdAt: new Date() },
          ],
        }),
      } as unknown as Database;

      await loadRolePermissionsFromDb(fakeDb);

      for (const key of PERMISSION_KEYS) {
        expect(await hasPermission('admin', key)).toBe(true);
        expect(hasPermissionSync('admin', key)).toBe(true);
      }

      // Admin permissions remain hardcoded and fixed even if attempted to disable
      setRolePermissionInCache('admin', 'operation.create', false);
      expect(await hasPermission('admin', 'operation.create')).toBe(true);
      expect(hasPermissionSync('admin', 'operation.create')).toBe(true);
    });

    it('reflects dynamic modifications in cache for non-admin roles', async () => {
      const fakeDb = {
        select: () => ({
          from: async () => [
            { role: 'guest', permission: 'journal.byId', createdAt: new Date() },
          ],
        }),
      } as unknown as Database;
      await loadRolePermissionsFromDb(fakeDb);

      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(false);
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(true);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);

      setRolePermissionInCache('guest', 'mapSnapshot.list', false);
      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(false);
    });
  });

  describe('DB-backed permission resolution (loadRolePermissionsFromDb & ensurePermissionsLoaded)', () => {
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

      expect(await hasPermission('admin', 'operation.byId')).toBe(true);
      expect(await hasPermission('admin', 'operation.create')).toBe(true);
      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(true);
      expect(await hasPermission('guest', 'operation.byId')).toBe(false);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);
      expect(hasPermissionSync('guest', 'operation.byId')).toBe(false);
    });

    it('throws when DB returns no rows (empty or unseeded)', async () => {
      const emptyDb = {
        select: () => ({
          from: async () => [],
        }),
      } as unknown as Database;

      await expect(loadRolePermissionsFromDb(emptyDb)).rejects.toThrow(
        /Role permissions table is empty or unseeded/i,
      );
    });

    it('retrieves cached role permissions accurately through sync and async helpers', async () => {
      const fakeDb = {
        select: () => ({
          from: async () => [
            { role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() },
          ],
        }),
      } as unknown as Database;
      await loadRolePermissionsFromDb(fakeDb);

      const guestPermsAsync = await getCachedRolePermissions('guest');
      const guestPermsSync = getCachedRolePermissionsSync('guest');
      expect(guestPermsAsync).toEqual(guestPermsSync);
      expect(guestPermsSync.has('mapSnapshot.list')).toBe(true);

      const allPermsAsync = await getAllCachedRolePermissions();
      const allPermsSync = getAllCachedRolePermissionsSync();
      expect(allPermsAsync.guest).toEqual(allPermsSync.guest);
      expect(allPermsSync.guest.has('mapSnapshot.list')).toBe(true);
      expect(allPermsSync.admin.size).toBe(PERMISSION_KEYS.length);
    });
  });
});
