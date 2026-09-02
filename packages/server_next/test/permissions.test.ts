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
import { ROLES, isRole } from '../src/auth/roles.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/db/default-permissions.js';
import { logger } from '../src/lib/logger.js';
import { DEFAULT_ROLE_PERMISSION_ROWS } from './helpers/fixtures.js';
import { createMockDb } from './helpers/mock-db.js';

describe('role permissions', () => {
  beforeEach(async () => {
    resetPermissionCache();
    const { db } = createMockDb({ rows: DEFAULT_ROLE_PERMISSION_ROWS });
    await loadRolePermissionsFromDb(db);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('defines every role and correctly identifies them via isRole', () => {
    expect(Object.keys(DEFAULT_ROLE_PERMISSIONS).sort()).toEqual([...ROLES].sort());
    expect(ROLES).toContain('admin');
    expect(isRole('admin')).toBe(true);
    expect(isRole('organization')).toBe(true);
    expect(isRole('operationwrite')).toBe(true);
    expect(isRole('operationread')).toBe(true);
    expect(isRole('guest')).toBe(true);
    expect(isRole('public')).toBe(true);
    expect(isRole('invalid_role')).toBe(false);
    expect(isRole(123)).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it('defines only known permission keys in default permissions', () => {
    const known = new Set(PERMISSION_KEYS);
    for (const permissions of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      for (const permission of permissions) expect(known.has(permission)).toBe(true);
    }
  });

  it('grants all permissions to the admin role in baseline and prevents disabling them', async () => {
    for (const key of PERMISSION_KEYS) {
      expect(await hasPermission('admin', key)).toBe(true);
      expect(hasPermissionSync('admin', key)).toBe(true);
    }

    // Admin permissions remain hardcoded and fixed even if attempted to disable
    setRolePermissionInCache('admin', 'operation.create', false);
    expect(await hasPermission('admin', 'operation.create')).toBe(true);
    expect(hasPermissionSync('admin', 'operation.create')).toBe(true);
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

      const { db } = createMockDb({ rows: DEFAULT_ROLE_PERMISSION_ROWS });
      const reloaded = await ensurePermissionsLoaded(db);
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
      const { db } = createMockDb({ rows: DEFAULT_ROLE_PERMISSION_ROWS });
      const reloaded = await ensurePermissionsLoaded(db);
      expect(reloaded).toBeDefined();
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(false);
    });
  });

  describe('LRUCache TTL, single-flight deduplication, and stale fallback', () => {
    it('returns permissions from memory on cache hit within TTL without querying database', async () => {
      const { db, captured } = createMockDb({
        rows: [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }],
      });

      // Force load to warm cache
      await ensurePermissionsLoaded(db, true);
      expect(captured.selects.length).toBe(1);

      // Subsequent lookups within TTL should hit cache
      expect(await hasPermission('guest', 'mapSnapshot.list', db)).toBe(true);
      expect(await hasPermission('guest', 'operation.create', db)).toBe(false);
      expect(await getCachedRolePermissions('guest', db)).toEqual(new Set(['mapSnapshot.list']));
      expect(await getAllCachedRolePermissions(db)).toBeDefined();

      // Database should not have been queried again
      expect(captured.selects.length).toBe(1);
    });

    it('deduplicates concurrent re-fetch calls into a single database query', async () => {
      const { db, captured } = createMockDb({
        queryHandler: async () => {
          await new Promise((resolve) => setTimeout(resolve, 15));
          return [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
        },
      });

      invalidatePermissionCache();

      // Fire 10 concurrent requests
      const results = await Promise.all(
        Array.from({ length: 10 }, () => hasPermission('guest', 'mapSnapshot.list', db)),
      );

      expect(captured.selects.length).toBe(1);
      for (const res of results) {
        expect(res).toBe(true);
      }
    });

    it('reloads permissions from database after TTL expires', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout'] });

      let dbRows = [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
      const { db, captured } = createMockDb({
        queryHandler: () => dbRows,
      });

      // Force initial load
      await ensurePermissionsLoaded(db, true);
      expect(captured.selects.length).toBe(1);
      expect(await hasPermission('guest', 'mapSnapshot.list', db)).toBe(true);
      expect(await hasPermission('guest', 'access.create', db)).toBe(false);

      // Simulate external DB mutation by another instance
      dbRows = [
        { role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() },
        { role: 'guest', permission: 'access.create', createdAt: new Date() },
      ];

      // Within TTL (< 60s), still returns cached permissions without DB query
      vi.advanceTimersByTime(30_000);
      expect(await hasPermission('guest', 'access.create', db)).toBe(false);
      expect(captured.selects.length).toBe(1);

      // Advance time beyond TTL (60,000ms + 1,000ms = 61s)
      vi.advanceTimersByTime(31_000);

      // Next call after TTL expiration re-fetches from DB
      expect(await hasPermission('guest', 'access.create', db)).toBe(true);
      expect(captured.selects.length).toBe(2);
    });

    it('simulates multi-instance synchronization when another server modifies DB', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout'] });

      let dbRows = [{ role: 'organization', permission: 'access.byId', createdAt: new Date() }];
      const { db, captured } = createMockDb({
        queryHandler: () => dbRows,
      });

      // Instance A / B initial fetch
      await ensurePermissionsLoaded(db, true);
      expect(captured.selects.length).toBe(1);
      expect(await hasPermission('organization', 'access.byId', db)).toBe(true);
      expect(await hasPermission('organization', 'mapSnapshot.byId', db)).toBe(false);

      // Remote instance writes new permission to shared DB
      dbRows = [
        { role: 'organization', permission: 'access.byId', createdAt: new Date() },
        { role: 'organization', permission: 'mapSnapshot.byId', createdAt: new Date() },
      ];

      // Local instance does not see update immediately while TTL is unexpired
      expect(await hasPermission('organization', 'mapSnapshot.byId', db)).toBe(false);
      expect(captured.selects.length).toBe(1);

      // After TTL expires (60s), local instance automatically re-fetches and synchronizes
      vi.advanceTimersByTime(61_000);
      expect(await hasPermission('organization', 'mapSnapshot.byId', db)).toBe(true);
      expect(captured.selects.length).toBe(2);
    });

    it('supports force refresh to bypass TTL immediately', async () => {
      let dbRows = [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }];
      const { db, captured } = createMockDb({
        queryHandler: () => dbRows,
      });

      await ensurePermissionsLoaded(db, true);
      expect(captured.selects.length).toBe(1);

      // DB changes immediately
      dbRows = [{ role: 'guest', permission: 'journal.byId', createdAt: new Date() }];

      // Normal call within TTL still uses cache
      expect(await hasPermission('guest', 'journal.byId', db)).toBe(false);
      expect(captured.selects.length).toBe(1);

      // Forced refresh queries DB immediately
      await ensurePermissionsLoaded(db, true);
      expect(captured.selects.length).toBe(2);
      expect(await hasPermission('guest', 'journal.byId', db)).toBe(true);
    });

    it('falls back gracefully to stale cache when DB query throws', async () => {
      const { db: initialDb } = createMockDb({
        rows: [{ role: 'guest', permission: 'mapSnapshot.list', createdAt: new Date() }],
      });
      await ensurePermissionsLoaded(initialDb, true);
      expect(hasPermissionSync('guest', 'mapSnapshot.list')).toBe(true);

      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger as any);

      const { db: failingDb } = createMockDb({
        selectError: new Error('Database connection failure'),
      });

      // Force refresh on failing DB falls back gracefully to stale cache
      const permissionsMap = await ensurePermissionsLoaded(failingDb, true);
      expect(permissionsMap).toBeDefined();
      expect(await hasPermission('guest', 'mapSnapshot.list', failingDb)).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('throws error and fails fast if database table is empty or unseeded', async () => {
      resetPermissionCache();

      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger as any);
      const { db: emptyDb } = createMockDb({ rows: [] });

      await expect(ensurePermissionsLoaded(emptyDb, true)).rejects.toThrow(
        /Role permissions table is empty or unseeded/i,
      );
      await expect(fetchPermissionsFromDb(emptyDb)).rejects.toThrow(/Role permissions table is empty or unseeded/i);
      await expect(loadRolePermissionsFromDb(emptyDb)).rejects.toThrow(/Role permissions table is empty or unseeded/i);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('throws error if failing DB without stale cache', async () => {
      resetPermissionCache();

      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger as any);
      const { db: failingDb } = createMockDb({
        selectError: new Error('DB Down'),
      });

      await expect(ensurePermissionsLoaded(failingDb, true)).rejects.toThrow('DB Down');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('always preserves full admin permissions regardless of database contents', async () => {
      const { db: restrictedDb } = createMockDb({
        rows: [{ role: 'organization', permission: 'operation.byId', createdAt: new Date() }],
      });

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
