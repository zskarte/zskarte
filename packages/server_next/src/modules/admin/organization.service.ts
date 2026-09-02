import { TRPCError } from '@trpc/server';
import { and, asc, count, eq } from 'drizzle-orm';
import { auth } from '../../auth/auth.js';
import { account, user } from '../../db/auth-schema.js';
import type { Database } from '../../db/client.js';
import { files } from '../file/schema.js';
import { type UploadFileInput, uploadFile, validateLogoUpload } from '../file/service.js';
import { organizationMapLayerFavorites } from '../map-layer/schema.js';
import { getOperationCaches, removeFromCache } from '../operation/cache.js';
import { operations } from '../operation/schema.js';
import { organizations } from '../organization/schema.js';
import { organizationWmsSources } from '../wms-source/schema.js';

export interface CreateOrganizationUserInput {
  username?: string;
  password: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

export interface UpdateOrganizationUserInput {
  id?: string;
  username?: string;
  password?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

export interface CreateOrganizationInput {
  name: string;
  mapLongitude?: number;
  mapLatitude?: number;
  mapZoomLevel?: number;
  defaultLocale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-US';
  url?: string | null;
  logoId?: string | null;
  settings?: Record<string, unknown> | null;
  journalEntryTemplate?: Record<string, unknown> | null;
  user?: CreateOrganizationUserInput;
  users?: CreateOrganizationUserInput[];
}

export interface UpdateOrganizationInput {
  name?: string;
  mapLongitude?: number;
  mapLatitude?: number;
  mapZoomLevel?: number;
  defaultLocale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-US';
  url?: string | null;
  logoId?: string | null;
  settings?: Record<string, unknown> | null;
  journalEntryTemplate?: Record<string, unknown> | null;
  user?: UpdateOrganizationUserInput;
}

export interface UploadLogoInput extends UploadFileInput {
  organizationId?: string;
}

export const listOrganizations = async (db: Database) => {
  const orgRows = await db
    .select({
      documentId: organizations.documentId,
      name: organizations.name,
      mapLongitude: organizations.mapLongitude,
      mapLatitude: organizations.mapLatitude,
      mapZoomLevel: organizations.mapZoomLevel,
      defaultLocale: organizations.defaultLocale,
      url: organizations.url,
      journalEntryTemplate: organizations.journalEntryTemplate,
      settings: organizations.settings,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      logo: {
        documentId: files.documentId,
        name: files.name,
        url: files.url,
        formats: files.formats,
        provider: files.provider,
      },
    })
    .from(organizations)
    .leftJoin(files, eq(organizations.logoId, files.documentId))
    .orderBy(asc(organizations.name));

  const opsCountRows = await db
    .select({
      organizationId: operations.organizationId,
      count: count(operations.documentId),
    })
    .from(operations)
    .groupBy(operations.organizationId);

  const opsMap = new Map<string, number>();
  for (const r of opsCountRows) {
    if (r.organizationId) opsMap.set(r.organizationId, Number(r.count));
  }

  const allUsers = await db
    .select({
      id: user.id,
      organizationId: user.organizationId,
      username: user.username,
      email: user.email,
      name: user.name,
      zsRole: user.zsRole,
    })
    .from(user);

  const orgUserMap = new Map<
    string,
    { id: string; username: string | null; email: string; name: string; zsRole: string }
  >();
  const usersMap = new Map<string, number>();
  for (const u of allUsers) {
    if (u.organizationId) {
      if (!orgUserMap.has(u.organizationId)) {
        orgUserMap.set(u.organizationId, {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.name,
          zsRole: u.zsRole,
        });
      }
      usersMap.set(u.organizationId, (usersMap.get(u.organizationId) ?? 0) + 1);
    }
  }

  return orgRows.map((org) => ({
    ...org,
    logo: org.logo?.documentId ? org.logo : null,
    operationCount: opsMap.get(org.documentId) ?? 0,
    userCount: usersMap.get(org.documentId) ?? 0,
    user: orgUserMap.get(org.documentId) ?? null,
  }));
};

export const getOrganizationById = async (db: Database, documentId: string) => {
  const [org] = await db
    .select({
      documentId: organizations.documentId,
      name: organizations.name,
      mapLongitude: organizations.mapLongitude,
      mapLatitude: organizations.mapLatitude,
      mapZoomLevel: organizations.mapZoomLevel,
      defaultLocale: organizations.defaultLocale,
      url: organizations.url,
      journalEntryTemplate: organizations.journalEntryTemplate,
      settings: organizations.settings,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      logo: {
        documentId: files.documentId,
        name: files.name,
        url: files.url,
        formats: files.formats,
        provider: files.provider,
      },
    })
    .from(organizations)
    .leftJoin(files, eq(organizations.logoId, files.documentId))
    .where(eq(organizations.documentId, documentId))
    .limit(1);

  if (!org) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
  }

