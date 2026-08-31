import { boolean, integer, jsonb, pgEnum, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core';
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
  id: serial('id').primaryKey(),
  documentId: documentId(),
  label: text('label'),
  serverLayerName: text('server_layer_name'),
  type: mapLayerTypeEnum('type'),
  wmsSourceId: integer('wms_source_id').references(() => wmsSources.id, { onDelete: 'set null' }),
  customSource: text('custom_source'),
  mediaSourceId: integer('media_source_id').references(() => files.id, { onDelete: 'set null' }),
  options: jsonb('options').$type<Record<string, unknown>>(),
  public: boolean('public'),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  ...timestamps,
});

/**
 * Organization layer settings: the layers an organization marked as favorite.
 * Replaces the strapi `organizations_map_layer_favorites_lnk` join table.
 */
export const organizationMapLayerFavorites = pgTable(
  'organization_map_layer_favorites',
  {
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    mapLayerId: integer('map_layer_id')
      .notNull()
      .references(() => mapLayers.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.mapLayerId] })],
);

export type MapLayerRow = typeof mapLayers.$inferSelect;
export type MapLayerInsert = typeof mapLayers.$inferInsert;
