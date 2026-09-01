import { TRPCError } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { mapSnapshotRouter } from '../src/modules/map-snapshot/router.js';
import { type AuthSession, createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const ORGANIZATION_ID = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
const FOREIGN_ORGANIZATION_ID = '2b5f5f6a-2a04-4e5e-9b23-0f5a86e3a111';
const OPERATION_ID = '4f4c6e1e-6c8a-4a5e-9f0f-6c2d8fd0b9a2';
const OTHER_OPERATION_ID = '8c2c9f0e-3d6b-4f1a-8f7e-1a2b3c4d5e6f';
const SNAPSHOT_ID = '9e0d1c2b-3a49-4b58-8c67-7d86e95fa4b3';

const authSession = (
  role: AuthSession['user']['zsRole'],
  organizationId: string | null,
  operationId: string | null = null,
): AuthSession => ({
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
    operationId,
    organizationId: null,
    permission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const dialect = new PgDialect();
const renderSql = (clause: unknown) => dialect.sqlToQuery(clause as SQL);

interface RecordedQuery {
  projection: string[];
  order?: unknown;
  whereSql: string;
  whereParams: unknown[];
}

interface StoredSnapshot {
  documentId: string;
  operationId: string;
  organizationId: string;
  mapState: unknown;
  changesetIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface FakeDatabaseOptions {
  operation?: { documentId: string; organizationId: string; phase: string } | null;
  snapshots?: StoredSnapshot[];
  total?: number;
}

/**
 * Hand-built drizzle stand-in. It dispatches on the projection (the operation lookup of
 * `operationProcedure` selects `phase`, the count selects `total`, `byId` selects `operationId`)
 * and only answers `byId` when the where clause really carries the tenant of the stored row.
 */
const createFakeDatabase = (options: FakeDatabaseOptions) => {
  const queries: RecordedQuery[] = [];
  const snapshots = options.snapshots ?? [];

  const rowsFor = (query: RecordedQuery): unknown[] => {
    if (query.projection.includes('phase')) {
      return options.operation ? [options.operation] : [];
    }
    if (query.projection.includes('total')) {
      return [{ total: options.total ?? snapshots.length }];
    }
    if (query.projection.includes('operationId')) {
      const match = snapshots.find((snapshot) => {
        const identifiers = new Set<unknown>([snapshot.documentId, snapshot.organizationId, snapshot.operationId]);
        return (
          query.whereParams.includes(snapshot.documentId) &&
          query.whereParams.includes(snapshot.organizationId) &&
          query.whereParams.every((param) => identifiers.has(param))
        );
      });
      return match ? [project(match, query.projection)] : [];
    }
    return snapshots.map((snapshot) => project(snapshot, query.projection));
  };

  const db = {
    select: (projection: Record<string, unknown>) => {
      const query: RecordedQuery = { projection: Object.keys(projection), whereSql: '', whereParams: [] };
      queries.push(query);

      // a promise carrying the builder methods, the rows are resolved after the chain was recorded
      const builder: any = Promise.resolve().then(() => rowsFor(query));
      builder.from = () => builder;
      builder.innerJoin = () => builder;
      builder.where = (clause: unknown) => {
        const rendered = renderSql(clause);
        query.whereSql = rendered.sql;
        query.whereParams = rendered.params;
        return builder;
      };
      builder.orderBy = (order: unknown) => {
        query.order = order;
        return builder;
      };
      builder.limit = () => builder;
      builder.offset = () => builder;
      return builder;
    },
  } as unknown as Database;

  return { db, queries };
};

const project = (row: StoredSnapshot, projection: string[]) =>
  Object.fromEntries(projection.map((key) => [key, (row as unknown as Record<string, unknown>)[key]]));

const snapshot = (createdAt: Date, overrides: Partial<StoredSnapshot> = {}): StoredSnapshot => ({
  documentId: SNAPSHOT_ID,
  operationId: OPERATION_ID,
  organizationId: ORGANIZATION_ID,
  mapState: { changesetIds: ['changeset-1'] },
  changesetIds: ['changeset-1'],
  createdAt,
  updatedAt: createdAt,
  ...overrides,
});

const createCaller = createCallerFactory(mapSnapshotRouter);

const activeOperation = { documentId: OPERATION_ID, organizationId: ORGANIZATION_ID, phase: 'active' };

describe('mapSnapshot.list', () => {
  it('returns the strapi pagination meta and sorts createdAt desc', async () => {
    const newest = new Date('2024-05-02T10:00:00.000Z');
    const oldest = new Date('2024-05-01T10:00:00.000Z');
    const { db, queries } = createFakeDatabase({
      operation: activeOperation,
      snapshots: [snapshot(newest), snapshot(oldest, { documentId: OTHER_OPERATION_ID })],
      total: 41,
    });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    const result = await createCaller(context).list({ operationId: OPERATION_ID, page: 2, pageSize: 20 });

    expect(result.meta).toEqual({ pagination: { page: 2, pageSize: 20, pageCount: 3, total: 41 } });
    expect(result.data.map((row) => row.createdAt)).toEqual([newest, oldest]);
    expect(result.data[0].createdAt).toBeInstanceOf(Date);

    const listQuery = queries.find((query) => query.order !== undefined);
    expect(renderSql(listQuery?.order).sql).toBe('"map_snapshots"."created_at" desc');
    expect(listQuery?.whereSql).toContain('"operations"."organization_id"');
    expect(listQuery?.whereParams).toContain(ORGANIZATION_ID);
  });

  it('narrows the sql projection to the requested fields', async () => {
    const { db, queries } = createFakeDatabase({
      operation: activeOperation,
      snapshots: [snapshot(new Date('2024-05-02T10:00:00.000Z'))],
    });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    const result = await createCaller(context).list({
      operationId: OPERATION_ID,
      fields: ['createdAt', 'changesetIds'],
    });

    const listQuery = queries.find((query) => query.order !== undefined);
    expect(listQuery?.projection).toEqual(['documentId', 'createdAt', 'changesetIds']);
    expect(result.data[0]).not.toHaveProperty('mapState');
  });

  it('selects all columns when fields is omitted', async () => {
    const { db, queries } = createFakeDatabase({
      operation: activeOperation,
      snapshots: [snapshot(new Date('2024-05-02T10:00:00.000Z'))],
    });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    await createCaller(context).list({ operationId: OPERATION_ID });

    const listQuery = queries.find((query) => query.order !== undefined);
    expect(listQuery?.projection).toEqual(['documentId', 'createdAt', 'updatedAt', 'changesetIds', 'mapState']);
  });

  it('rejects a field outside the allowlist', async () => {
    const { db } = createFakeDatabase({ operation: activeOperation });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    await expect(
      createCaller(context).list({ operationId: OPERATION_ID, fields: ['privateKeyEncrypted' as 'mapState'] }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
  });

  it('is forbidden for an operation of another organization', async () => {
    const { db } = createFakeDatabase({ operation: null });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    await expect(createCaller(context).list({ operationId: OPERATION_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });
});

describe('mapSnapshot.byId', () => {
  it('returns the full snapshot including mapState and a real Date', async () => {
    const createdAt = new Date('2024-05-02T10:00:00.000Z');
    const { db, queries } = createFakeDatabase({ snapshots: [snapshot(createdAt)] });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    const result = await createCaller(context).byId({ documentId: SNAPSHOT_ID });

    expect(result).toEqual({
      documentId: SNAPSHOT_ID,
      operationId: OPERATION_ID,
      mapState: { changesetIds: ['changeset-1'] },
      changesetIds: ['changeset-1'],
      createdAt,
      updatedAt: createdAt,
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(queries[0].whereSql).toContain('"operations"."organization_id"');
  });

  it('is forbidden for a snapshot of another organizations operation', async () => {
    const { db } = createFakeDatabase({
      snapshots: [snapshot(new Date(), { organizationId: FOREIGN_ORGANIZATION_ID })],
    });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('is forbidden for a share session pinned to another operation', async () => {
    const { db, queries } = createFakeDatabase({ snapshots: [snapshot(new Date())] });
    const context = await createContextInner({
      db,
      authSession: authSession('operationread', ORGANIZATION_ID, OTHER_OPERATION_ID),
    });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    expect(queries[0].whereParams).toContain(OTHER_OPERATION_ID);
  });

  it('is forbidden for an unknown snapshot', async () => {
    const { db } = createFakeDatabase({ snapshots: [] });
    const context = await createContextInner({ db, authSession: authSession('organization', ORGANIZATION_ID) });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('rejects a role without the mapSnapshot.byId permission', async () => {
    const { db } = createFakeDatabase({ snapshots: [snapshot(new Date())] });
    const context = await createContextInner({ db, authSession: authSession('public', ORGANIZATION_ID) });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });
});
