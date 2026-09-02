import type { TRPCError } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { mapLayerRouter } from '../src/modules/map-layer/router.js';
import type { AuthSession } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import {
  TEST_ORG_ID,
  TEST_ORG_ID_2,
  createMockDb,
  createSilentLogger,
  createTestContext,
  createTestSession,
} from './helpers/index.js';

const ORG_A = TEST_ORG_ID;
const ORG_B = TEST_ORG_ID_2;
const LAYER_OWN = '11111111-1111-4111-8111-111111111111';
const LAYER_FOREIGN = '22222222-2222-4222-8222-222222222222';
const MEDIA = '33333333-3333-4333-8333-333333333333';
const WMS = '44444444-4444-4444-8444-444444444444';

const dialect = new PgDialect();
const toQuery = (condition: SQL) => dialect.sqlToQuery(condition);

const row = (overrides: Record<string, unknown> = {}) => ({
  documentId: LAYER_OWN,
  label: 'Own layer',
  serverLayerName: 'own',
  type: 'wms',
  wmsSourceId: null,
  customSource: null,
  mediaSourceId: null,
  options: { opacity: 0.5 },
  public: false,
  organizationId: ORG_A,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  mediaSourceUrl: null,
  mediaSourceName: null,
  ...overrides,
});

const publicForeignRow = () =>
  row({ documentId: LAYER_FOREIGN, label: 'Foreign public', public: true, organizationId: ORG_B });

const caller = async (options: { db: Database; authSession?: AuthSession | null }) =>
  createCallerFactory(mapLayerRouter)(
    await createTestContext({
      db: options.db,
      authSession: options.authSession ?? null,
      logger: createSilentLogger(),
    }),
  );

