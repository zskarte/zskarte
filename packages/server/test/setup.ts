import { PERMISSION_CACHE_KEY, permissionCache, type RolePermissionMap } from '../src/auth/permissions.js';
import { ROLES } from '../src/auth/roles.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/db/default-permissions.js';

const defaultMap: RolePermissionMap = new Map();
for (const role of ROLES) {
  defaultMap.set(role, new Set(DEFAULT_ROLE_PERMISSIONS[role]));
}
permissionCache.set(PERMISSION_CACHE_KEY, defaultMap);
