import { boolean, integer, jsonb, pgEnum, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { organizations } from '../organization/schema.js';

export const wmsSourceTypeEnum = pgEnum('wms_source_type', ['wms', 'wmts']);

export const wmsSources = pgTable('wms_sources', {
  id: serial('id').primaryKey(),
  documentId: documentId(),
  label: text('label'),
  type: wmsSourceTypeEnum('type'),
  url: text('url'),
  attribution: jsonb('attribution'),
  public: boolean('public'),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  ...timestamps,
});

/**
 * Organization layer settings: the sources an organization selected for its users.
 * Replaces the strapi `organizations_wms_sources_lnk` join table.
 */
export const organizationWmsSources = pgTable(
  'organization_wms_sources',
  {
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    wmsSourceId: integer('wms_source_id')
      .notNull()
      .references(() => wmsSources.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.wmsSourceId] })],
);

export type WmsSourceRow = typeof wmsSources.$inferSelect;
export type WmsSourceInsert = typeof wmsSources.$inferInsert;
