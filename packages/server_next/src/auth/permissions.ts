import { LRUCache } from 'lru-cache';
import { rolePermissions } from '../db/auth-schema.js';
import type { Database } from '../db/client.js';
import { db as defaultDb } from '../db/client.js';
import { env } from '../env.js';
import { logger } from '../lib/logger.js';
import { ROLES, type Role } from './roles.js';

export const PERMISSION_KEYS = [
  'access.byId',
  'access.create',
  'access.delete',
  'access.generate',
  'access.list',
  'access.update',
  'journal.byId',
  'journal.byNumber',
  'journal.create',
  'journal.list',
  'journal.update',
  'mapLayer.byId',
  'mapLayer.create',
  'mapLayer.delete',
  'mapLayer.list',
  'mapLayer.update',
  'mapSnapshot.byId',
  'mapSnapshot.list',
  'operation.archive',
  'operation.byId',
  'operation.create',
  'operation.list',
  'operation.overview',
  'operation.patch',
  'operation.publishCurrentLocation',
  'operation.shadowDelete',
  'operation.submitChangeset',
  'operation.unarchive',
  'operation.updateMapLayers',
  'operation.updateMeta',
  'organization.current',
  'organization.forLogin',
  'organization.updateJournalEntryTemplate',
  'organization.updateLayerSettings',
  'organization.updateSettings',
  'wmsSource.byId',
  'wmsSource.create',
  'wmsSource.delete',
  'wmsSource.list',
  'wmsSource.update',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type RolePermissionMap = Map<Role, Set<PermissionKey>>;

export interface PermissionFetchContext {
  db?: Database;
}

export const fetchPermissionsFromDb = async (db: Database): Promise<RolePermissionMap> => {
  const rows = await db.select().from(rolePermissions);
  if (rows.length === 0) {
    throw new Error(
      'Role permissions table is empty or unseeded. Run database seeding before starting the server.',
    );
  }

  const newMap: RolePermissionMap = new Map();
  for (const role of ROLES) {
    newMap.set(role, new Set());
  }
  for (const row of rows) {
    const role = row.role as Role;
    const perm = row.permission as PermissionKey;
    if (newMap.has(role) && (PERMISSION_KEYS as readonly string[]).includes(perm)) {
      newMap.get(role)!.add(perm);
    }
  }
  newMap.set('admin', new Set(PERMISSION_KEYS));
  return newMap;
};

export const PERMISSION_CACHE_KEY = 'permissions';

export const permissionCache = new LRUCache<string, RolePermissionMap, PermissionFetchContext>({
  max: 1,
  ttl: env.PERMISSION_CACHE_TTL_MS,
  ttlResolution: 0,
  perf: { now: () => Math.max(1, performance.now()) },
  fetchMethod: async (_key, staleValue, { context }) => {
    const db = context?.db ?? defaultDb;
    if (!db) {
      if (staleValue) {
        logger.warn('No database available during permissions refresh, using stale cache');
        return staleValue;
      }
      throw new Error('Database client is not initialized and no stale permission cache exists.');
    }
    try {
      return await fetchPermissionsFromDb(db);
    } catch (err) {
      if (staleValue) {
        logger.warn({ err }, 'Failed to refresh role permissions from database, using stale fallback');
        return staleValue;
      }
      logger.error({ err }, 'Failed to load role permissions from database');
      throw err;
    }
  },
});

export const resetPermissionCache = (): void => {
  permissionCache.clear();
};

export const invalidatePermissionCache = (): void => {
  permissionCache.delete(PERMISSION_CACHE_KEY);
};

export const ensurePermissionsLoaded = async (db?: Database, force = false): Promise<RolePermissionMap> => {
  const result = await permissionCache.fetch(PERMISSION_CACHE_KEY, {
    context: { db },
    forceRefresh: force,
  });
  if (!result) {
    throw new Error('Failed to load role permissions from database.');
  }
  return result;
};

export const hasPermission = async (role: Role, permission: PermissionKey, db?: Database): Promise<boolean> => {
  if (role === 'admin') {
    return true;
  }
  const map = await ensurePermissionsLoaded(db);
  return map.get(role)?.has(permission) ?? false;
};

export const hasPermissionSync = (role: Role, permission: PermissionKey): boolean => {
  if (role === 'admin') {
    return true;
  }
  const currentMap = permissionCache.get(PERMISSION_CACHE_KEY);
  if (!currentMap) {
    throw new Error(
      'Permissions cache is empty or uninitialized. Ensure permissions are loaded from the database before calling hasPermissionSync.',
    );
  }
  return currentMap.get(role)?.has(permission) ?? false;
};

export const setRolePermissionInCache = (role: Role, permission: PermissionKey, enabled: boolean): void => {
  if (role === 'admin') {
    return;
  }
  const currentMap = permissionCache.get(PERMISSION_CACHE_KEY);
  if (!currentMap) {
    return;
  }
  let rolePerms = currentMap.get(role);
  if (!rolePerms) {
    rolePerms = new Set();
    currentMap.set(role, rolePerms);
  }
  if (enabled) {
    rolePerms.add(permission);
  } else {
    rolePerms.delete(permission);
  }
};

export const getCachedRolePermissionsSync = (role: Role): ReadonlySet<PermissionKey> => {
  if (role === 'admin') {
    return new Set(PERMISSION_KEYS);
  }
  const currentMap = permissionCache.get(PERMISSION_CACHE_KEY);
  if (!currentMap) {
    throw new Error(
      'Permissions cache is empty or uninitialized. Ensure permissions are loaded from the database before calling getCachedRolePermissionsSync.',
    );
  }
  return currentMap.get(role) ?? new Set();
};

export const getCachedRolePermissions = async (role: Role, db?: Database): Promise<ReadonlySet<PermissionKey>> => {
  if (role === 'admin') {
    return new Set(PERMISSION_KEYS);
  }
  const map = await ensurePermissionsLoaded(db);
  return map.get(role) ?? new Set();
};

export const getAllCachedRolePermissionsSync = (): Record<Role, ReadonlySet<PermissionKey>> => {
  const currentMap = permissionCache.get(PERMISSION_CACHE_KEY);
  if (!currentMap) {
    throw new Error(
      'Permissions cache is empty or uninitialized. Ensure permissions are loaded from the database before calling getAllCachedRolePermissionsSync.',
    );
  }
  const result = {} as Record<Role, ReadonlySet<PermissionKey>>;
  for (const role of ROLES) {
    result[role] = role === 'admin' ? new Set(PERMISSION_KEYS) : (currentMap.get(role) ?? new Set());
  }
  return result;
};

export const getAllCachedRolePermissions = async (db?: Database): Promise<Record<Role, ReadonlySet<PermissionKey>>> => {
  const map = await ensurePermissionsLoaded(db);
  const result = {} as Record<Role, ReadonlySet<PermissionKey>>;
  for (const role of ROLES) {
    result[role] = role === 'admin' ? new Set(PERMISSION_KEYS) : (map.get(role) ?? new Set());
  }
  return result;
};

export const loadRolePermissionsFromDb = async (db: Database): Promise<void> => {
  const map = await fetchPermissionsFromDb(db);
  permissionCache.set(PERMISSION_CACHE_KEY, map);
};
