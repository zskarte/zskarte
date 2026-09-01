import type { Database } from '../db/client.js';
import { rolePermissions } from '../db/auth-schema.js';
import { type Role, ROLES } from './roles.js';

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

const permissions = <T extends readonly PermissionKey[]>(...values: T): ReadonlySet<PermissionKey> => new Set(values);

export const BASELINE_ROLE_PERMISSIONS: Record<Role, ReadonlySet<PermissionKey>> = {
  admin: permissions(...PERMISSION_KEYS),
  organization: permissions(
    'access.byId', 'access.create', 'access.delete', 'access.generate', 'access.list', 'access.update',
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.create', 'mapLayer.delete', 'mapLayer.list', 'mapLayer.update',
    'mapSnapshot.byId', 'mapSnapshot.list',
    'operation.archive', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.shadowDelete', 'operation.submitChangeset',
    'operation.unarchive', 'operation.updateMapLayers', 'operation.updateMeta',
    'organization.current', 'organization.updateJournalEntryTemplate', 'organization.updateLayerSettings',
    'wmsSource.byId', 'wmsSource.create', 'wmsSource.delete', 'wmsSource.list', 'wmsSource.update',
  ),
  guest: permissions(
    'access.delete', 'access.generate', 'access.list',
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.list',
    'operation.archive', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.shadowDelete', 'operation.unarchive',
    'operation.updateMapLayers', 'operation.updateMeta', 'organization.current', 'wmsSource.byId', 'wmsSource.list',
  ),
  operationwrite: permissions(
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.create', 'mapLayer.list', 'mapLayer.update',
    'mapSnapshot.byId', 'mapSnapshot.list', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.submitChangeset', 'operation.updateMapLayers',
    'organization.current', 'wmsSource.byId', 'wmsSource.create', 'wmsSource.list', 'wmsSource.update',
  ),
  operationread: permissions(
    'journal.byId', 'journal.byNumber', 'journal.list', 'mapLayer.byId', 'mapLayer.list',
    'mapSnapshot.byId', 'mapSnapshot.list', 'operation.byId', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'organization.current', 'wmsSource.byId', 'wmsSource.list',
  ),
  public: permissions(
    'mapLayer.byId', 'mapLayer.list', 'organization.current', 'organization.forLogin',
    'wmsSource.byId', 'wmsSource.list',
  ),
};

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<PermissionKey>> = BASELINE_ROLE_PERMISSIONS;

const permissionCache = new Map<Role, Set<PermissionKey>>();

export const resetPermissionCache = (): void => {
  permissionCache.clear();
  for (const role of ROLES) {
    permissionCache.set(role, new Set(BASELINE_ROLE_PERMISSIONS[role]));
  }
};

resetPermissionCache();

export const hasPermission = (role: Role, permission: PermissionKey): boolean => {
  if (role === 'admin') {
    return true;
  }
  const cachedRolePermissions = permissionCache.get(role);
  if (cachedRolePermissions) {
    return cachedRolePermissions.has(permission);
  }
  return BASELINE_ROLE_PERMISSIONS[role]?.has(permission) ?? false;
};

export const setRolePermissionInCache = (role: Role, permission: PermissionKey, enabled: boolean): void => {
  if (role === 'admin') {
    return;
  }
  let rolePerms = permissionCache.get(role);
  if (!rolePerms) {
    rolePerms = new Set(BASELINE_ROLE_PERMISSIONS[role] ?? []);
    permissionCache.set(role, rolePerms);
  }
  if (enabled) {
    rolePerms.add(permission);
  } else {
    rolePerms.delete(permission);
  }
};

export const getCachedRolePermissions = (role: Role): ReadonlySet<PermissionKey> => {
  if (role === 'admin') {
    return BASELINE_ROLE_PERMISSIONS.admin;
  }
  return permissionCache.get(role) ?? BASELINE_ROLE_PERMISSIONS[role] ?? new Set();
};

export const getAllCachedRolePermissions = (): Record<Role, ReadonlySet<PermissionKey>> => {
  const result = {} as Record<Role, ReadonlySet<PermissionKey>>;
  for (const role of ROLES) {
    result[role] = getCachedRolePermissions(role);
  }
  return result;
};

export const loadRolePermissionsFromDb = async (db: Database): Promise<void> => {
  const rows = await db.select().from(rolePermissions);
  if (rows.length === 0) {
    resetPermissionCache();
    return;
  }

  const newMap = new Map<Role, Set<PermissionKey>>();
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
  newMap.set('admin', new Set(BASELINE_ROLE_PERMISSIONS.admin));
  permissionCache.clear();
  for (const [role, perms] of newMap.entries()) {
    permissionCache.set(role, perms);
  }
};
