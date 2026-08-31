import type { UZsStrapiAssetFormat } from '@zskarte/types';
import { doublePrecision, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';

/**
 * Replaces the strapi upload plugin `files` table. The column set mirrors
 * `IZsStrapiAsset` so `getResponsiveImageSource()` in the app keeps working.
 * Strapi's separate folder entity collapses into `folder_path`.
 */
export const files = pgTable('files', {
  documentId: documentId(),
  name: text('name').notNull(),
  alternativeText: text('alternative_text'),
  caption: text('caption'),
  width: integer('width'),
  height: integer('height'),
  formats: jsonb('formats').$type<Record<string, UZsStrapiAssetFormat>>(),
  hash: text('hash').notNull(),
  ext: text('ext'),
  mime: text('mime').notNull(),
  size: doublePrecision('size'),
  url: text('url').notNull(),
  previewUrl: text('preview_url'),
  provider: text('provider').notNull(),
  providerMetadata: jsonb('provider_metadata').$type<Record<string, unknown>>(),
  folderPath: text('folder_path'),
  ...timestamps,
});

export type FileRow = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;
