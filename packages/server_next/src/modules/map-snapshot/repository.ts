import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { type PaginationInput, paginationOffset } from '../../lib/pagination.js';
import type { Scope } from '../../trpc/context.js';
import { operations } from '../operation/schema.js';
import { type MapSnapshotRow, mapSnapshots } from './schema.js';

/**
 * `map_snapshots` has no organization column, tenancy is derived from the joined operation. Every
 * exported query therefore takes the request `scope` explicitly.
 */
export const MAP_SNAPSHOT_FIELDS = ['createdAt', 'updatedAt', 'changesetIds', 'mapState'] as const;

export type MapSnapshotField = (typeof MAP_SNAPSHOT_FIELDS)[number];

const selectableColumns = {
  createdAt: mapSnapshots.createdAt,
  updatedAt: mapSnapshots.updatedAt,
  changesetIds: mapSnapshots.changesetIds,
  mapState: mapSnapshots.mapState,
};

/** `documentId` is always part of the projection, the app keys its table rows by it. */
export type MapSnapshotListRow = Pick<MapSnapshotRow, 'documentId'> & Partial<Pick<MapSnapshotRow, MapSnapshotField>>;

export type MapSnapshotDetailRow = Pick<
  MapSnapshotRow,
  'documentId' | 'operationId' | 'mapState' | 'changesetIds' | 'createdAt' | 'updatedAt'
>;

const scopePredicates = (scope: Scope): SQL[] => {
  const predicates = [eq(operations.organizationId, scope.organizationId)];
  // share link sessions are pinned to a single operation
  if (scope.operationId) predicates.push(eq(operations.documentId, scope.operationId));
  return predicates;
};

const listProjection = (fields: readonly MapSnapshotField[]) => {
  const projection: Record<string, unknown> = { documentId: mapSnapshots.documentId };
  for (const field of fields) {
    projection[field] = selectableColumns[field];
  }
  return projection as typeof selectableColumns;
};

export const listByOperation = async (
  db: Database,
  scope: Scope,
  operationId: string,
  pagination: PaginationInput,
  fields: readonly MapSnapshotField[] = MAP_SNAPSHOT_FIELDS,
): Promise<MapSnapshotListRow[]> => {
  const rows = await db
    .select(listProjection(fields))
    .from(mapSnapshots)
    .innerJoin(operations, eq(operations.documentId, mapSnapshots.operationId))
    .where(and(eq(mapSnapshots.operationId, operationId), ...scopePredicates(scope)))
    .orderBy(desc(mapSnapshots.createdAt))
    .limit(pagination.pageSize)
    .offset(paginationOffset(pagination));

  return rows as MapSnapshotListRow[];
};

export const countByOperation = async (db: Database, scope: Scope, operationId: string): Promise<number> => {
  const [row] = await db
    .select({ total: count() })
    .from(mapSnapshots)
    .innerJoin(operations, eq(operations.documentId, mapSnapshots.operationId))
    .where(and(eq(mapSnapshots.operationId, operationId), ...scopePredicates(scope)));

  return row?.total ?? 0;
};

export const findByDocumentId = async (
  db: Database,
  scope: Scope,
  documentId: string,
): Promise<MapSnapshotDetailRow | null> => {
  const [row] = await db
    .select({
      documentId: mapSnapshots.documentId,
      operationId: mapSnapshots.operationId,
      mapState: mapSnapshots.mapState,
      changesetIds: mapSnapshots.changesetIds,
      createdAt: mapSnapshots.createdAt,
      updatedAt: mapSnapshots.updatedAt,
    })
    .from(mapSnapshots)
    .innerJoin(operations, eq(operations.documentId, mapSnapshots.operationId))
    .where(and(eq(mapSnapshots.documentId, documentId), ...scopePredicates(scope)))
    .limit(1);

  return row ?? null;
};
