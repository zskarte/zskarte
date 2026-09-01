import { eq } from 'drizzle-orm';
import { IZsMapOrganization } from '@zskarte/types';
import { user } from '../db/auth-schema.js';
import type { Database } from '../db/client.js';
import { files } from '../modules/file/schema.js';
import { organizationMapLayerFavorites } from '../modules/map-layer/schema.js';
import { organizations } from '../modules/organization/schema.js';
import { operations } from '../modules/operation/schema.js';
import { organizationWmsSources } from '../modules/wms-source/schema.js';
import { sessionProcedure } from '../trpc/procedures.js';
import { router } from '../trpc/trpc.js';

const getOrganization = async (db: Database, organizationId: string) => {
  const [organization] = await db
    .select({
      documentId: organizations.documentId,
      name: organizations.name,
      mapLongitude: organizations.mapLongitude,
      mapLatitude: organizations.mapLatitude,
      mapZoomLevel: organizations.mapZoomLevel,
      defaultLocale: organizations.defaultLocale,
      url: organizations.url,
      journalEntryTemplate: organizations.journalEntryTemplate,
      settings: organizations.settings,
      logo: {
        documentId: files.documentId,
        name: files.name,
        url: files.url,
        formats: files.formats,
        provider: files.provider,
      },
    })
    .from(organizations)
    .leftJoin(files, eq(organizations.logoId, files.documentId))
    .where(eq(organizations.documentId, organizationId))
    .limit(1);
  if (!organization) return null;

  const [wmsSources, mapLayerFavorites, organizationOperations, organizationUsers] = await Promise.all([
    db
      .select({ documentId: organizationWmsSources.wmsSourceId })
      .from(organizationWmsSources)
      .where(eq(organizationWmsSources.organizationId, organizationId)),
    db
      .select({ documentId: organizationMapLayerFavorites.mapLayerId })
      .from(organizationMapLayerFavorites)
      .where(eq(organizationMapLayerFavorites.organizationId, organizationId)),
    db.select().from(operations).where(eq(operations.organizationId, organizationId)),
    db.select().from(user).where(eq(user.organizationId, organizationId)),
  ]);

  return {
    ...organization,
    users: organizationUsers,
    operations: organizationOperations,
    wms_sources: wmsSources.map(({ documentId }) => documentId),
    map_layer_favorites: mapLayerFavorites.map(({ documentId }) => documentId),
  } as IZsMapOrganization;
};

export const authRouter = router({
  me: sessionProcedure.query(async ({ ctx }) => ({
    ...ctx.user,
    operationId: ctx.scope?.operationId,
    organization: ctx.scope ? await getOrganization(ctx.db, ctx.scope.organizationId) : null,
  })),
});
