import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadRolePermissionsFromDb, resetPermissionCache } from '../src/auth/permissions.js';
import type { Role } from '../src/auth/roles.js';
import type { Database } from '../src/db/client.js';
import type { Logger } from '../src/lib/logger.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import {
  createMockDb,
  createSilentLogger,
  createTestContext,
  createTestSession,
  DEFAULT_ROLE_PERMISSION_ROWS,
  TEST_ORG_ID,
} from './helpers/index.js';

const FOREIGN_ORGANIZATION_ID = '1f0a3e9a-2f4b-4c73-9f0a-7c9f1c62a111';
const WMS_SOURCE_ID = '3a1c5e2d-6b4f-4a8e-9c1d-2e5f7a9b3c4d';
const MAP_LAYER_ID = '7d9e1f3a-5c7b-4e2d-8f6a-1b3c5d7e9f01';

const createCaller = async (options: {
  db?: Database;
  logger?: Logger;
  role?: Role;
  organizationId?: string | null;
}) => {
  const session = createTestSession(
    options.role ?? 'organization',
    options.organizationId !== undefined ? options.organizationId : TEST_ORG_ID,
  );
  return createCallerFactory(organizationRouter)(
    await createTestContext({
      db: options.db,
      logger: options.logger ?? createSilentLogger(),
      authSession: session,
    }),
  );
};

const settings = {
  journalMessageTextTemplate: 'template',
  changeset: { applyOnExpertViewOnly: true, hiddenMode: false, automerge: false, conflictTakeOur: true },
};

beforeEach(async () => {
  resetPermissionCache();
  const { db } = createMockDb({ rows: DEFAULT_ROLE_PERMISSION_ROWS });
  await loadRolePermissionsFromDb(db);
});

describe('organization.current', () => {
  it('returns the scope derived organization with the session projection', async () => {
    const { db } = createMockDb({
      tables: {
        organizations: [
          {
            documentId: TEST_ORG_ID,
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
      },
    });
    const caller = await createCaller({ db });

    await expect(caller.current()).resolves.toMatchObject({
      documentId: TEST_ORG_ID,
      name: 'Alpha',
      settings,
      operations: [],
      users: [],
      wms_sources: [WMS_SOURCE_ID],
      map_layer_favorites: [MAP_LAYER_ID],
    });
  });

  it('returns null when the organization row is gone', async () => {
    const { db } = createMockDb({ tables: {} });
    const caller = await createCaller({ db });

    await expect(caller.current()).resolves.toBeNull();
  });
});

describe('organization.updateSettings', () => {
  it('writes only the settings column of the own organization', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db, role: 'admin' });

    await expect(caller.updateSettings({ organizationId: TEST_ORG_ID, data: settings })).resolves.toEqual({
      success: true,
    });
    expect(captured.updates.map((u) => ({ table: u.tableName, set: u.values }))).toEqual([
      { table: 'organizations', set: { settings } },
    ]);
  });

  it('accepts a null payload like the strapi endpoint did', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db, role: 'admin' });

    await expect(caller.updateSettings({ organizationId: TEST_ORG_ID, data: null })).resolves.toEqual({
      success: true,
    });
    expect(captured.updates.map((u) => ({ table: u.tableName, set: u.values }))).toEqual([
      { table: 'organizations', set: { settings: null } },
    ]);
  });

  it('rejects a foreign organization id and logs the access violation', async () => {
    const { db, captured } = createMockDb();
    const logger = createSilentLogger();
    const warnSpy = vi.spyOn(logger, 'warn');
    const caller = await createCaller({ db, logger, role: 'admin' });

    await expect(
      caller.updateSettings({ organizationId: FOREIGN_ORGANIZATION_ID, data: settings }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
    expect(captured.updates).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ userOrganisationId: TEST_ORG_ID }),
      `[global::accessControl]: access not allowed, organizationId:${FOREIGN_ORGANIZATION_ID}`,
    );
  });

  it('rejects a role without the organization.updateSettings permission', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db, role: 'guest' });

    await expect(caller.updateSettings({ organizationId: TEST_ORG_ID, data: settings })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.updates).toEqual([]);
  });
});

describe('organization.updateJournalEntryTemplate', () => {
  it('writes only the journal entry template column', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await expect(
      caller.updateJournalEntryTemplate({ organizationId: TEST_ORG_ID, data: { title: 'x' } }),
    ).resolves.toEqual({ success: true });
    expect(captured.updates.map((u) => ({ table: u.tableName, set: u.values }))).toEqual([
      { table: 'organizations', set: { journalEntryTemplate: { title: 'x' } } },
    ]);
  });

  it('rejects a foreign organization id', async () => {
    const { db } = createMockDb();
    const caller = await createCaller({ db });

    await expect(
      caller.updateJournalEntryTemplate({ organizationId: FOREIGN_ORGANIZATION_ID, data: null }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
  });
});

describe('organization.updateLayerSettings', () => {
  it('replaces both join tables and ignores duplicates', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({
        organizationId: TEST_ORG_ID,
        data: { wms_sources: [WMS_SOURCE_ID, WMS_SOURCE_ID], map_layer_favorites: [MAP_LAYER_ID] },
      }),
    ).resolves.toEqual({ success: true });

    expect(captured.deletes.map((d) => d.tableName)).toEqual([
      'organization_wms_sources',
      'organization_map_layer_favorites',
    ]);
    expect(captured.inserts.map((i) => ({ table: i.tableName, values: i.values }))).toEqual([
      {
        table: 'organization_wms_sources',
        values: [{ organizationId: TEST_ORG_ID, wmsSourceId: WMS_SOURCE_ID }],
      },
      {
        table: 'organization_map_layer_favorites',
        values: [{ organizationId: TEST_ORG_ID, mapLayerId: MAP_LAYER_ID }],
      },
    ]);
  });

  it('leaves a join table untouched when its key is absent from the payload', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({ organizationId: TEST_ORG_ID, data: { wms_sources: [WMS_SOURCE_ID] } });

    expect(captured.deletes.map((d) => d.tableName)).toEqual(['organization_wms_sources']);
    expect(captured.inserts.map((i) => i.tableName)).toEqual(['organization_wms_sources']);
  });

  it('clears a join table when its key is present but empty', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({ organizationId: TEST_ORG_ID, data: { map_layer_favorites: [] } });

    expect(captured.deletes.map((d) => d.tableName)).toEqual(['organization_map_layer_favorites']);
    expect(captured.inserts).toEqual([]);
  });

  it('strips keys outside the two key allowlist', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await caller.updateLayerSettings({
      organizationId: TEST_ORG_ID,
      data: { wms_sources: [WMS_SOURCE_ID], name: 'renamed', settings: null } as never,
    });

    expect(captured.updates).toEqual([]);
    expect(captured.deletes.map((d) => d.tableName)).toEqual(['organization_wms_sources']);
  });

  it('rejects entries that are not uuids', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({ organizationId: TEST_ORG_ID, data: { wms_sources: ['1'] } }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(captured.deletes).toEqual([]);
  });

  it('turns a foreign key violation into a bad request', async () => {
    const { db } = createMockDb({ insertError: Object.assign(new Error('fk'), { code: '23503' }) });
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({ organizationId: TEST_ORG_ID, data: { wms_sources: [WMS_SOURCE_ID] } }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects a foreign organization id', async () => {
    const { db, captured } = createMockDb();
    const caller = await createCaller({ db });

    await expect(
      caller.updateLayerSettings({ organizationId: FOREIGN_ORGANIZATION_ID, data: { wms_sources: [] } }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'This action is forbidden.' });
    expect(captured.deletes).toEqual([]);
  });
});
