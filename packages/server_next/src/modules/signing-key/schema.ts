import { index, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';

export const signingKeyTypeEnum = pgEnum('signing_key_type', ['rsa', 'ed25519']);

/** `privateKeyEncrypted` is protected by `SIGN_PRIVATE_KEY_PASSPHRASE` and never leaves the server. */
export const signingKeys = pgTable(
  'signing_keys',
  {
    documentId: documentId(),
    keyId: text('key_id').notNull().unique(),
    serverId: text('server_id').notNull(),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    keyType: signingKeyTypeEnum('key_type').notNull().default('ed25519'),
    privateKeyEncrypted: text('private_key_encrypted'),
    publicKey: text('public_key').notNull(),
    ...timestamps,
  },
  (table) => [index('signing_keys_server_id_idx').on(table.serverId)],
);

export type SigningKeyRow = typeof signingKeys.$inferSelect;
export type SigningKeyInsert = typeof signingKeys.$inferInsert;