  const [wmsSources, mapLayerFavorites, organizationOperations, organizationUsers] = await Promise.all([
    db
      .select({ documentId: organizationWmsSources.wmsSourceId })
      .from(organizationWmsSources)
      .where(eq(organizationWmsSources.organizationId, documentId)),
    db
      .select({ documentId: organizationMapLayerFavorites.mapLayerId })
      .from(organizationMapLayerFavorites)
      .where(eq(organizationMapLayerFavorites.organizationId, documentId)),
    db.select().from(operations).where(eq(operations.organizationId, documentId)),
    db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        zsRole: user.zsRole,
      })
      .from(user)
      .where(eq(user.organizationId, documentId)),
  ]);

  return {
    ...org,
    logo: org.logo?.documentId ? org.logo : null,
    operations: organizationOperations,
    users: organizationUsers,
    user: organizationUsers[0] ?? null,
    wms_sources: wmsSources.map((w) => w.documentId),
    map_layer_favorites: mapLayerFavorites.map((m) => m.documentId),
  };
};

export const createOrganization = async (db: Database, data: CreateOrganizationInput) => {
  if (Array.isArray(data.users) && data.users.length > 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Only a single user per organization is supported for now',
    });
  }
  
  const deriveUsername = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z_]/g, '');
  };

  const initialUser = data.user || data.users?.[0];

  if (!initialUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'A user with an account must be specified when creating an organization',
    });
  }

  const derivedUsername = deriveUsername(data.name);
  if (!derivedUsername) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Organization name must result in a valid username (a-z and _)',
    });
  }

  if (!initialUser.password || initialUser.password.length < 6) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Password must be at least 6 characters long',
    });
  }

  const [row] = await db
    .insert(organizations)
    .values({
      name: data.name,
      mapLongitude: data.mapLongitude ?? 7.44297,
      mapLatitude: data.mapLatitude ?? 46.94635,
      mapZoomLevel: data.mapZoomLevel ?? 16,
      defaultLocale: data.defaultLocale ?? 'de-CH',
      url: data.url ?? null,
      logoId: data.logoId ?? null,
      journalEntryTemplate: data.journalEntryTemplate ?? null,
      settings: (data.settings as any) ?? null,
    })
    .returning();

  const authContext = await auth.$context;
  const email = `${derivedUsername}@internal.zskarte.ch`;
  const name = initialUser.name?.trim() || data.name;
  const role = (initialUser.role?.trim() as any) || 'organization';
  const hashedPassword = await authContext.password.hash(initialUser.password);
  const userId = crypto.randomUUID();

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    username: derivedUsername,
    zsRole: role,
    organizationId: row.documentId,
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: 'credential',
    issuer: 'local:credential',
    userId,
    password: hashedPassword,
  });

  return row;
};

