import { boolean, index, uuid, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { operations } from '../operation/schema.js';
import { organizations } from '../organization/schema.js';

export const accessTypeEnum = pgEnum('access_type', ['read', 'write', 'all']);

/**
 * Share link. `accessToken` is never serialized to a client.
 * Short (6 digit) tokens carry an `expiresOn` and are consumed on redemption,
 * long (32 char) tokens stay valid until revoked.
 */
export const accesses = pgTable(
  'accesses',
  {
    documentId: documentId(),
    accessToken: text('access_token').notNull().unique(),
    type: accessTypeEnum('type').notNull().default('read'),
    name: text('name'),
    active: boolean('active').notNull().default(true),
    expiresOn: timestamp('expires_on', { withTimezone: true }),
    operationId: uuid('operation_id').references(() => operations.documentId, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.documentId, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [index('accesses_operation_id_idx').on(table.operationId)],
);

export type AccessRow = typeof accesses.$inferSelect;
export type AccessInsert = typeof accesses.$inferInsert;
