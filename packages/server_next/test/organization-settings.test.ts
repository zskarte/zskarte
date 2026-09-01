import type { TRPCError } from '@trpc/server';
import { getTableName } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/db/client.js';
import type { Logger } from '../src/lib/logger.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createContextInner, type AuthSession } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const ORGANIZATION_ID = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
const FOREIGN_ORGANIZATION_ID = '1f0a3e9a-2f4b-4c73-9f0a-7c9f1c62a111';
const WMS_SOURCE_ID = '3a1c5e2d-6b4f-4a8e-9c1d-2e5f7a9b3c4d';
const MAP_LAYER_ID = '7d9e1f3a-5c7b-4e2d-8f6a-1b3c5d7e9f01';

const authSession = (role: AuthSession['user']['zsRole'], organizationId: string | null): AuthSession => ({
  user: {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    username: 'test',
    organizationId,
    zsRole: role,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'session-1',
    token: 'token',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    ipAddress: null,
    userAgent: null,
    operationId: null,
    organizationId: null,
    permission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

interface Recorded {
  updated: { table: string; set: Record<string, unknown> }[];
  deleted: string[];
  inserted: { table: string; values: unknown[] }[];
}

const createFakeDatabase = (options: { insertError?: unknown } = {}) => {
  const recorded: Recorded = { updated: [], deleted: [], inserted: [] };
  const db: any = {
    update: (table: any) => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          recorded.updated.push({ table: getTableName(table), set: values });
        },
      }),
    }),
    delete: (table: any) => ({
      where: async () => {
        recorded.deleted.push(getTableName(table));
      },
    }),
    insert: (table: any) => ({
      values: async (values: unknown[]) => {
        if (options.insertError) throw options.insertError;
        recorded.inserted.push({ table: getTableName(table), values });
      },
    }),
    transaction: async (callback: (tx: unknown) => Promise<void>) => callback(db),
  };
  return { db: db as Database, recorded };
};

const createSelectDatabase = (rowsByTable: Record<string, unknown[]>): Database => {
  const createQuery = () => {
    let table = '';
    const rows = () => Promise.resolve(rowsByTable[table] ?? []);
    const query: any = {
      from: (source: any) => {
        table = getTableName(source);
        return query;
      },
      leftJoin: () => query,
      where: () => Object.assign(rows(), { limit: () => rows() }),
    };
    return query;
  };
  return { select: () => createQuery() } as unknown as Database;
};

const createFakeLogger = () =>
  ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }) as unknown as Logger & {
    warn: ReturnType<typeof vi.fn>;
  };

const createCaller = async (options: {
  db?: Database;
  logger?: Logger;
  role?: AuthSession['user']['zsRole'];
  organizationId?: string | null;
}) =>
  createCallerFactory(organizationRouter)(
    await createContextInner({
      db: options.db,
      logger: options.logger,
      authSession: authSession(options.role ?? 'organization', options.organizationId ?? ORGANIZATION_ID),
    }),
  );

const settings = {
  journalMessageTextTemplate: 'template',
  changeset: { applyOnExpertViewOnly: true, hiddenMode: false, automerge: false, conflictTakeOur: true },
};

describe('organization.current', () => {
  it('returns the scope derived organization with the session projection', async () => {
    const db = createSelectDatabase({
      organizations: [
        {
          documentId: ORGANIZATION_ID,
          name: 'Alpha',
          mapLongitude: 7.44297,
          mapLatitude: 46.94635,
          mapZoomLevel: 16,
          defaultLocale: 'de-CH',
          url: null,
          journalEntryTemplate: null,
          settings,
          logo: null,
        },
      ],
      organization_wms_sources: [{ documentId: WMS_SOURCE_ID }],
      organization_map_layer_favorites: [{ documentId: MAP_LAYER_ID }],
    });
    const caller = await createCaller({ db });

    await expect(caller.current()).resolves.toMatchObject({
      documentId: ORGANIZATION_ID,
      name: 'Alpha',
      settings,
      operations: [],
      users: [],
      wms_sources: [WMS_SOURCE_ID],
      map_layer_favorites: [MAP_LAYER_ID],
    });
  });

  it('returns null when the organization row is gone', async () => {
    const caller = await createCaller({ db: createSelectDatabase({}) });

    await expect(caller.current()).resolves.toBeNull();
  });
});

