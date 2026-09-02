import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PERMISSION_CACHE_KEY,
  PERMISSION_KEYS,
  ensurePermissionsLoaded,
  fetchPermissionsFromDb,
  getAllCachedRolePermissions,
  getAllCachedRolePermissionsSync,
  getCachedRolePermissions,
  getCachedRolePermissionsSync,
  hasPermission,
  hasPermissionSync,
  invalidatePermissionCache,
  loadRolePermissionsFromDb,
  permissionCache,
  resetPermissionCache,
  setRolePermissionInCache,
} from '../src/auth/permissions.js';
import { ROLES } from '../src/auth/roles.js';
import type { Database } from '../src/db/client.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/db/default-permissions.js';

const defaultDbRows: { role: string; permission: string; createdAt: Date }[] = [];
for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
  for (const permission of perms) {
    defaultDbRows.push({ role, permission, createdAt: new Date() });
  }
}

const createFakeDb = (rows = defaultDbRows) =>
  ({
    select: () => ({
      from: async () => rows,
    }),
  }) as unknown as Database;

describe('role permissions', () => {
  beforeEach(async () => {
    resetPermissionCache();
    await loadRolePermissionsFromDb(createFakeDb());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defines every role and only known permission keys in default permissions', () => {
    expect(Object.keys(DEFAULT_ROLE_PERMISSIONS).sort()).toEqual([...ROLES].sort());
    const known = new Set(PERMISSION_KEYS);
    for (const permissions of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      for (const permission of permissions) expect(known.has(permission)).toBe(true);
    }
  });

  it('grants all permissions to the admin role in baseline', async () => {
    for (const key of PERMISSION_KEYS) {
      expect(await hasPermission('admin', key)).toBe(true);
      expect(hasPermissionSync('admin', key)).toBe(true);
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
  ] as const)('%s permission for %s is %s', async (role, permission, expected) => {
    expect(await hasPermission(role, permission)).toBe(expected);
    expect(hasPermissionSync(role, permission)).toBe(expected);
  });

  describe('in-memory cache and dynamic updates', () => {
    it('allows toggling permissions in real-time in memory', async () => {
      expect(await hasPermission('operationwrite', 'operation.create')).toBe(true);
      setRolePermissionInCache('operationwrite', 'operation.create', false);
      expect(await hasPermission('operationwrite', 'operation.create')).toBe(false);
      expect(hasPermissionSync('operationwrite', 'operation.create')).toBe(false);

      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(await hasPermission('guest', 'mapSnapshot.list')).toBe(true);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);
    });

    it('clears cache on resetPermissionCache and requires reloading from DB', async () => {
      expect(hasPermissionSync('admin', 'operation.create')).toBe(true);
      resetPermissionCache();
      expect(() => hasPermissionSync('guest', 'mapSnapshot.list')).toThrow(
        /Permissions cache is empty or uninitialized/i,
      );

      const reloaded = await ensurePermissionsLoaded(createFakeDb());
      expect(reloaded).toBeDefined();
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(false);
    });

    it('retrieves cached permissions for single and all roles synchronously and asynchronously', async () => {
      const adminPermsSync = getCachedRolePermissionsSync('admin');
      expect(adminPermsSync.size).toBe(PERMISSION_KEYS.length);

      const adminPermsAsync = await getCachedRolePermissions('admin');
      expect(adminPermsAsync.size).toBe(PERMISSION_KEYS.length);

      const allPermsSync = getAllCachedRolePermissionsSync();
      expect(Object.keys(allPermsSync).sort()).toEqual([...ROLES].sort());
      expect(allPermsSync.guest.has('mapSnapshot.list')).toBe(false);

      const allPermsAsync = await getAllCachedRolePermissions();
      expect(Object.keys(allPermsAsync).sort()).toEqual([...ROLES].sort());
      expect(allPermsAsync.guest.has('mapSnapshot.list')).toBe(false);
    });

    it('supports invalidating permission cache and ensuring permissions reload', async () => {
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);

      invalidatePermissionCache();
      const reloaded = await ensurePermissionsLoaded(createFakeDb());
      expect(reloaded).toBeDefined();
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(false);
    });
  });

  describe('LRUCache TTL, single-flight deduplication, and stale fallback', () => {
    it('returns permissions from memory on cache hit within TTL without querying database', async () => {
      let queryCount = 0;
      const fakeDb = {
        select: () => ({
          from: async (_table: any) => {
            queryCount++;
            return [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
          },
        }),
      } as any;

      // Force load to warm cache
      await ensurePermissionsLoaded(fakeDb, true);
      expect(queryCount).toBe(1);

      // Subsequent lookups within TTL should hit cache
      expect(await hasPermission('guest', 'mapSnapshot.list', fakeDb)).toBe(true);
      expect(await hasPermission('guest', 'operation.create', fakeDb)).toBe(false);
      expect(await getCachedRolePermissions('guest', fakeDb)).toEqual(new Set(['mapSnapshot.list']));
      expect(await getAllCachedRolePermissions(fakeDb)).toBeDefined();

      // Database should not have been queried again
      expect(queryCount).toBe(1);
    });

    it('deduplicates concurrent re-fetch calls into a single database query', async () => {
      let queryCount = 0;
      const fakeDb = {
        select: () => ({
          from: async () => {
            queryCount++;
            await new Promise((resolve) => setTimeout(resolve, 15));
            return [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
          },
        }),
      } as any;

      invalidatePermissionCache();

      // Fire 10 concurrent requests
      const results = await Promise.all(
        Array.from({ length: 10 }, () => hasPermission('guest', 'mapSnapshot.list', fakeDb)),
      );

      expect(queryCount).toBe(1);
      for (const res of results) {
        expect(res).toBe(true);
      }
    });

    it('reloads permissions from database after TTL expires', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout'] });

      let dbRows = [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
      let queryCount = 0;
      const fakeDb = {
        select: () => ({
          from: async () => {
            queryCount++;
            return dbRows;
          },
        }),
      } as any;

      // Force initial load
      await ensurePermissionsLoaded(fakeDb, true);
      expect(queryCount).toBe(1);
      expect(await hasPermission('guest', 'mapSnapshot.list', fakeDb)).toBe(true);
      expect(await hasPermission('guest', 'access.create', fakeDb)).toBe(false);

      // Simulate external DB mutation by another instance
      dbRows = [
        { role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() },
        { role: 'guest', permission: 'access.create', createdAt: new Date() },
      ];

      // Within TTL (< 60s), still returns cached permissions without DB query
      vi.advanceTimersByTime(30_000);
      expect(await hasPermission('guest', 'access.create', fakeDb)).toBe(false);
      expect(queryCount).toBe(1);

      // Advance time beyond TTL (60,000ms + 1,000ms = 61s)
      vi.advanceTimersByTime(31_000);

      // Next call after TTL expiration re-fetches from DB
      expect(await hasPermission('guest', 'access.create', fakeDb)).toBe(true);
      expect(queryCount).toBe(2);
    });

    it('simulates multi-instance synchronization when another server modifies DB', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout'] });

      let dbRows: Array<{ role: string; permission: string; createdAt: Date }> = [
        { role: 'organization', permission: 'access.byId', createdAt: new Date() },
      ];
      let queryCount = 0;
      const fakeDb = {
        select: () => ({
          from: async () => {
            queryCount++;
            return dbRows;
          },
        }),
      } as any;

      // Instance A / B initial fetch
      await ensurePermissionsLoaded(fakeDb, true);
      expect(queryCount).toBe(1);
      expect(await hasPermission('organization', 'access.byId', fakeDb)).toBe(true);
      expect(await hasPermission('organization', 'mapSnapshot.byId', fakeDb)).toBe(false);

      // Remote instance writes new permission to shared DB
      dbRows = [
        { role: 'organization', permission: 'access.byId', createdAt: new Date() },
        { role: 'organization', permission: 'mapSnapshot.byId', createdAt: new Date() },
      ];

      // Local instance does not see update immediately while TTL is unexpired
      expect(await hasPermission('organization', 'mapSnapshot.byId', fakeDb)).toBe(false);
      expect(queryCount).toBe(1);

      // After TTL expires (60s), local instance automatically re-fetches and synchronizes
      vi.advanceTimersByTime(61_000);
      expect(await hasPermission('organization', 'mapSnapshot.byId', fakeDb)).toBe(true);
      expect(queryCount).toBe(2);
    });

    it('supports force refresh to bypass TTL immediately', async () => {
      let dbRows = [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
      let queryCount = 0;
      const fakeDb = {
        select: () => ({
          from: async () => {
            queryCount++;
            return dbRows;
          },
        }),
      } as any;

      await ensurePermissionsLoaded(fakeDb, true);
      expect(queryCount).toBe(1);

      // DB changes immediately
      dbRows = [{ role: 'guest', permission: 'journal.byId', createdAt: new Date() }];

      // Normal call within TTL still uses cache
      expect(await hasPermission('guest', 'journal.byId', fakeDb)).toBe(false);
      expect(queryCount).toBe(1);

      // Forced refresh queries DB immediately
      await ensurePermissionsLoaded(fakeDb, true);
      expect(queryCount).toBe(2);
      expect(await hasPermission('guest', 'journal.byId', fakeDb)).toBe(true);
    });

    it('falls back gracefully to stale cache when DB query throws', async () => {
      const initialDb = createFakeDb([
        { role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() },
      ]);
      await ensurePermissionsLoaded(initialDb, true);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);

      const failingDb = {
        select: () => ({
          from: async () => {
            throw new Error('Database connection failure');
          },
        }),
      } as any;

      // Force refresh on failing DB falls back gracefully to stale cache
      const permissionsMap = await ensurePermissionsLoaded(failingDb, true);
      expect(permissionsMap).toBeDefined();
      expect(await hasPermission('guest', 'mapSnapshot.list', failingDb)).toBe(true);
    });

    it('throws error and fails fast if database table is empty or unseeded', async () => {
      resetPermissionCache();

      const emptyDb = {
        select: () => ({
          from: async () => [],
        }),
      } as any;

      await expect(ensurePermissionsLoaded(emptyDb, true)).rejects.toThrow(
        /Role permissions table is empty or unseeded/i,
      );
      await expect(fetchPermissionsFromDb(emptyDb)).rejects.toThrow(
        /Role permissions table is empty or unseeded/i,
      );
    });

    it('throws error if failing DB without stale cache', async () => {
      resetPermissionCache();

      const failingDb = {
        select: () => ({
          from: async () => {
            throw new Error('DB Down');
          },
        }),
      } as any;

      await expect(ensurePermissionsLoaded(failingDb, true)).rejects.toThrow('DB Down');
    });

    it('always preserves full admin permissions regardless of database contents', async () => {
      const restrictedDb = {
        select: () => ({
          from: async () => [
            { role: 'organization', permission: 'operation.byId', createdAt: new Date() },
          ],
        }),
      } as any;

      await ensurePermissionsLoaded(restrictedDb, true);

      // Admin has every single permission key regardless of DB content
      for (const key of PERMISSION_KEYS) {
        expect(await hasPermission('admin', key, restrictedDb)).toBe(true);
        expect(hasPermissionSync('admin', key)).toBe(true);
      }

      const adminPerms = await getCachedRolePermissions('admin', restrictedDb);
      expect(adminPerms.size).toBe(PERMISSION_KEYS.length);
    });
  });
});
