import type { IZsChangeset, IZSMapOperationMapLayers, ZsMapState } from '@zskarte/types';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { type OperationInsert, type OperationRow, operations } from './schema.js';

export interface OperationScope {
  organizationId: string;
  operationId?: string;
}

export type OperationOverviewItem = Pick<
  OperationRow,
  'documentId' | 'name' | 'description' | 'phase' | 'eventStates' | 'createdAt' | 'updatedAt'
>;

export const listOverview = async (
  db: Database,
  scope: OperationScope,
  phase: 'active' | 'archived' | 'deleted' = 'active',
): Promise<OperationOverviewItem[]> => {
  const conditions = [eq(operations.organizationId, scope.organizationId), eq(operations.phase, phase)];
  if (scope.operationId) {
    conditions.push(eq(operations.documentId, scope.operationId));
  }

  return db
    .select({
      documentId: operations.documentId,
      name: operations.name,
      description: operations.description,
      phase: operations.phase,
      eventStates: operations.eventStates,
      createdAt: operations.createdAt,
      updatedAt: operations.updatedAt,
    })
    .from(operations)
    .where(and(...conditions))
    .orderBy(desc(operations.updatedAt));
};

export const findById = async (
  db: Database,
  scope: OperationScope,
  documentId: string,
): Promise<OperationRow | null> => {
  const conditions = [eq(operations.documentId, documentId), eq(operations.organizationId, scope.organizationId)];
  if (scope.operationId && scope.operationId !== documentId) {
    return null;
  }

  const [row] = await db
    .select()
    .from(operations)
    .where(and(...conditions))
    .limit(1);

  return row ?? null;
};

export const insertOperation = async (
  db: Database,
  scope: OperationScope,
  data: Omit<OperationInsert, 'organizationId'>,
): Promise<OperationRow> => {
  const [row] = await db
    .insert(operations)
    .values({
      ...data,
      organizationId: scope.organizationId,
    })
    .returning();

  return row;
};

export const updateOperationMeta = async (
  db: Database,
  scope: OperationScope,
  documentId: string,
  meta: { name?: string; description?: string | null; eventStates?: number[] | null },
): Promise<void> => {
  const conditions = [eq(operations.documentId, documentId), eq(operations.organizationId, scope.organizationId)];
  if (scope.operationId && scope.operationId !== documentId) {
    return;
  }

  await db
    .update(operations)
    .set({
      ...(meta.name !== undefined ? { name: meta.name } : {}),
      ...(meta.description !== undefined ? { description: meta.description } : {}),
      ...(meta.eventStates !== undefined ? { eventStates: meta.eventStates } : {}),
      updatedAt: new Date(),
    })
    .where(and(...conditions));
};

export const updateOperationMapLayers = async (
  db: Database,
  scope: OperationScope,
  documentId: string,
  mapLayers: IZSMapOperationMapLayers,
): Promise<void> => {
  const conditions = [eq(operations.documentId, documentId), eq(operations.organizationId, scope.organizationId)];
  if (scope.operationId && scope.operationId !== documentId) {
    return;
  }

  await db
    .update(operations)
    .set({
      mapLayers,
      updatedAt: new Date(),
    })
    .where(and(...conditions));
};

export const updateOperationPhase = async (
  db: Database,
  scope: OperationScope,
  documentId: string,
  phase: 'active' | 'archived' | 'deleted',
): Promise<void> => {
  const conditions = [eq(operations.documentId, documentId), eq(operations.organizationId, scope.organizationId)];
  if (scope.operationId && scope.operationId !== documentId) {
    return;
  }

  await db
    .update(operations)
    .set({
      phase,
      updatedAt: new Date(),
    })
    .where(and(...conditions));
};

export const updateOperationState = async (
  db: Database,
  documentId: string,
  state: {
    mapState: ZsMapState | null;
    changesets: Record<string, IZsChangeset> | null;
    changesetSigns: Record<string, string> | null;
    signingKeyIds: string[] | null;
  },
): Promise<void> => {
  await db
    .update(operations)
    .set({
      mapState: state.mapState,
      changesets: state.changesets,
      changesetSigns: state.changesetSigns,
      signingKeyIds: state.signingKeyIds,
      updatedAt: new Date(),
    })
    .where(eq(operations.documentId, documentId));
};

export const findActiveOperations = async (db: Database): Promise<OperationRow[]> => {
  return db.select().from(operations).where(eq(operations.phase, 'active'));
};
