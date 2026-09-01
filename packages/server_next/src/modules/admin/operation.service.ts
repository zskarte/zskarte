import { TRPCError } from '@trpc/server';
import { and, desc, eq, ilike } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import {
  addToCache,
  getOperationCache,
  persistOperation,
  removeFromCache,
} from '../operation/cache.js';
import { type OperationRow, operations } from '../operation/schema.js';
import { organizations } from '../organization/schema.js';

export interface CreateAdminOperationInput {
  name: string;
  organizationId: string;
  description?: string | null;
  eventStates?: number[] | null;
  mapState?: Record<string, unknown> | null;
  mapLayers?: Record<string, unknown> | null;
  phase?: 'active' | 'archived' | 'deleted';
}

export interface UpdateAdminOperationInput {
  name?: string;
  organizationId?: string;
  description?: string | null;
  eventStates?: number[] | null;
  mapState?: Record<string, unknown> | null;
  mapLayers?: Record<string, unknown> | null;
  phase?: 'active' | 'archived' | 'deleted';
}

export interface ListAdminOperationsFilters {
  organizationId?: string;
  phase?: 'active' | 'archived' | 'deleted';
  search?: string;
}

export const listOperations = async (db: Database, filters?: ListAdminOperationsFilters) => {
  const conditions = [];
  if (filters?.organizationId) {
    conditions.push(eq(operations.organizationId, filters.organizationId));
  }
  if (filters?.phase) {
    conditions.push(eq(operations.phase, filters.phase));
  }
  if (filters?.search) {
    conditions.push(ilike(operations.name, `%${filters.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      documentId: operations.documentId,
      name: operations.name,
      description: operations.description,
      phase: operations.phase,
      organizationId: operations.organizationId,
      organizationName: organizations.name,
      eventStates: operations.eventStates,
      createdAt: operations.createdAt,
      updatedAt: operations.updatedAt,
    })
    .from(operations)
    .leftJoin(organizations, eq(operations.organizationId, organizations.documentId))
    .where(whereClause)
    .orderBy(desc(operations.updatedAt));
};

export const getOperationById = async (db: Database, documentId: string) => {
  const [op] = await db
    .select({
      documentId: operations.documentId,
      name: operations.name,
      description: operations.description,
      phase: operations.phase,
      organizationId: operations.organizationId,
      organizationName: organizations.name,
      mapState: operations.mapState,
      changesets: operations.changesets,
      changesetSigns: operations.changesetSigns,
      signingKeyIds: operations.signingKeyIds,
      eventStates: operations.eventStates,
      mapLayers: operations.mapLayers,
      createdAt: operations.createdAt,
      updatedAt: operations.updatedAt,
    })
    .from(operations)
    .leftJoin(organizations, eq(operations.organizationId, organizations.documentId))
    .where(eq(operations.documentId, documentId))
    .limit(1);

  if (!op) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation not found' });
  }

  const cache = getOperationCache(documentId);
  if (cache) {
    return {
      ...op,
      mapState: cache.mapState,
      changesets: cache.changesets,
      changesetSigns: cache.changesetSigns,
      signingKeyIds: Array.from(cache.signingKeyIds),
    };
  }

  return op;
};

export const createOperation = async (db: Database, data: CreateAdminOperationInput): Promise<OperationRow> => {
  const [row] = await db
    .insert(operations)
    .values({
      name: data.name,
      organizationId: data.organizationId,
      description: data.description ?? null,
      eventStates: data.eventStates ?? null,
      mapState: (data.mapState as any) ?? null,
      mapLayers: (data.mapLayers as any) ?? null,
      phase: data.phase ?? 'active',
    })
    .returning();

  if (row.phase === 'active') {
    addToCache(row);
  }

  return row;
};

export const updateOperation = async (
  db: Database,
  documentId: string,
  data: UpdateAdminOperationInput,
): Promise<OperationRow> => {
  const updateValues: Partial<typeof operations.$inferInsert> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.organizationId !== undefined) updateValues.organizationId = data.organizationId;
  if (data.description !== undefined) updateValues.description = data.description;
  if (data.eventStates !== undefined) updateValues.eventStates = data.eventStates;
  if (data.mapState !== undefined) updateValues.mapState = data.mapState as any;
  if (data.mapLayers !== undefined) updateValues.mapLayers = data.mapLayers as any;
  if (data.phase !== undefined) updateValues.phase = data.phase;

  const [row] = await db
    .update(operations)
    .set(updateValues)
    .where(eq(operations.documentId, documentId))
    .returning();

  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation not found' });
  }

  const cache = getOperationCache(documentId);
  if (cache) {
    if (data.name !== undefined) cache.operation.name = data.name;
    if (data.description !== undefined) cache.operation.description = data.description;
    if (data.eventStates !== undefined) cache.operation.eventStates = data.eventStates;
    if (data.mapLayers !== undefined) cache.operation.mapLayers = data.mapLayers as any;
    if (data.mapState !== undefined) cache.mapState = data.mapState as any;
    if (data.phase && data.phase !== 'active') {
      cache.changesetEndpointMutex.abortAll(`operation is ${data.phase}`);
      await persistOperation(db, documentId, cache);
      removeFromCache(documentId);
    }
  } else if (row.phase === 'active') {
    addToCache(row);
  }

  return row;
};

export const deleteOperation = async (db: Database, documentId: string) => {
  const cache = getOperationCache(documentId);
  if (cache) {
    cache.changesetEndpointMutex.abortAll('operation is deleted');
    removeFromCache(documentId);
  }

  const [deleted] = await db
    .delete(operations)
    .where(eq(operations.documentId, documentId))
    .returning({ documentId: operations.documentId });

  if (!deleted) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation not found' });
  }

  return { success: true, documentId: deleted.documentId };
};

export const archiveOperation = async (db: Database, documentId: string) => {
  const [row] = await db
    .update(operations)
    .set({ phase: 'archived' })
    .where(eq(operations.documentId, documentId))
    .returning();

  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation not found' });
  }

  const cache = getOperationCache(documentId);
  if (cache) {
    cache.changesetEndpointMutex.abortAll('operation is archived, changes no longer possible');
    await persistOperation(db, documentId, cache);
    removeFromCache(documentId);
  }

  return { success: true, operation: row };
};

export const unarchiveOperation = async (db: Database, documentId: string) => {
  const [row] = await db
    .update(operations)
    .set({ phase: 'active' })
    .where(eq(operations.documentId, documentId))
    .returning();

  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation not found' });
  }

  addToCache(row);
  return { success: true, operation: row };
};
