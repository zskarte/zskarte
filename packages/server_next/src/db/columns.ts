import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const documentId = () =>
  uuid('document_id')
    .notNull()
    .primaryKey()
    .defaultRandom();

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
