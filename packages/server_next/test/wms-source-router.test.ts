import type { TRPCError } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { wmsSourceRouter } from '../src/modules/wms-source/router.js';
import { type AuthSession, createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const ORG_A = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
const ORG_B = '2f1d1c9a-8f4b-4f1e-9b3a-9c1d2e3f4a5b';
const SOURCE_OWN = '55555555-5555-4555-8555-555555555555';
const SOURCE_FOREIGN = '66666666-6666-4666-8666-666666666666';

const dialect = new PgDialect();
const toQuery = (condition: SQL) => dialect.sqlToQuery(condition);

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

/** hand-built drizzle stub: `selects` feeds the select chains, `returning` the write chains */
const createFakeDatabase = (options: { selects?: unknown[][]; returning?: unknown[][] } = {}) => {
  const selects = [...(options.selects ?? [])];
  const returning = [...(options.returning ?? [])];
  const captured = {
    where: [] as SQL[],
    inserted: [] as Record<string, unknown>[],
    updated: [] as Record<string, unknown>[],
    deletes: 0,
  };
  const nextSelect = () => Promise.resolve(selects.shift() ?? []);
  const nextReturning = () => Promise.resolve(returning.shift() ?? []);

  const query: any = {
    from: () => query,
    leftJoin: () => query,
    where: (condition: SQL) => {
      captured.where.push(condition);
      return query;
    },
    orderBy: () => nextSelect(),
    limit: () => nextSelect(),
  };

  const db = {
    select: () => query,
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        captured.inserted.push(values);
        return { returning: () => nextReturning() };
      },
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => {
        captured.updated.push(values);
        return {
          where: (condition: SQL) => {
            captured.where.push(condition);
            return { returning: () => nextReturning() };
          },
        };
      },
    }),
    delete: () => ({
      where: (condition: SQL) => {
        captured.where.push(condition);
        captured.deletes += 1;
        return { returning: () => nextReturning() };
      },
    }),
  } as unknown as Database;

  return { db, captured };
};

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

const caller = async (options: { db: Database; authSession?: AuthSession }) =>
  createCallerFactory(wmsSourceRouter)(
    await createContextInner({ db: options.db, authSession: options.authSession ?? null }),
  );

describe('wmsSource.list', () => {
  it('is reachable for anonymous callers and filters to public rows only', async () => {
    const { db, captured } = createFakeDatabase({ selects: [[publicForeignRow()]] });

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
    const { db, captured } = createFakeDatabase({ selects: [[row(), publicForeignRow()]] });
    const list = await (await caller({ db, authSession: authSession('organization', ORG_A) })).list();

    expect(list.map((source) => source.organization)).toEqual([{ documentId: ORG_A }, { documentId: ORG_B }]);

    const filter = toQuery(captured.where[0]);
    expect(filter.sql).toContain('organization_id');
    expect(filter.params).toEqual([true, ORG_A]);
  });

  it('defaults a null attribution and a null public flag', async () => {
    const { db } = createFakeDatabase({ selects: [[row({ attribution: null, public: null })]] });
    const [source] = await (await caller({ db, authSession: authSession('organization', ORG_A) })).list();

    expect(source).toMatchObject({ attribution: null, public: false });
  });
});

describe('wmsSource.byId', () => {
  it('returns a public row of another organization', async () => {
    const { db } = createFakeDatabase({ selects: [[publicForeignRow()]] });
    const source = await (await caller({ db, authSession: authSession('organization', ORG_A) })).byId({
      documentId: SOURCE_FOREIGN,
    });

    expect(source).toMatchObject({ documentId: SOURCE_FOREIGN, organization: { documentId: ORG_B }, public: true });
  });

  it('is forbidden for a private row of another organization', async () => {
    const { db } = createFakeDatabase({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.byId({ documentId: SOURCE_FOREIGN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
      message: 'This action is forbidden.',
    });
  });
});

describe('wmsSource.create', () => {
  it('stores the scope organization and only the allowlisted columns', async () => {
    const { db, captured } = createFakeDatabase({
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
    const { db, captured } = createFakeDatabase({
      returning: [[{ documentId: SOURCE_OWN }]],
      selects: [[row()]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await trpc.create({ data: { label: 'Own source', owner: true, organizationId: ORG_B } as never });

    expect(captured.inserted[0]).toEqual({ label: 'Own source', organizationId: ORG_A });
  });

  it('is forbidden with a foreign organization in the payload', async () => {
    const { db, captured } = createFakeDatabase();
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.create({ data: { label: 'x', organization: ORG_B } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden with a forced documentId', async () => {
    const { db, captured } = createFakeDatabase();
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.create({ data: { documentId: SOURCE_OWN, label: 'x' } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.inserted).toHaveLength(0);
  });

  it('is forbidden for a role without the permission', async () => {
    const { db } = createFakeDatabase();
    const trpc = await caller({ db, authSession: authSession('operationread', ORG_A) });

    await expect(trpc.create({ data: { label: 'x' } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('is unauthorized for anonymous callers', async () => {
    const { db } = createFakeDatabase();

    await expect((await caller({ db })).create({ data: { label: 'x' } })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'UNAUTHORIZED',
    });
  });
});

describe('wmsSource.update', () => {
  it('updates an own row and repeats the current identifiers', async () => {
    const { db, captured } = createFakeDatabase({
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
    const { db, captured } = createFakeDatabase({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_FOREIGN, data: { label: 'x' } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden for a public row of another organization', async () => {
    // findOwned filters on the scope organization, so the public escape hatch does not apply
    const { db, captured } = createFakeDatabase({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_FOREIGN, data: { public: true } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload moves the row to another organization', async () => {
    const { db, captured } = createFakeDatabase({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_OWN, data: { organization: ORG_B } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
    expect(captured.updated).toHaveLength(0);
  });

  it('is forbidden when the payload clears the organization', async () => {
    const { db } = createFakeDatabase({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.update({ documentId: SOURCE_OWN, data: { organization: null } })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'FORBIDDEN' });
  });
});

describe('wmsSource.delete', () => {
  it('deletes an own row and returns it', async () => {
    const { db, captured } = createFakeDatabase({
      selects: [[row()]],
      returning: [[{ documentId: SOURCE_OWN }]],
    });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_OWN })).resolves.toMatchObject({ documentId: SOURCE_OWN });
    expect(captured.deletes).toBe(1);
  });

  it('is forbidden for a row of another organization', async () => {
    const { db, captured } = createFakeDatabase({ selects: [[]] });
    const trpc = await caller({ db, authSession: authSession('organization', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_FOREIGN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.deletes).toBe(0);
  });

  it('is forbidden for operationwrite, which may create and update but not delete', async () => {
    const { db, captured } = createFakeDatabase({ selects: [[row()]] });
    const trpc = await caller({ db, authSession: authSession('operationwrite', ORG_A) });

    await expect(trpc.delete({ documentId: SOURCE_OWN })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(captured.deletes).toBe(0);
  });
});
