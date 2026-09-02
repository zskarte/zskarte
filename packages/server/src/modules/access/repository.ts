import { and, asc, eq, lte } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { accesses, type AccessInsert, type AccessRow } from './schema.js';

export interface AccessScope {
  organizationId: string;
}

export type AccessPublicRow = Omit<AccessRow, 'accessToken'>;
export type AccessValues = Pick<AccessInsert, 'name' | 'type' | 'active' | 'expiresOn' | 'operationId'>;

const publicColumns = {
  documentId: accesses.documentId,
  type: accesses.type,
  name: accesses.name,
  active: accesses.active,
  expiresOn: accesses.expiresOn,
  operationId: accesses.operationId,
  organizationId: accesses.organizationId,
  createdAt: accesses.createdAt,
  updatedAt: accesses.updatedAt,
};

export const list = (db: Database, scope: AccessScope, operationId?: string): Promise<AccessPublicRow[]> => {
  const predicates = [eq(accesses.organizationId, scope.organizationId)];
  if (operationId) predicates.push(eq(accesses.operationId, operationId));
  return db
    .select(publicColumns)
    .from(accesses)
    .where(and(...predicates))
    .orderBy(asc(accesses.type));
};

export const findById = async (
  db: Database,
  scope: AccessScope,
  documentId: string,
): Promise<AccessPublicRow | undefined> => {
  const [row] = await db
    .select(publicColumns)
    .from(accesses)
    .where(and(eq(accesses.documentId, documentId), eq(accesses.organizationId, scope.organizationId)))
    .limit(1);
  return row;
};

export const insert = async (
  db: Database,
  scope: AccessScope,
  accessToken: string,
  values: AccessValues,
): Promise<AccessRow> => {
  const [row] = await db
    .insert(accesses)
    .values({ ...values, accessToken, organizationId: scope.organizationId })
    .returning();
  if (!row) throw new Error('Access insert returned no row');
  return row;
};

export const update = async (
  db: Database,
  scope: AccessScope,
  documentId: string,
  values: Partial<Pick<AccessValues, 'name' | 'type' | 'active' | 'expiresOn'>>,
): Promise<AccessPublicRow | undefined> => {
  const [row] = await db
    .update(accesses)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(accesses.documentId, documentId), eq(accesses.organizationId, scope.organizationId)))
    .returning(publicColumns);
  return row;
};

export const remove = async (
  db: Database,
  scope: AccessScope,
  documentId: string,
): Promise<AccessPublicRow | undefined> => {
  const [row] = await db
    .delete(accesses)
    .where(and(eq(accesses.documentId, documentId), eq(accesses.organizationId, scope.organizationId)))
    .returning(publicColumns);
  return row;
};

export const deleteExpired = async (db: Database, now: Date): Promise<number> => {
  const rows = await db
    .delete(accesses)
    .where(lte(accesses.expiresOn, now))
    .returning({ documentId: accesses.documentId });
  return rows.length;
};