describe('mapLayer.list', () => {
  it('is reachable for anonymous callers and filters to public rows only', async () => {
    const { db, captured } = createMockDb({ selects: [[publicForeignRow()]] });

    await expect((await caller({ db })).list()).resolves.toEqual([
      {
        documentId: LAYER_FOREIGN,
        label: 'Foreign public',
        serverLayerName: 'own',
        type: 'wms',
        public: true,
        options: { opacity: 0.5 },
        wms_source: null,
        media_source: null,
        custom_source: null,
        organization: { documentId: ORG_B },
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ]);

    const filter = toQuery(captured.where[0] as SQL);
    expect(filter.sql).not.toContain('organization_id');
    expect(filter.params).toEqual([true]);
  });

  it('filters an organization caller to own plus public rows', async () => {
    const { db, captured } = createMockDb({ selects: [[row(), publicForeignRow()]] });
    const list = await (await caller({ db, authSession: createTestSession('organization', ORG_A) })).list();

    expect(list.map((layer) => layer.organization)).toEqual([{ documentId: ORG_A }, { documentId: ORG_B }]);

    const filter = toQuery(captured.where[0] as SQL);
    expect(filter.sql).toContain('organization_id');
    expect(filter.params).toEqual([true, ORG_A]);
  });

  it('populates the media and wms relations the app reads', async () => {
    const { db } = createMockDb({
      selects: [
        [
          row({
            wmsSourceId: WMS,
            mediaSourceId: MEDIA,
            mediaSourceUrl: '/uploads/style.json',
            mediaSourceName: 'style.json',
            customSource: 'https://example.org/wms',
            options: null,
          }),
        ],
      ],
    });
    const [layer] = await (await caller({ db, authSession: createTestSession('organization', ORG_A) })).list();

    expect(layer).toMatchObject({
      wms_source: { documentId: WMS },
      media_source: { documentId: MEDIA, url: '/uploads/style.json', name: 'style.json' },
      custom_source: 'https://example.org/wms',
      options: {},
    });
  });
});

describe('mapLayer.byId', () => {
  it('returns a public row of another organization', async () => {
    const { db } = createMockDb({ selects: [[publicForeignRow()]] });
    const layer = await (await caller({ db, authSession: createTestSession('organization', ORG_A) })).byId({
      documentId: LAYER_FOREIGN,
    });

    expect(layer).toMatchObject({ documentId: LAYER_FOREIGN, organization: { documentId: ORG_B }, public: true });
  });

  it('is forbidden for a private row of another organization', async () => {
    const { db } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.byId({ documentId: LAYER_FOREIGN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
      message: 'This action is forbidden.',
    });
  });
});

describe('mapLayer.create', () => {
  it('stores the scope organization and only the allowlisted columns', async () => {
    const { db, captured } = createMockDb({
      returning: [[{ documentId: LAYER_OWN }]],
      selects: [[row()]],
    });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(
      trpc.create({
        data: {
          label: 'Own layer',
          serverLayerName: 'own',
          type: 'wms',
          wms_source: { connect: [WMS] },
          media_source: MEDIA,
          custom_source: null,
          options: { opacity: 0.5 },
          public: false,
          organization: ORG_A,
        },
      }),
    ).resolves.toMatchObject({ documentId: LAYER_OWN, organization: { documentId: ORG_A } });

    expect(captured.inserted[0]).toEqual({
      label: 'Own layer',
      serverLayerName: 'own',
      type: 'wms',
      wmsSourceId: WMS,
      mediaSourceId: MEDIA,
      customSource: null,
      options: { opacity: 0.5 },
      public: false,
      organizationId: ORG_A,
    });
  });

  it('strips unknown payload keys', async () => {
    const { db, captured } = createMockDb({
      returning: [[{ documentId: LAYER_OWN }]],
      selects: [[row()]],
    });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await trpc.create({
      data: { label: 'Own layer', organizationId: ORG_B, createdAt: new Date(), nope: true } as never,
    });

    expect(captured.inserted[0]).toEqual({ label: 'Own layer', organizationId: ORG_A });
  });

  it('is forbidden with a foreign organization in the payload', async () => {
    const { db, captured } = createMockDb();
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.create({ data: { label: 'x', organization: ORG_B } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden with a forced documentId', async () => {
    const { db, captured } = createMockDb();
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.create({ data: { documentId: LAYER_OWN, label: 'x' } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden for a role without the permission', async () => {
    const { db } = createMockDb();
    const trpc = await caller({ db, authSession: createTestSession('operationread', ORG_A) });

    await expect(trpc.create({ data: { label: 'x' } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('is unauthorized for anonymous callers', async () => {
    const { db } = createMockDb();

    await expect((await caller({ db })).create({ data: { label: 'x' } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'UNAUTHORIZED',
    });
  });
});

describe('mapLayer.update', () => {
  it('updates an own row and repeats the current identifiers', async () => {
    const { db, captured } = createMockDb({
      selects: [[row()], [row({ label: 'Renamed' })]],
      returning: [[{ documentId: LAYER_OWN }]],
    });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(
      trpc.update({
        documentId: LAYER_OWN,
        data: { documentId: LAYER_OWN, organization: ORG_A, label: 'Renamed' },
      }),
    ).resolves.toMatchObject({ label: 'Renamed' });

    expect(captured.updated[0]).toMatchObject({ label: 'Renamed' });
    expect(captured.updated[0]).not.toHaveProperty('organizationId');
  });

  it('is forbidden for a private row of another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: LAYER_FOREIGN, data: { label: 'x' } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden for a public row of another organization', async () => {
    // findOwned filters on the scope organization, so the public escape hatch does not apply
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: LAYER_FOREIGN, data: { label: 'x' } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload moves the row to another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: LAYER_OWN, data: { organization: ORG_B } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload clears the organization', async () => {
    const { db } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: LAYER_OWN, data: { organization: null } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
  });

  it('is forbidden when the payload renames the documentId', async () => {
    const { db } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: LAYER_OWN, data: { documentId: LAYER_FOREIGN } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
  });
});

describe('mapLayer.delete', () => {
  it('deletes an own row and returns it', async () => {
    const { db, captured } = createMockDb({
      selects: [[row()]],
      returning: [[{ documentId: LAYER_OWN }]],
    });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: LAYER_OWN })).resolves.toMatchObject({ documentId: LAYER_OWN });
    expect(captured.deletes.length).toBe(1);
  });

  it('is forbidden for a row of another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: createTestSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: LAYER_FOREIGN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.deletes.length).toBe(0);
  });

  it('is forbidden for operationwrite, which may create and update but not delete', async () => {
    const { db, captured } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: createTestSession('operationwrite', ORG_A) });

    await expect(trpc.delete({ documentId: LAYER_OWN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.deletes.length).toBe(0);
  });
});
