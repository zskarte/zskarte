import type { IZsMapOrganizationSettings } from '@zskarte/types';
import { doublePrecision, jsonb, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { files } from '../file/schema.js';

export const organizationDefaultLocaleEnum = pgEnum('organization_default_locale', [
  'de-CH',
  'fr-CH',
  'it-CH',
  'en-US',
]);

export const organizations = pgTable('organizations', {
  documentId: documentId(),
  name: text('name').notNull(),
  mapLongitude: doublePrecision('map_longitude').notNull().default(7.44297),
  mapLatitude: doublePrecision('map_latitude').notNull().default(46.94635),
  mapZoomLevel: doublePrecision('map_zoom_level').notNull().default(16),
  defaultLocale: organizationDefaultLocaleEnum('default_locale').notNull().default('de-CH'),
  url: text('url'),
  logoId: uuid('logo_id').references(() => files.documentId, { onDelete: 'set null' }),
  journalEntryTemplate: jsonb('journal_entry_template').$type<Record<string, unknown>>(),
  settings: jsonb('settings').$type<IZsMapOrganizationSettings>(),
  ...timestamps,
});

export type OrganizationRow = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
