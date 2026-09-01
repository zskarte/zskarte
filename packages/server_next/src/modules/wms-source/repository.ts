import { type SQL, and, asc, eq, or } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import type { Scope } from '../../trpc/context.js';
import { type WmsSourceInsert, type WmsSourceRow, wmsSources } from './schema.js';

const wmsSourceColumns = {
  documentId: wmsSources.documentId,
  label: wmsSources.label,
  type: wmsSources.type,
  url: wmsSources.url,
  attribution: wmsSources.attribution,
  public: wmsSources.public,
  organizationId: wmsSources.organizationId,
  createdAt: wmsSources.createdAt,
  updatedAt: wmsSources.updatedAt,
};

export type WmsSourceRecord = WmsSourceRow;

export type WmsSourceValues = Pick<WmsSourceInsert, 'label' | 'type' | 'url' | 'attribution' | 'public'>;

/** strapi `doListChecks`/`doByIdChecks` with a `hasPublic` content type: own organization or public */
const visibleFilter = (scope: Scope | null): SQL | undefined =>
  scope
    ? or(eq(wmsSources.public, true), eq(wmsSources.organizationId, scope.organizationId))
    : eq(wmsSources.public, true);

export const listVisible = (db: Database, scope: Scope | null): Promise<WmsSourceRecord[]> =>
  db.select(wmsSourceColumns).from(wmsSources).where(visibleFilter(scope)).orderBy(asc(wmsSources.createdAt));

export const findVisible = async (
  db: Database,
  documentId: string,
  scope: Scope | null,
): Promise<WmsSourceRecord | undefined> => {
  const [row] = await db
    .select(wmsSourceColumns)
    .from(wmsSources)
    .where(and(eq(wmsSources.documentId, documentId), visibleFilter(scope)))
    .limit(1);
  return row;
};

/** rows with a `null` organization are managed globally, they never match */
export const findOwned = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
): Promise<WmsSourceRecord | undefined> => {
  const [row] = await db
    .select(wmsSourceColumns)
    .from(wmsSources)
    .where(and(eq(wmsSources.documentId, documentId), eq(wmsSources.organizationId, scope.organizationId)))
    .limit(1);
  return row;
};

export const insert = async (
  db: Database,
  scope: { organizationId: string },
  values: WmsSourceValues,
): Promise<string | undefined> => {
  const [row] = await db
    .insert(wmsSources)
    .values({ ...values, organizationId: scope.organizationId })
    .returning({ documentId: wmsSources.documentId });
  return row?.documentId;
};

export const update = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
  values: WmsSourceValues,
): Promise<string | undefined> => {
  const [row] = await db
    .update(wmsSources)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(wmsSources.documentId, documentId), eq(wmsSources.organizationId, scope.organizationId)))
    .returning({ documentId: wmsSources.documentId });
  return row?.documentId;
};

export const remove = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
): Promise<string | undefined> => {
  const [row] = await db
    .delete(wmsSources)
    .where(and(eq(wmsSources.documentId, documentId), eq(wmsSources.organizationId, scope.organizationId)))
    .returning({ documentId: wmsSources.documentId });
  return row?.documentId;
};
