import { type SQL, and, asc, eq, or } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import type { Scope } from '../../trpc/context.js';
import { files } from '../file/schema.js';
import { type MapLayerInsert, type MapLayerRow, mapLayers } from './schema.js';

/** the media relation gets flattened here and re-nested as `media_source` by the service */
const mapLayerColumns = {
  documentId: mapLayers.documentId,
  label: mapLayers.label,
  serverLayerName: mapLayers.serverLayerName,
  type: mapLayers.type,
  wmsSourceId: mapLayers.wmsSourceId,
  customSource: mapLayers.customSource,
  mediaSourceId: mapLayers.mediaSourceId,
  options: mapLayers.options,
  public: mapLayers.public,
  organizationId: mapLayers.organizationId,
  createdAt: mapLayers.createdAt,
  updatedAt: mapLayers.updatedAt,
  mediaSourceUrl: files.url,
  mediaSourceName: files.name,
};

export type MapLayerRecord = MapLayerRow & { mediaSourceUrl: string | null; mediaSourceName: string | null };

export type MapLayerValues = Pick<
  MapLayerInsert,
  'label' | 'serverLayerName' | 'type' | 'wmsSourceId' | 'customSource' | 'mediaSourceId' | 'options' | 'public'
>;

/** strapi `doListChecks`/`doByIdChecks` with a `hasPublic` content type: own organization or public */
const visibleFilter = (scope: Scope | null): SQL | undefined =>
  scope
    ? or(eq(mapLayers.public, true), eq(mapLayers.organizationId, scope.organizationId))
    : eq(mapLayers.public, true);

export const listVisible = (db: Database, scope: Scope | null): Promise<MapLayerRecord[]> =>
  db
    .select(mapLayerColumns)
    .from(mapLayers)
    .leftJoin(files, eq(files.documentId, mapLayers.mediaSourceId))
    .where(visibleFilter(scope))
    .orderBy(asc(mapLayers.createdAt));

export const findVisible = async (
  db: Database,
  documentId: string,
  scope: Scope | null,
): Promise<MapLayerRecord | undefined> => {
  const [row] = await db
    .select(mapLayerColumns)
    .from(mapLayers)
    .leftJoin(files, eq(files.documentId, mapLayers.mediaSourceId))
    .where(and(eq(mapLayers.documentId, documentId), visibleFilter(scope)))
    .limit(1);
  return row;
};

/** rows with a `null` organization are the generation pipeline managed layers, they never match */
export const findOwned = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
): Promise<MapLayerRecord | undefined> => {
  const [row] = await db
    .select(mapLayerColumns)
    .from(mapLayers)
    .leftJoin(files, eq(files.documentId, mapLayers.mediaSourceId))
    .where(and(eq(mapLayers.documentId, documentId), eq(mapLayers.organizationId, scope.organizationId)))
    .limit(1);
  return row;
};

export const insert = async (
  db: Database,
  scope: { organizationId: string },
  values: MapLayerValues,
): Promise<string | undefined> => {
  const [row] = await db
    .insert(mapLayers)
    .values({ ...values, organizationId: scope.organizationId })
    .returning({ documentId: mapLayers.documentId });
  return row?.documentId;
};

export const update = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
  values: MapLayerValues,
): Promise<string | undefined> => {
  const [row] = await db
    .update(mapLayers)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(mapLayers.documentId, documentId), eq(mapLayers.organizationId, scope.organizationId)))
    .returning({ documentId: mapLayers.documentId });
  return row?.documentId;
};

export const remove = async (
  db: Database,
  documentId: string,
  scope: { organizationId: string },
): Promise<string | undefined> => {
  const [row] = await db
    .delete(mapLayers)
    .where(and(eq(mapLayers.documentId, documentId), eq(mapLayers.organizationId, scope.organizationId)))
    .returning({ documentId: mapLayers.documentId });
  return row?.documentId;
};