export const updateOrganization = async (db: Database, documentId: string, data: UpdateOrganizationInput) => {
  const updateValues: Partial<typeof organizations.$inferInsert> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.mapLongitude !== undefined) updateValues.mapLongitude = data.mapLongitude;
  if (data.mapLatitude !== undefined) updateValues.mapLatitude = data.mapLatitude;
  if (data.mapZoomLevel !== undefined) updateValues.mapZoomLevel = data.mapZoomLevel;
  if (data.defaultLocale !== undefined) updateValues.defaultLocale = data.defaultLocale;
  if (data.url !== undefined) updateValues.url = data.url;
  if (data.logoId !== undefined) updateValues.logoId = data.logoId;
  if (data.journalEntryTemplate !== undefined) updateValues.journalEntryTemplate = data.journalEntryTemplate;
  if (data.settings !== undefined) updateValues.settings = data.settings as any;

  let row: typeof organizations.$inferSelect | undefined;

  if (Object.keys(updateValues).length > 0) {
    const [updatedRow] = await db
      .update(organizations)
      .set(updateValues)
      .where(eq(organizations.documentId, documentId))
      .returning();
    row = updatedRow;
  } else {
    const [existingRow] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.documentId, documentId))
      .limit(1);
    row = existingRow;
  }

  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
  }

  if (data.user) {
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.organizationId, documentId));

    const authContext = await auth.$context;

    if (existingUsers.length > 0) {
      const targetUser =
        (data.user.id ? existingUsers.find((u) => u.id === data.user!.id) : null) ?? existingUsers[0];
      const userUpdates: Partial<typeof user.$inferInsert> = {};

      if (data.user.username !== undefined) {
        const trimmedUsername = data.user.username.trim();
        if (!trimmedUsername) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Username cannot be empty',
          });
        }
        userUpdates.username = trimmedUsername;
      }
      if (data.user.email !== undefined) {
        userUpdates.email =
          data.user.email?.trim() ||
          `${(userUpdates.username || targetUser.username || 'user').toLowerCase()}@internal.zskarte.ch`;
      }
      if (data.user.name !== undefined) {
        userUpdates.name = data.user.name?.trim() || userUpdates.username || targetUser.name;
      }
      if (data.user.role !== undefined) {
        userUpdates.zsRole = (data.user.role as any) || 'organization';
      }

      if (Object.keys(userUpdates).length > 0) {
        await db.update(user).set(userUpdates).where(eq(user.id, targetUser.id));
      }

      if (data.user.password?.trim()) {
        if (data.user.password.length < 6) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password must be at least 6 characters long',
          });
        }
        const hashedPassword = await authContext.password.hash(data.user.password);
        const existingAccount = await db
          .select()
          .from(account)
          .where(and(eq(account.userId, targetUser.id), eq(account.providerId, 'credential')))
          .limit(1);

        if (existingAccount.length > 0) {
          await db
            .update(account)
            .set({ password: hashedPassword })
            .where(eq(account.id, existingAccount[0].id));
        } else {
          await db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: targetUser.id,
            providerId: 'credential',
            issuer: 'local:credential',
            userId: targetUser.id,
            password: hashedPassword,
          });
        }
      }
    } else {
      const trimmedUsername = data.user.username?.trim();
      if (!trimmedUsername) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username is required to create a user',
        });
      }
      if (!data.user.password || data.user.password.length < 6) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password must be at least 6 characters long',
        });
      }
      const email = data.user.email?.trim() || `${trimmedUsername.toLowerCase()}@internal.zskarte.ch`;
      const name = data.user.name?.trim() || trimmedUsername;
      const role = (data.user.role?.trim() as any) || 'organization';
      const hashedPassword = await authContext.password.hash(data.user.password);
      const userId = crypto.randomUUID();

      await db.insert(user).values({
        id: userId,
        name,
        email,
        emailVerified: true,
        username: trimmedUsername,
        zsRole: role,
        organizationId: documentId,
      });

      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: 'credential',
        issuer: 'local:credential',
        userId,
        password: hashedPassword,
      });
    }
  }

  return row;
};

export const deleteOrganization = async (db: Database, documentId: string) => {
  const relatedOperations = await db
    .select({ documentId: operations.documentId })
    .from(operations)
    .where(eq(operations.organizationId, documentId));
  const operationIds = new Set(relatedOperations.map((operation) => operation.documentId));

  for (const [operationId, cache] of getOperationCaches()) {
    if (cache.operation.organizationId === documentId) operationIds.add(operationId);
  }

  // Delete all users belonging to the organization.
  // Account records will be deleted via CASCADE on userId.
  await db.delete(user).where(eq(user.organizationId, documentId));

  const [deleted] = await db
    .delete(organizations)
    .where(eq(organizations.documentId, documentId))
    .returning({ documentId: organizations.documentId });

  if (!deleted) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
  }

  for (const operationId of operationIds) removeFromCache(operationId, 'organization deleted');

  return { success: true, documentId: deleted.documentId };
};

export const uploadLogo = async (db: Database, input: UploadLogoInput) => {
  validateLogoUpload(input);

  const file = await uploadFile(db, {
    fileName: input.fileName,
    mimeType: input.mimeType,
    base64: input.base64,
    alternativeText: input.alternativeText,
    caption: input.caption,
  });

  if (input.organizationId) {
    await db
      .update(organizations)
      .set({ logoId: file.documentId })
      .where(eq(organizations.documentId, input.organizationId));
  }

  return file;
};
