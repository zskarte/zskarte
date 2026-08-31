import { timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createDocumentId } from '../lib/ids.js';

/**
 * Every domain table carries an integer `id` (used by the organization layer settings,
 * which reference wms sources and map layers numerically) and a stable `document_id`
 * that the angular app uses as primary handle.
 */
export const documentId = () =>
  uuid('document_id')
    .notNull()
    .unique()
    .default(sql`uuidv7()`)
    .primaryKey();

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
