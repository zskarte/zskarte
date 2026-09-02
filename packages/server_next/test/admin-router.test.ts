import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  BASELINE_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
  hasPermission,
  resetPermissionCache,
  setRolePermissionInCache,
} from '../src/auth/permissions.js';
import { ROLES } from '../src/auth/roles.js';
import type { Database } from '../src/db/client.js';
import { addToCache, getOperationCache, resetCacheForTesting } from '../src/modules/operation/cache.js';
import { type AuthSession, createContextInner } from '../src/trpc/context.js';
import { appRouter } from '../src/trpc/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const ORG_1 = '11111111-1111-4111-8111-111111111111';
const ORG_2 = '22222222-2222-4222-8222-222222222222';
const OP_1 = '33333333-3333-4333-8333-333333333333';
const OP_2 = '44444444-4444-4444-8444-444444444444';
const FILE_1 = '55555555-5555-4555-8555-555555555555';

const makeAuthSession = (
  role: AuthSession['user']['zsRole'],
  organizationId: string | null = null,
): AuthSession => ({
  user: {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin@example.com',
    emailVerified: true,
    image: null,
    username: 'zso_admin',
    organizationId,
    zsRole: role,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'session-admin',
    token: 'admin-token',
    userId: 'user-admin',
    expiresAt: new Date(Date.now() + 60_000),
    ipAddress: null,
    userAgent: null,
    operationId: null,
    organizationId,
    permission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const createFakeDatabase = (options: {
  selects?: unknown[][];
  returning?: unknown[][];
  rows?: unknown[];
} = {}) => {
  const selects = [...(options.selects ?? [])];
  const returning = [...(options.returning ?? [])];
  const captured = {
    inserted: [] as Record<string, unknown>[],
    updated: [] as Record<string, unknown>[],
    deleted: [] as unknown[],
    where: [] as unknown[],
  };

  const nextSelect = () => Promise.resolve(selects.shift() ?? options.rows ?? []);
  const nextReturning = () => Promise.resolve(returning.shift() ?? []);

  const query: any = {
    from: () => query,
    leftJoin: () => query,
    innerJoin: () => query,
    where: (cond: unknown) => {
      captured.where.push(cond);
      return query;
    },
    groupBy: () => nextSelect(),
    orderBy: () => nextSelect(),
    limit: () => nextSelect(),
    then: (resolve: any, reject: any) => nextSelect().then(resolve, reject),
  };

  const db = {
    select: () => query,
    insert: () => ({
      values: (values: any) => {
        captured.inserted.push(values);
        return {
          returning: () => nextReturning(),
          onConflictDoNothing: () => Promise.resolve(),
        };
      },
    }),
    update: () => ({
      set: (values: any) => {
        captured.updated.push(values);
        return {
          where: (cond: unknown) => {
            captured.where.push(cond);
            return {
              returning: () => nextReturning(),
            };
          },
        };
      },
    }),
    delete: () => ({
      where: (cond: unknown) => {
        captured.where.push(cond);
        captured.deleted.push(cond);
        return {
          returning: () => nextReturning(),
        };
      },
      then: (resolve: any, reject: any) => {
        captured.deleted.push('all');
        return Promise.resolve().then(resolve, reject);
      },
    }),
  } as unknown as Database;

  return { db, captured };
};

const createCaller = async (db: Database, session: AuthSession | null) =>
  createCallerFactory(appRouter)(
    await createContextInner({
      db,
      authSession: session,
      requestIp: '127.0.0.1',
      requestPath: '/trpc/admin',
    }),
  );

describe('Admin tRPC Router', () => {
  beforeEach(() => {
    resetCacheForTesting();
    resetPermissionCache();
  });

  describe('Security & Access Control (adminProcedure)', () => {
    it('rejects unauthenticated requests with UNAUTHORIZED', async () => {
      const { db } = createFakeDatabase();
      const caller = await createCaller(db, null);

      await expect(caller.admin.organization.list()).rejects.toMatchObject<Partial<TRPCError>>({
        code: 'UNAUTHORIZED',
      });
      await expect(caller.admin.operation.list()).rejects.toMatchObject<Partial<TRPCError>>({
        code: 'UNAUTHORIZED',
      });
      await expect(caller.admin.permission.getMatrix()).rejects.toMatchObject<Partial<TRPCError>>({
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects non-admin roles (organization, guest, operationwrite) with FORBIDDEN', async () => {
      const { db } = createFakeDatabase();

      for (const nonAdminRole of ['organization', 'guest', 'operationwrite', 'operationread', 'public'] as const) {
        const caller = await createCaller(db, makeAuthSession(nonAdminRole, ORG_1));

        await expect(caller.admin.organization.list()).rejects.toMatchObject<Partial<TRPCError>>({
          code: 'FORBIDDEN',
        });
        await expect(caller.admin.operation.list()).rejects.toMatchObject<Partial<TRPCError>>({
          code: 'FORBIDDEN',
        });
        await expect(caller.admin.permission.getMatrix()).rejects.toMatchObject<Partial<TRPCError>>({
          code: 'FORBIDDEN',
        });
      }
    });

    it('permits admin role without requiring organizationId scope', async () => {
      const { db } = createFakeDatabase({
        selects: [[], [], []],
      });
      const caller = await createCaller(db, makeAuthSession('admin', null));

      const result = await caller.admin.organization.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('admin.organization CRUD & Logo', () => {
    it('list returns all organizations with summary counts and logo metadata', async () => {
      const orgs = [
        {
          documentId: ORG_1,
          name: 'Org Alpha',
          mapLongitude: 7.44,
          mapLatitude: 46.94,
          mapZoomLevel: 16,
          defaultLocale: 'de-CH',
          url: 'https://alpha.ch',
          journalEntryTemplate: null,
          settings: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          logo: { documentId: FILE_1, name: 'logo.png', url: '/uploads/logo.png', formats: null, provider: 'local' },
        },
      ];
      const opsCount = [{ organizationId: ORG_1, count: 5 }];
      const usersList = [
        { id: 'u-1', organizationId: ORG_1, username: 'user1', email: 'u1@test.ch', name: 'User 1', zsRole: 'organization' },
        { id: 'u-2', organizationId: ORG_1, username: 'user2', email: 'u2@test.ch', name: 'User 2', zsRole: 'organization' },
      ];

      const { db } = createFakeDatabase({ selects: [orgs, opsCount, usersList] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.list();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        documentId: ORG_1,
        name: 'Org Alpha',
        operationCount: 5,
        userCount: 2,
        user: {
          id: 'u-1',
          username: 'user1',
        },
        logo: {
          documentId: FILE_1,
          url: '/uploads/logo.png',
        },
      });
    });

    it('byId returns full organization details with operations, users, and sources', async () => {
      const orgRow = {
        documentId: ORG_1,
        name: 'Org Alpha',
        mapLongitude: 7.44,
        mapLatitude: 46.94,
        mapZoomLevel: 16,
        defaultLocale: 'de-CH',
        url: null,
        journalEntryTemplate: null,
        settings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        logo: null,
      };
      const wms = [{ documentId: 'wms-1' }];
      const favs = [{ documentId: 'layer-1' }];
      const ops = [{ documentId: OP_1, name: 'Operation 1' }];
      const users = [{ id: 'user-1', username: 'user1', email: 'u1@test.ch', name: 'User 1', zsRole: 'organization' }];

      const { db } = createFakeDatabase({ selects: [[orgRow], wms, favs, ops, users] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.byId({ documentId: ORG_1 });
      expect(result).toMatchObject({
        documentId: ORG_1,
        name: 'Org Alpha',
        wms_sources: ['wms-1'],
        map_layer_favorites: ['layer-1'],
        operations: [{ documentId: OP_1 }],
        users: [{ id: 'user-1', username: 'user1' }],
      });
    });

    it('byId throws NOT_FOUND when organization does not exist', async () => {
      const { db } = createFakeDatabase({ selects: [[]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(caller.admin.organization.byId({ documentId: ORG_1 })).rejects.toMatchObject<Partial<TRPCError>>({
        code: 'NOT_FOUND',
      });
    });

    it('create inserts new organization with default coordinates and initial user/account', async () => {
      const createdOrg = {
        documentId: ORG_1,
        name: 'New Org',
        mapLongitude: 7.44297,
        mapLatitude: 46.94635,
        mapZoomLevel: 16,
        defaultLocale: 'de-CH',
        url: 'https://new.org',
        logoId: null,
        journalEntryTemplate: null,
        settings: null,
      };

      const { db, captured } = createFakeDatabase({ returning: [[createdOrg]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.create({
        name: 'New Org',
        url: 'https://new.org',
        user: {
          password: 'supersecret123',
        },
      });

      expect(result).toEqual(createdOrg);
      expect(captured.inserted[0]).toMatchObject({
        name: 'New Org',
        url: 'https://new.org',
        defaultLocale: 'de-CH',
      });
      expect(captured.inserted[1]).toMatchObject({
        username: 'new_org',
        email: 'new_org@internal.zskarte.ch',
        organizationId: ORG_1,
        zsRole: 'organization',
      });
      expect(captured.inserted[2]).toMatchObject({
        providerId: 'credential',
        issuer: 'local:credential',
      });
      expect(captured.inserted[2].password).toBeDefined();
    });

    it('create ignores provided email and username, using derived ones instead', async () => {
      const createdOrg = {
        documentId: ORG_1,
        name: 'Custom User Org',
        mapLongitude: 7.44297,
        mapLatitude: 46.94635,
        mapZoomLevel: 16,
        defaultLocale: 'de-CH',
        url: null,
        logoId: null,
        journalEntryTemplate: null,
        settings: null,
      };
      const { db, captured } = createFakeDatabase({ returning: [[createdOrg]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      await caller.admin.organization.create({
        name: 'Custom User Org',
        user: {
          username: 'should_be_ignored',
          email: 'ignored@custom.com',
          password: 'supersecret123',
        },
      });

      expect(captured.inserted[1]).toMatchObject({
        username: 'custom_user_org',
        email: 'custom_user_org@internal.zskarte.ch',
      });
    });

    it('create rejects organization when no user or empty users array is provided', async () => {
      const { db } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.organization.create({
          name: 'No User Org',
        } as any),
      ).rejects.toThrow();

      await expect(
        caller.admin.organization.create({
          name: 'Empty Users Org',
          users: [],
        } as any),
      ).rejects.toThrow();
    });

    it('create rejects organization when multiple users are provided (single user restriction)', async () => {
      const { db } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.organization.create({
          name: 'Multi User Org',
          users: [
            { username: 'user1', password: 'password123', role: 'admin' },
            { username: 'user2', password: 'password456', email: 'u2@custom.ch' },
          ],
        } as any),
      ).rejects.toThrow();
    });

    it('update modifies organization fields and returns updated row', async () => {
      const updatedOrg = {
        documentId: ORG_1,
        name: 'Updated Name',
        mapLongitude: 8.5,
        mapLatitude: 47.3,
        mapZoomLevel: 14,
        defaultLocale: 'fr-CH',
        url: 'https://updated.ch',
      };

      const { db, captured } = createFakeDatabase({ returning: [[updatedOrg]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.update({
        documentId: ORG_1,
        data: {
          name: 'Updated Name',
          defaultLocale: 'fr-CH',
        },
      });

      expect(result).toEqual(updatedOrg);
      expect(captured.updated[0]).toMatchObject({
        name: 'Updated Name',
        defaultLocale: 'fr-CH',
      });
    });

    it('update supports updating user details and resetting password', async () => {
      const existingOrg = { documentId: ORG_1, name: 'Org 1' };
      const existingUser = {
        id: 'u-1',
        username: 'old_username',
        email: 'old@org.ch',
        name: 'Old Name',
        zsRole: 'organization',
        organizationId: ORG_1,
      };
      const existingAccount = {
        id: 'acc-1',
        userId: 'u-1',
        providerId: 'credential',
        password: 'old-hashed-password',
      };

      const { db, captured } = createFakeDatabase({
        selects: [[existingOrg], [existingUser], [existingAccount]],
      });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.update({
        documentId: ORG_1,
        data: {
          user: {
            id: 'u-1',
            username: 'new_username',
            email: 'new@org.ch',
            role: 'operationwrite',
            password: 'newpassword123',
          },
        },
      });

      expect(result).toEqual(existingOrg);
      expect(captured.updated).toHaveLength(2);
      expect(captured.updated[0]).toMatchObject({
        username: 'new_username',
        email: 'new@org.ch',
        zsRole: 'operationwrite',
      });
      expect(captured.updated[1].password).toBeDefined();
      expect(captured.updated[1].password).not.toEqual('newpassword123');
    });

    it('delete removes the organization and associated users and returns success', async () => {
      const { db, captured } = createFakeDatabase({ returning: [[{ documentId: ORG_1 }]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.delete({ documentId: ORG_1 });
      expect(result).toEqual({ success: true, documentId: ORG_1 });
      expect(captured.deleted).toHaveLength(2);
    });

    it('clears cached operations belonging to the deleted organization', async () => {
      addToCache({ documentId: OP_1, organizationId: ORG_1 } as any);
      addToCache({ documentId: OP_2, organizationId: ORG_2 } as any);

      const { db } = createFakeDatabase({
        selects: [[{ documentId: OP_1 }]],
        returning: [[{ documentId: ORG_1 }]],
      });
      const caller = await createCaller(db, makeAuthSession('admin'));

      await caller.admin.organization.delete({ documentId: ORG_1 });

      expect(getOperationCache(OP_1)).toBeUndefined();
      expect(getOperationCache(OP_2)).toBeDefined();
    });

    it('uploadLogo saves asset and links to organization when organizationId is provided', async () => {
      const fileRow = {
        documentId: FILE_1,
        name: 'logo.png',
        url: '/uploads/abc.png',
        mime: 'image/png',
        size: 10.5,
        hash: 'abc',
        ext: '.png',
        provider: 'local',
      };

      const { db, captured } = createFakeDatabase({ returning: [[fileRow]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.organization.uploadLogo({
        organizationId: ORG_1,
        fileName: 'logo.png',
        mimeType: 'image/png',
        base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        alternativeText: 'Logo Alt',
      });

      expect(result).toMatchObject({
        documentId: FILE_1,
        name: 'logo.png',
      });
      expect(captured.inserted[0]).toMatchObject({
        name: 'logo.png',
        mime: 'image/png',
        alternativeText: 'Logo Alt',
      });
      expect(captured.updated[0]).toMatchObject({
        logoId: FILE_1,
      });
    });

    it('rejects a logo with a disallowed filename extension', async () => {
      const { db, captured } = createFakeDatabase({ returning: [[{}]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.organization.uploadLogo({
          organizationId: ORG_1,
          fileName: 'logo.exe',
          mimeType: 'image/png',
          base64: 'iVBORw0KGgo=',
        }),
      ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
      expect(captured.inserted).toHaveLength(0);
    });

    it('rejects a logo with a disallowed MIME type', async () => {
      const { db, captured } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.organization.uploadLogo({
          organizationId: ORG_1,
          fileName: 'logo.gif',
          mimeType: 'image/gif',
          base64: 'R0lGODlhAQABAIAAAAAAAP///yw=',
        }),
      ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
      expect(captured.inserted).toHaveLength(0);
    });
  });

  describe('admin.operation CRUD', () => {
    it('list returns operations across tenants with filters', async () => {
      const ops = [
        {
          documentId: OP_1,
          name: 'Emergency A',
          description: 'Desc A',
          phase: 'active',
          organizationId: ORG_1,
          organizationName: 'Org 1',
          eventStates: [1],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          documentId: OP_2,
          name: 'Emergency B',
          description: 'Desc B',
          phase: 'archived',
          organizationId: ORG_2,
          organizationName: 'Org 2',
          eventStates: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { db } = createFakeDatabase({ selects: [ops] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.operation.list({
        organizationId: ORG_1,
        phase: 'active',
        search: 'Emergency',
      });

      expect(result).toHaveLength(2);
      expect(result[0].organizationName).toBe('Org 1');
    });

    it('byId returns operation with cache overlay if cached', async () => {
      const opRow = {
        documentId: OP_1,
        name: 'Op Alpha',
        description: null,
        phase: 'active' as const,
        organizationId: ORG_1,
        organizationName: 'Org 1',
        mapState: null,
        changesets: {},
        changesetSigns: {},
        signingKeyIds: [],
        eventStates: null,
        mapLayers: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db } = createFakeDatabase({ selects: [[opRow]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.operation.byId({ documentId: OP_1 });
      expect(result).toMatchObject({
        documentId: OP_1,
        name: 'Op Alpha',
      });
    });

    it('create creates operation and registers active operation in cache', async () => {
      const createdOp = {
        documentId: OP_1,
        name: 'Op Created',
        organizationId: ORG_1,
        description: 'New Description',
        phase: 'active' as const,
        eventStates: [1, 2],
        mapState: null,
        changesets: null,
        changesetSigns: null,
        signingKeyIds: null,
        mapLayers: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db, captured } = createFakeDatabase({ returning: [[createdOp]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.operation.create({
        name: 'Op Created',
        organizationId: ORG_1,
        description: 'New Description',
        eventStates: [1, 2],
      });

      expect(result).toEqual(createdOp);
      expect(captured.inserted[0]).toMatchObject({
        name: 'Op Created',
        organizationId: ORG_1,
      });
      expect(getOperationCache(OP_1)).toBeDefined();
    });

    it('update modifies operation and updates cache', async () => {
      const updatedOp = {
        documentId: OP_1,
        name: 'Op Modified',
        organizationId: ORG_1,
        description: 'Updated Description',
        phase: 'active' as const,
        eventStates: [3],
        mapState: null,
        changesets: null,
        changesetSigns: null,
        signingKeyIds: null,
        mapLayers: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db, captured } = createFakeDatabase({ returning: [[updatedOp]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.operation.update({
        documentId: OP_1,
        data: {
          name: 'Op Modified',
          description: 'Updated Description',
        },
      });

      expect(result).toEqual(updatedOp);
      expect(captured.updated[0]).toMatchObject({
        name: 'Op Modified',
        description: 'Updated Description',
      });
    });

    it('archive sets phase to archived and unarchive sets phase to active', async () => {
      const archivedOp = {
        documentId: OP_1,
        name: 'Op Alpha',
        organizationId: ORG_1,
        phase: 'archived' as const,
      };
      const activeOp = {
        documentId: OP_1,
        name: 'Op Alpha',
        organizationId: ORG_1,
        phase: 'active' as const,
      };

      const { db: dbArchive } = createFakeDatabase({ returning: [[archivedOp]] });
      const callerArchive = await createCaller(dbArchive, makeAuthSession('admin'));
      const archiveRes = await callerArchive.admin.operation.archive({ documentId: OP_1 });
      expect(archiveRes).toEqual({ success: true, operation: archivedOp });

      const { db: dbUnarchive } = createFakeDatabase({ returning: [[activeOp]] });
      const callerUnarchive = await createCaller(dbUnarchive, makeAuthSession('admin'));
      const unarchiveRes = await callerUnarchive.admin.operation.unarchive({ documentId: OP_1 });
      expect(unarchiveRes).toEqual({ success: true, operation: activeOp });
      expect(getOperationCache(OP_1)).toBeDefined();
    });

    it('delete removes operation and clears cache', async () => {
      const { db, captured } = createFakeDatabase({ returning: [[{ documentId: OP_1 }]] });
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.operation.delete({ documentId: OP_1 });
      expect(result).toEqual({ success: true, documentId: OP_1 });
      expect(captured.deleted).toHaveLength(1);
    });
  });

  describe('admin.permission Matrix & Real-time Toggling', () => {
    it('getMatrix returns all PERMISSION_KEYS, ROLES, and current matrix status', async () => {
      const { db } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.permission.getMatrix();
      expect(result.permissions).toEqual(PERMISSION_KEYS);
      expect(result.roles).toEqual(ROLES);

      // Verify admin has all permissions
      for (const perm of PERMISSION_KEYS) {
        expect(result.matrix.admin[perm]).toBe(true);
      }

      // Verify baseline expectations for regular roles
      expect(result.matrix.organization['operation.submitChangeset']).toBe(true);
      expect(result.matrix.operationwrite['operation.submitChangeset']).toBe(true);
      expect(result.matrix.guest['mapSnapshot.list']).toBe(false);
    });

    it('toggleRolePermission updates role_permissions in DB and syncs cache in real time', async () => {
      const { db, captured } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      // Initially guest cannot list map snapshots
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);

      // Toggle ON
      const enableRes = await caller.admin.permission.toggleRolePermission({
        role: 'guest',
        permission: 'mapSnapshot.list',
        enabled: true,
      });

      expect(enableRes).toEqual({
        success: true,
        role: 'guest',
        permission: 'mapSnapshot.list',
        enabled: true,
      });
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);
      expect(captured.inserted[0]).toMatchObject({
        role: 'guest',
        permission: 'mapSnapshot.list',
      });

      // Toggle OFF
      const disableRes = await caller.admin.permission.toggleRolePermission({
        role: 'guest',
        permission: 'mapSnapshot.list',
        enabled: false,
      });

      expect(disableRes).toEqual({
        success: true,
        role: 'guest',
        permission: 'mapSnapshot.list',
        enabled: false,
      });
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      expect(captured.deleted).toHaveLength(1);
    });

    it('toggleRolePermission rejects toggling admin permissions as they are fixed', async () => {
      const { db, captured } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.permission.toggleRolePermission({
          role: 'admin',
          permission: 'operation.create',
          enabled: false,
        }),
      ).rejects.toMatchObject<Partial<TRPCError>>({
        code: 'BAD_REQUEST',
        message: 'Admin permissions are fixed and cannot be modified.',
      });

      expect(hasPermission('admin', 'operation.create')).toBe(true);
      expect(captured.deleted).toHaveLength(0);
      expect(captured.inserted).toHaveLength(0);
    });

    it('rejects unknown roles and permission keys', async () => {
      const { db, captured } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      await expect(
        caller.admin.permission.toggleRolePermission({
          role: 'unknown',
          permission: 'operation.create',
          enabled: true,
        }),
      ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
      await expect(
        caller.admin.permission.toggleRolePermission({
          role: 'guest',
          permission: 'unknown.permission',
          enabled: true,
        }),
      ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
      expect(captured.inserted).toHaveLength(0);
    });

    it('resetDefaults clears DB, repopulates baseline permissions, and resets in-memory cache', async () => {
      // Modify cache first
      setRolePermissionInCache('guest', 'mapSnapshot.list', true);
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(true);

      const { db, captured } = createFakeDatabase();
      const caller = await createCaller(db, makeAuthSession('admin'));

      const result = await caller.admin.permission.resetDefaults();
      expect(result).toEqual({ success: true });

      // Cache should be back to baseline
      expect(hasPermission('guest', 'mapSnapshot.list')).toBe(false);
      expect(hasPermission('admin', 'operation.create')).toBe(true);
      expect(captured.deleted).toContain('all');
      expect(captured.inserted.length).toBeGreaterThan(0);
    });
  });
});
