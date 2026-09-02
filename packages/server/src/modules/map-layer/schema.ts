import { boolean, jsonb, pgEnum, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { files } from '../file/schema.js';
import { organizations } from '../organization/schema.js';
import { wmsSources } from '../wms-source/schema.js';

export const mapLayerTypeEnum = pgEnum('map_layer_type', [
  'wms',
  'wms_custom',
  'wmts',
  'aggregate',
  'geojson',
  'shape',
  'csv',
]);

export const mapLayers = pgTable('map_layers', {
  documentId: documentId(),
  label: text('label'),
  serverLayerName: text('server_layer_name'),
  type: mapLayerTypeEnum('type'),
  wmsSourceId: uuid('wms_source_id').references(() => wmsSources.documentId, { onDelete: 'set null' }),
  customSource: text('custom_source'),
  mediaSourceId: uuid('media_source_id').references(() => files.documentId, { onDelete: 'set null' }),
  options: jsonb('options').$type<Record<string, unknown>>(),
  public: boolean('public'),
  organizationId: uuid('organization_id').references(() => organizations.documentId, { onDelete: 'cascade' }),
  ...timestamps,
});

/**
 * Organization layer settings: the layers an organization marked as favorite.
 * Replaces the strapi `organizations_map_layer_favorites_lnk` join table.
 */
export const organizationMapLayerFavorites = pgTable(
  'organization_map_layer_favorites',
  {
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.documentId, { onDelete: 'cascade' }),
    mapLayerId: uuid('map_layer_id')
      .notNull()
      .references(() => mapLayers.documentId, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.mapLayerId] })],
);

export type MapLayerRow = typeof mapLayers.$inferSelect;
export type MapLayerInsert = typeof mapLayers.$inferInsert;
