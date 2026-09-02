import { TRPCError } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { mapSnapshotRouter } from '../src/modules/map-snapshot/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import {
  TEST_OP_ID,
  TEST_OP_ID_2,
  TEST_ORG_ID,
  TEST_ORG_ID_2,
  TEST_SNAPSHOT_ID,
  createMockDb,
  createSilentLogger,
  createTestContext,
  createTestSession,
} from './helpers/index.js';

const ORGANIZATION_ID = TEST_ORG_ID;
const FOREIGN_ORGANIZATION_ID = TEST_ORG_ID_2;
const OPERATION_ID = TEST_OP_ID;
const OTHER_OPERATION_ID = TEST_OP_ID_2;
const SNAPSHOT_ID = TEST_SNAPSHOT_ID;

const dialect = new PgDialect();
const renderSql = (clause: unknown) => dialect.sqlToQuery(clause as SQL);

interface StoredSnapshot {
  documentId: string;
  operationId: string;
  organizationId: string;
  mapState: unknown;
  changesetIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SnapshotDatabaseOptions {
  operation?: { documentId: string; organizationId: string; phase: string } | null;
  snapshots?: StoredSnapshot[];
  total?: number;
}

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

const createSnapshotDb = (options: SnapshotDatabaseOptions) => {
  const snapshots = options.snapshots ?? [];
  return createMockDb({
    queryHandler: (query) => {
      const projection = query.fields && typeof query.fields === 'object' ? Object.keys(query.fields) : [];
      if (projection.includes('phase')) {
        return options.operation ? [options.operation] : [];
      }
      if (projection.includes('total')) {
        return [{ total: options.total ?? snapshots.length }];
      }
      if (projection.includes('operationId')) {
        const rendered = query.where ? renderSql(query.where) : { params: [] };
        const match = snapshots.find((s) => {
          const identifiers = new Set<unknown>([s.documentId, s.organizationId, s.operationId]);
          return (
            rendered.params.includes(s.documentId) &&
            rendered.params.includes(s.organizationId) &&
            rendered.params.every((param) => identifiers.has(param))
          );
        });
        return match ? [project(match, projection)] : [];
      }
      return snapshots.map((s) => (projection.length > 0 ? project(s, projection) : s));
    },
  });
};

const createCaller = createCallerFactory(mapSnapshotRouter);

const activeOperation = { documentId: OPERATION_ID, organizationId: ORGANIZATION_ID, phase: 'active' };

describe('mapSnapshot.list', () => {
  it('returns the strapi pagination meta and sorts createdAt desc', async () => {
    const newest = new Date('2024-05-02T10:00:00.000Z');
    const oldest = new Date('2024-05-01T10:00:00.000Z');
    const { db, captured } = createSnapshotDb({
      operation: activeOperation,
      snapshots: [snapshot(newest), snapshot(oldest, { documentId: OTHER_OPERATION_ID })],
      total: 41,
    });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    const result = await createCaller(context).list({ operationId: OPERATION_ID, page: 2, pageSize: 20 });

    expect(result.meta).toEqual({ pagination: { page: 2, pageSize: 20, pageCount: 3, total: 41 } });
    expect(result.data.map((row) => row.createdAt)).toEqual([newest, oldest]);
    expect(result.data[0].createdAt).toBeInstanceOf(Date);

    const listQuery = captured.selects.find((query) => query.orderBy.length > 0);
    expect(renderSql(listQuery?.orderBy[0]).sql).toBe('"map_snapshots"."created_at" desc');
    const whereSql = listQuery?.where ? renderSql(listQuery.where) : { sql: '', params: [] };
    expect(whereSql.sql).toContain('"operations"."organization_id"');
    expect(whereSql.params).toContain(ORGANIZATION_ID);
  });

  it('narrows the sql projection to the requested fields', async () => {
    const { db, captured } = createSnapshotDb({
      operation: activeOperation,
      snapshots: [snapshot(new Date('2024-05-02T10:00:00.000Z'))],
    });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    const result = await createCaller(context).list({
      operationId: OPERATION_ID,
      fields: ['createdAt', 'changesetIds'],
    });

    const listQuery = captured.selects.find((query) => query.orderBy.length > 0);
    expect(Object.keys(listQuery?.fields as object)).toEqual(['documentId', 'createdAt', 'changesetIds']);
    expect(result.data[0]).not.toHaveProperty('mapState');
  });

  it('selects all columns when fields is omitted', async () => {
    const { db, captured } = createSnapshotDb({
      operation: activeOperation,
      snapshots: [snapshot(new Date('2024-05-02T10:00:00.000Z'))],
    });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await createCaller(context).list({ operationId: OPERATION_ID });

    const listQuery = captured.selects.find((query) => query.orderBy.length > 0);
    expect(Object.keys(listQuery?.fields as object)).toEqual([
      'documentId',
      'createdAt',
      'updatedAt',
      'changesetIds',
      'mapState',
    ]);
  });

  it('rejects a field outside the allowlist', async () => {
    const { db } = createSnapshotDb({ operation: activeOperation });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await expect(
      createCaller(context).list({ operationId: OPERATION_ID, fields: ['privateKeyEncrypted' as 'mapState'] }),
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: 'BAD_REQUEST' });
  });

  it('is forbidden for an operation of another organization', async () => {
    const { db } = createSnapshotDb({ operation: null });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await expect(createCaller(context).list({ operationId: OPERATION_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });
});

describe('mapSnapshot.byId', () => {
  it('returns the full snapshot including mapState and a real Date', async () => {
    const createdAt = new Date('2024-05-02T10:00:00.000Z');
    const { db, captured } = createSnapshotDb({ snapshots: [snapshot(createdAt)] });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

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
    const whereSql = captured.selects[0]?.where ? renderSql(captured.selects[0].where) : { sql: '' };
    expect(whereSql.sql).toContain('"operations"."organization_id"');
  });

  it('is forbidden for a snapshot of another organizations operation', async () => {
    const { db } = createSnapshotDb({
      snapshots: [snapshot(new Date(), { organizationId: FOREIGN_ORGANIZATION_ID })],
    });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('is forbidden for a share session pinned to another operation', async () => {
    const { db, captured } = createSnapshotDb({ snapshots: [snapshot(new Date())] });
    const context = await createTestContext({
      db,
      authSession: createTestSession('operationread', ORGANIZATION_ID, OTHER_OPERATION_ID),
      logger: createSilentLogger(),
    });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
    const whereSql = captured.selects[0]?.where ? renderSql(captured.selects[0].where) : { params: [] };
    expect(whereSql.params).toContain(OTHER_OPERATION_ID);
  });

  it('is forbidden for an unknown snapshot', async () => {
    const { db } = createSnapshotDb({ snapshots: [] });
    const context = await createTestContext({
      db,
      authSession: createTestSession('organization', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });

  it('rejects a role without the mapSnapshot.byId permission', async () => {
    const { db } = createSnapshotDb({ snapshots: [snapshot(new Date())] });
    const context = await createTestContext({
      db,
      authSession: createTestSession('public', ORGANIZATION_ID),
      logger: createSilentLogger(),
    });

    await expect(createCaller(context).byId({ documentId: SNAPSHOT_ID })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });
});
