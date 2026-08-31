import { text, timestamp } from 'drizzle-orm/pg-core';
import { createDocumentId } from '../lib/ids.js';

/**
 * Every domain table carries an integer `id` (used by the organization layer settings,
 * which reference wms sources and map layers numerically) and a stable `document_id`
 * that the angular app uses as primary handle.
 */
export const documentId = () =>
  text('document_id')
    .notNull()
    .unique()
    .$defaultFn(() => createDocumentId());

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
