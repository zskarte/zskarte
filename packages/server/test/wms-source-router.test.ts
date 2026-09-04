import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import type { Role } from '../src/auth/roles.js';
import { wmsSourceRouter } from '../src/modules/wms-source/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import {
  type AuthSession,
  createMockDb,
  createSilentLogger,
  createTestContext,
  createTestSession,
  TEST_ORG_ID,
} from './helpers/index.js';

const ORG_A = TEST_ORG_ID;
const ORG_B = '2f1d1c9a-8f4b-4f1e-9b3a-9c1d2e3f4a5b';
const SOURCE_OWN = '55555555-5555-4555-8555-555555555555';
const SOURCE_FOREIGN = '66666666-6666-4666-8666-666666666666';

const dialect = new PgDialect();
const toQuery = (condition: any) => dialect.sqlToQuery(condition as SQL);

const authSession = (role: Role, organizationId: string | null): AuthSession => createTestSession(role, organizationId);

const row = (overrides: Record<string, unknown> = {}) => ({
  documentId: SOURCE_OWN,
  label: 'Own source',
  type: 'wms',
  url: 'https://example.org/wms',
  attribution: [['Example', 'https://example.org']],
  public: false,
  organizationId: ORG_A,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  ...overrides,
});

const publicForeignRow = () =>
  row({ documentId: SOURCE_FOREIGN, label: 'Foreign public', public: true, organizationId: ORG_B });

const caller = async (options: { db?: any; authSession?: AuthSession | null }) => {
  const db = options.db ?? createMockDb().db;
  const ctx = await createTestContext({
    db,
    authSession: options.authSession ?? null,
    logger: createSilentLogger(),
  });
  return createCallerFactory(wmsSourceRouter)(ctx);
};

describe('wmsSource.list', () => {
  it('is reachable for anonymous callers and filters to public rows only', async () => {
    const { db, captured } = createMockDb({ selects: [[publicForeignRow()]] });

    await expect((await caller({ db })).list()).resolves.toEqual([
      {
        documentId: SOURCE_FOREIGN,
        label: 'Foreign public',
        type: 'wms',
        url: 'https://example.org/wms',
        attribution: [['Example', 'https://example.org']],
        public: true,
        organization: { documentId: ORG_B },
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ]);

    const filter = toQuery(captured.where[0]);
    expect(filter.sql).not.toContain('organization_id');
    expect(filter.params).toEqual([true]);
  });

  it('filters an organization caller to own plus public rows', async () => {
    const { db, captured } = createMockDb({ selects: [[row(), publicForeignRow()]] });
    const list = await (await caller({ db, authSession: authSession('organization', ORG_A) })).list();

    expect(list.map((source) => source.organization)).toEqual([{ documentId: ORG_A }, { documentId: ORG_B }]);

    const filter = toQuery(captured.where[0]);
    expect(filter.sql).toContain('organization_id');
    expect(filter.params).toEqual([true, ORG_A]);
  });

  it('defaults a null attribution and a null public flag', async () => {
    const { db } = createMockDb({ selects: [[row({ attribution: null, public: null })]] });
    const [source] = await (await caller({ db, authSession: authSession('organization', ORG_A) })).list();

    expect(source).toMatchObject({ attribution: null, public: false });
  });
});

describe('wmsSource.byId', () => {
  it('returns a public row of another organization', async () => {
    const { db } = createMockDb({ selects: [[publicForeignRow()]] });
    const source = await (
      await caller({ db, authSession: authSession('organization', ORG_A) })
    ).byId({
      documentId: SOURCE_FOREIGN,
    });

    expect(source).toMatchObject({ documentId: SOURCE_FOREIGN, organization: { documentId: ORG_B }, public: true });
  });

  it('is forbidden for a private row of another organization', async () => {
    const { db } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.byId({ documentId: SOURCE_FOREIGN })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'This action is forbidden.',
    });
  });
});

describe('wmsSource.create', () => {
  it('stores the scope organization and only the allowlisted columns', async () => {
    const { db, captured } = createMockDb({
      returning: [[{ documentId: SOURCE_OWN }]],
      selects: [[row()]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(
      trpc.create({
        data: {
          label: 'Own source',
          type: 'wms',
          url: 'https://example.org/wms',
          attribution: [['Example', 'https://example.org']],
          public: false,
          organization: ORG_A,
        },
      }),
    ).resolves.toMatchObject({ documentId: SOURCE_OWN, organization: { documentId: ORG_A } });

    expect(captured.inserted[0]).toEqual({
      label: 'Own source',
      type: 'wms',
      url: 'https://example.org/wms',
      attribution: [['Example', 'https://example.org']],
      public: false,
      organizationId: ORG_A,
    });
  });

  it('strips unknown payload keys', async () => {
    const { db, captured } = createMockDb({
      returning: [[{ documentId: SOURCE_OWN }]],
      selects: [[row()]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await trpc.create({ data: { label: 'Own source', owner: true, organizationId: ORG_B } as never });

    expect(captured.inserted[0]).toEqual({ label: 'Own source', organizationId: ORG_A });
  });

  it('is forbidden with a foreign organization in the payload', async () => {
    const { db, captured } = createMockDb();
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.create({ data: { label: 'x', organization: ORG_B } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden with a forced documentId', async () => {
    const { db, captured } = createMockDb();
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.create({ data: { documentId: SOURCE_OWN, label: 'x' } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden for a role without the permission', async () => {
    const { db } = createMockDb();
    const trpc = await caller({ db, authSession: authSession('operationread', ORG_A) });

    await expect(trpc.create({ data: { label: 'x' } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('is unauthorized for anonymous callers', async () => {
    const { db } = createMockDb();

    await expect((await caller({ db })).create({ data: { label: 'x' } })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});

describe('wmsSource.update', () => {
  it('updates an own row and repeats the current identifiers', async () => {
    const { db, captured } = createMockDb({
      selects: [[row()], [row({ label: 'Renamed' })]],
      returning: [[{ documentId: SOURCE_OWN }]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(
      trpc.update({
        documentId: SOURCE_OWN,
        data: { documentId: SOURCE_OWN, organization: ORG_A, label: 'Renamed' },
      }),
    ).resolves.toMatchObject({ label: 'Renamed' });

    expect(captured.updated[0]).toMatchObject({ label: 'Renamed' });
    expect(captured.updated[0]).not.toHaveProperty('organizationId');
  });

  it('is forbidden for a private row of another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_FOREIGN, data: { label: 'x' } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden for a public row of another organization', async () => {
    // findOwned filters on the scope organization, so the public escape hatch does not apply
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_FOREIGN, data: { public: true } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload moves the row to another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_OWN, data: { organization: ORG_B } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload clears the organization', async () => {
    const { db } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_OWN, data: { organization: null } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('wmsSource.delete', () => {
  it('deletes an own row and returns it', async () => {
    const { db, captured } = createMockDb({
      selects: [[row()]],
      returning: [[{ documentId: SOURCE_OWN }]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_OWN })).resolves.toMatchObject({ documentId: SOURCE_OWN });
    expect(captured.deleted).toHaveLength(1);
  });

  it('is forbidden for a row of another organization', async () => {
    const { db, captured } = createMockDb({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_FOREIGN })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.deleted).toHaveLength(0);
  });

  it('is forbidden for operationwrite, which may create and update but not delete', async () => {
    const { db, captured } = createMockDb({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('operationwrite', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_OWN })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(captured.deleted).toHaveLength(0);
  });
});
