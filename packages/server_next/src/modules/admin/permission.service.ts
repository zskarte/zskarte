import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import {
  PERMISSION_KEYS,
  type PermissionKey,
  getAllCachedRolePermissions,
  loadRolePermissionsFromDb,
  setRolePermissionInCache,
} from '../../auth/permissions.js';
import { ROLES, type Role, isRole } from '../../auth/roles.js';
import { rolePermissions } from '../../db/auth-schema.js';
import type { Database } from '../../db/client.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../../db/default-permissions.js';

export interface TogglePermissionInput {
  role: string;
  permission: string;
  enabled: boolean;
}

export const getMatrix = async (db: Database) => {
  const cached = await getAllCachedRolePermissions(db);
  const matrix = {} as Record<Role, Record<PermissionKey, boolean>>;

  for (const role of ROLES) {
    matrix[role] = {} as Record<PermissionKey, boolean>;
    for (const key of PERMISSION_KEYS) {
      matrix[role][key] = cached[role]?.has(key) ?? false;
    }
  }

  return {
    permissions: PERMISSION_KEYS,
    roles: ROLES,
    matrix,
  };
};

export const toggleRolePermission = async (db: Database, input: TogglePermissionInput) => {
  if (input.role === 'admin') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Admin permissions are fixed and cannot be modified.',
    });
  }

  if (!isRole(input.role) || !(PERMISSION_KEYS as readonly string[]).includes(input.permission)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unknown role or permission key.' });
  }

  const role: Role = input.role;
  const permission: PermissionKey = input.permission as PermissionKey;

  if (input.enabled) {
    await db.insert(rolePermissions).values({ role, permission }).onConflictDoNothing();
  } else {
    await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.role, role), eq(rolePermissions.permission, permission)));
  }

  setRolePermissionInCache(role, permission, input.enabled);

  return {
    success: true,
    role,
    permission,
    enabled: input.enabled,
  };
};

export const resetDefaults = async (db: Database) => {
  await db.delete(rolePermissions);

  const rowsToInsert: { role: Role; permission: PermissionKey }[] = [];
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const perm of perms) {
      rowsToInsert.push({ role: role as Role, permission: perm });
    }
  }

  if (rowsToInsert.length > 0) {
    await db.insert(rolePermissions).values(rowsToInsert);
  }

  await loadRolePermissionsFromDb(db);

  return { success: true };
};
