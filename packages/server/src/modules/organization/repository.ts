import type { IZsMapOrganization, IZsMapOrganizationSettings, UZsStrapiAssetFormat } from '@zskarte/types';
import { asc, eq } from 'drizzle-orm';
import { user } from '../../db/auth-schema.js';
import type { Database } from '../../db/client.js';
import { files } from '../file/schema.js';
import { organizationMapLayerFavorites } from '../map-layer/schema.js';
import { operations } from '../operation/schema.js';
import { organizationWmsSources } from '../wms-source/schema.js';
import { organizations } from './schema.js';

/** Tenant of every organization scoped query, always derived from the session, never from client input. */
export interface OrganizationScope {
  organizationId: string;
}

export interface LoginOrganization {
  name: string;
  logo: { url: string; formats: Record<string, UZsStrapiAssetFormat> | null } | null;
  users: { username: string }[];
}

export interface LayerSettingsRows {
  wmsSourceIds?: string[];
  mapLayerIds?: string[];
}

/**
 * Public projection of the login organization selector: name, logo and every user
 * of the organization. Sorted by organization name, then username, so the guest
 * organization detection of the app never depends on the physical row order.
 */
export const listForLogin = async (db: Database): Promise<LoginOrganization[]> => {
  const rows = await db
    .select({
      organizationId: organizations.documentId,
      name: organizations.name,
      logoUrl: files.url,
      logoFormats: files.formats,
      username: user.username,
    })
    .from(organizations)
    .leftJoin(files, eq(organizations.logoId, files.documentId))
    .leftJoin(user, eq(user.organizationId, organizations.documentId))
    .orderBy(asc(organizations.name), asc(user.username));

  const byOrganization = new Map<string, LoginOrganization>();
  for (const row of rows) {
    let organization = byOrganization.get(row.organizationId);
    if (!organization) {
      organization = {
        name: row.name,
        // a left join without a match yields all-null members, that is not a logo
        logo: row.logoUrl === null ? null : { url: row.logoUrl, formats: row.logoFormats },
        users: [],
      };
      byOrganization.set(row.organizationId, organization);
    }
    if (row.username) organization.users.push({ username: row.username });
  }

  return [...byOrganization.values()];
};

/** Full organization payload, shared by the session endpoints and `organization.current`. */
export const getOrganization = async (db: Database, scope: OrganizationScope): Promise<IZsMapOrganization | null> => {
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
    .where(eq(organizations.documentId, scope.organizationId))
    .limit(1);
  if (!organization) return null;

  const [wmsSources, mapLayerFavorites, organizationOperations, organizationUsers] = await Promise.all([
    db
      .select({ documentId: organizationWmsSources.wmsSourceId })
      .from(organizationWmsSources)
      .where(eq(organizationWmsSources.organizationId, scope.organizationId)),
    db
      .select({ documentId: organizationMapLayerFavorites.mapLayerId })
      .from(organizationMapLayerFavorites)
      .where(eq(organizationMapLayerFavorites.organizationId, scope.organizationId)),
    db.select().from(operations).where(eq(operations.organizationId, scope.organizationId)),
    db.select().from(user).where(eq(user.organizationId, scope.organizationId)),
  ]);

  return {
    ...organization,
    users: organizationUsers,
    operations: organizationOperations,
    wms_sources: wmsSources.map(({ documentId }) => documentId),
    map_layer_favorites: mapLayerFavorites.map(({ documentId }) => documentId),
  } as IZsMapOrganization;
};

export const updateSettings = async (
  db: Database,
  scope: OrganizationScope,
  settings: IZsMapOrganizationSettings | null,
): Promise<void> => {
  await db.update(organizations).set({ settings }).where(eq(organizations.documentId, scope.organizationId));
};

export const updateJournalEntryTemplate = async (
  db: Database,
  scope: OrganizationScope,
  journalEntryTemplate: Record<string, unknown> | null,
): Promise<void> => {
  await db
    .update(organizations)
    .set({ journalEntryTemplate })
    .where(eq(organizations.documentId, scope.organizationId));
};

/**
 * Replaces the layer settings join rows of one organization. A key that is absent
 * from `rows` leaves its join table untouched, like the partial update of strapi did.
 */
export const replaceLayerSettings = async (
  db: Database,
  scope: OrganizationScope,
  rows: LayerSettingsRows,
): Promise<void> => {
  await db.transaction(async (tx) => {
    if (rows.wmsSourceIds) {
      await tx.delete(organizationWmsSources).where(eq(organizationWmsSources.organizationId, scope.organizationId));
      if (rows.wmsSourceIds.length > 0) {
        await tx
          .insert(organizationWmsSources)
          .values(rows.wmsSourceIds.map((wmsSourceId) => ({ organizationId: scope.organizationId, wmsSourceId })));
      }
    }
    if (rows.mapLayerIds) {
      await tx
        .delete(organizationMapLayerFavorites)
        .where(eq(organizationMapLayerFavorites.organizationId, scope.organizationId));
      if (rows.mapLayerIds.length > 0) {
        await tx
          .insert(organizationMapLayerFavorites)
          .values(rows.mapLayerIds.map((mapLayerId) => ({ organizationId: scope.organizationId, mapLayerId })));
      }
    }
  });
};
