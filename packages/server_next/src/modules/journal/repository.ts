import { and, count, desc, eq, max, or } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { type PaginationInput, paginationOffset } from '../../lib/pagination.js';
import type { JournalEntryInsert, JournalEntryRow } from './schema.js';
import { journalEntries } from './schema.js';

export type JournalDatabase = Pick<Database, 'select' | 'insert' | 'update'>;

export interface JournalScope {
  organizationId: string;
  operationId: string;
}

export type JournalValues = Omit<
  JournalEntryInsert,
  'documentId' | 'operationId' | 'organizationId' | 'createdAt' | 'updatedAt'
>;

const scoped = (scope: JournalScope) =>
  and(eq(journalEntries.organizationId, scope.organizationId), eq(journalEntries.operationId, scope.operationId));

export const list = (db: JournalDatabase, scope: JournalScope): Promise<JournalEntryRow[]> =>
  db
    .select()
    .from(journalEntries)
    .where(scoped(scope))
    .orderBy(desc(journalEntries.messageNumber));

export const countAll = async (db: JournalDatabase, scope: JournalScope): Promise<number> => {
  const [row] = await db.select({ total: count() }).from(journalEntries).where(scoped(scope));
  return row?.total ?? 0;
};

export const findByDocumentId = async (
  db: JournalDatabase,
  scope: JournalScope,
  documentId: string,
): Promise<JournalEntryRow | undefined> => {
  const [row] = await db
    .select()
    .from(journalEntries)
    .where(and(scoped(scope), eq(journalEntries.documentId, documentId)))
    .limit(1);
  return row;
};

export const findByNumber = async (
  db: JournalDatabase,
  scope: JournalScope,
  messageNumber: number,
): Promise<JournalEntryRow | undefined> => {
  const [row] = await db
    .select()
    .from(journalEntries)
    .where(and(scoped(scope), eq(journalEntries.messageNumber, messageNumber)))
    .limit(1);
  return row;
};

export const highestMessageNumber = async (db: JournalDatabase, scope: JournalScope): Promise<number> => {
  const [row] = await db.select({ value: max(journalEntries.messageNumber) }).from(journalEntries).where(scoped(scope));
  return row?.value ?? 0;
};

export const insert = async (db: JournalDatabase, scope: JournalScope, values: JournalValues): Promise<JournalEntryRow> => {
  const [row] = await db
    .insert(journalEntries)
    .values({ ...values, operationId: scope.operationId, organizationId: scope.organizationId })
    .returning();
  if (!row) throw new Error('Journal entry insert returned no row');
  return row;
};

export const update = async (
  db: JournalDatabase,
  scope: JournalScope,
  documentId: string,
  values: Partial<JournalValues>,
): Promise<JournalEntryRow | undefined> => {
  const [row] = await db
    .update(journalEntries)
    .set({ ...values, updatedAt: new Date() })
    .where(and(scoped(scope), eq(journalEntries.documentId, documentId)))
    .returning();
  return row;
};