describe('organization.updateSettings', () => {
  it('writes only the settings column of the own organization', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db, role: 'admin' });

    await expect(caller.updateSettings({ organizationId: ORGANIZATION_ID, data: settings })).resolves.toEqual({
      success: true,
    });
    expect(recorded.updated).toEqual([{ table: 'organizations', set: { settings } }]);
  });

  it('accepts a null payload like the strapi endpoint did', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db, role: 'admin' });

    await expect(caller.updateSettings({ organizationId: ORGANIZATION_ID, data: null })).resolves.toEqual({
      success: true,
    });
    expect(recorded.updated).toEqual([{ table: 'organizations', set: { settings: null } }]);
  });

  it('rejects a foreign organization id and logs the access violation', async () => {
    const { db, recorded } = createFakeDatabase();
    const logger = createFakeLogger();
    const caller = await createCaller({ db, logger, role: 'admin' });

    await expect(
      caller.updateSettings({ organizationId: FOREIGN_ORGANIZATION_ID, data: settings }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
    expect(recorded.updated).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ userOrganisationId: ORGANIZATION_ID }),
      `[global::accessControl]: access not allowed, organizationId:${FOREIGN_ORGANIZATION_ID}`,
    );
  });

  it('rejects a role without the organization.updateSettings permission', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db, logger: createFakeLogger(), role: 'organization' });

    await expect(caller.updateSettings({ organizationId: ORGANIZATION_ID, data: settings })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(recorded.updated).toEqual([]);
  });
});

describe('organization.updateJournalEntryTemplate', () => {
  it('writes only the journal entry template column', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await expect(
      caller.updateJournalEntryTemplate({ organizationId: ORGANIZATION_ID, data: { title: 'x' } }),
    ).resolves.toEqual({ success: true });
    expect(recorded.updated).toEqual([{ table: 'organizations', set: { journalEntryTemplate: { title: 'x' } } }]);
  });

  it('rejects a foreign organization id', async () => {
    const { db } = createFakeDatabase();
    const caller = await createCaller({ db, logger: createFakeLogger() });

    await expect(
      caller.updateJournalEntryTemplate({ organizationId: FOREIGN_ORGANIZATION_ID, data: null }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
  });
});

describe('organization.updateLayerSettings', () => {
  it('replaces both join tables and ignores duplicates', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({
        organizationId: ORGANIZATION_ID,
        data: { wms_sources: [WMS_SOURCE_ID, WMS_SOURCE_ID], map_layer_favorites: [MAP_LAYER_ID] },
      }),
    ).resolves.toEqual({ success: true });

    expect(recorded.deleted).toEqual(['organization_wms_sources', 'organization_map_layer_favorites']);
    expect(recorded.inserted).toEqual([
      {
        table: 'organization_wms_sources',
        values: [{ organizationId: ORGANIZATION_ID, wmsSourceId: WMS_SOURCE_ID }],
      },
      {
        table: 'organization_map_layer_favorites',
        values: [{ organizationId: ORGANIZATION_ID, mapLayerId: MAP_LAYER_ID }],
      },
    ]);
  });

  it('leaves a join table untouched when its key is absent from the payload', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({ organizationId: ORGANIZATION_ID, data: { wms_sources: [WMS_SOURCE_ID] } });

    expect(recorded.deleted).toEqual(['organization_wms_sources']);
    expect(recorded.inserted.map(({ table }) => table)).toEqual(['organization_wms_sources']);
  });

  it('clears a join table when its key is present but empty', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({ organizationId: ORGANIZATION_ID, data: { map_layer_favorites: [] } });

    expect(recorded.deleted).toEqual(['organization_map_layer_favorites']);
    expect(recorded.inserted).toEqual([]);
  });

  it('strips keys outside the two key allowlist', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({
      organizationId: ORGANIZATION_ID,
      data: { wms_sources: [WMS_SOURCE_ID], name: 'renamed', settings: null } as never,
    });

    expect(recorded.updated).toEqual([]);
    expect(recorded.deleted).toEqual(['organization_wms_sources']);
  });

  it('rejects entries that are not uuids', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({ organizationId: ORGANIZATION_ID, data: { wms_sources: ['1'] } }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
    expect(recorded.deleted).toEqual([]);
  });

  it('turns a foreign key violation into a bad request', async () => {
    const { db } = createFakeDatabase({ insertError: Object.assign(new Error('fk'), { code: '23503' }) });
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({ organizationId: ORGANIZATION_ID, data: { wms_sources: [WMS_SOURCE_ID] } }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
  });

  it('rejects a foreign organization id', async () => {
    const { db, recorded } = createFakeDatabase();
    const caller = await createCaller({ db, logger: createFakeLogger() });

    await expect(
      caller.updateLayerSettings({ organizationId: FOREIGN_ORGANIZATION_ID, data: { wms_sources: [] } }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
    expect(recorded.deleted).toEqual([]);
  });
});
