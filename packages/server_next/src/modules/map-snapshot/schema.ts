import type { ZsMapState } from '@zskarte/types';
import { index, integer, jsonb, pgTable, serial } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { operations } from '../operation/schema.js';

export const mapSnapshots = pgTable(
  'map_snapshots',
  {
    id: serial('id').primaryKey(),
    documentId: documentId(),
    operationId: integer('operation_id').references(() => operations.id, { onDelete: 'cascade' }),
    mapState: jsonb('map_state').$type<ZsMapState>(),
    changesetIds: jsonb('changeset_ids').$type<string[]>(),
    ...timestamps,
  },
  (table) => [index('map_snapshots_operation_id_idx').on(table.operationId, table.createdAt)],
);

export type MapSnapshotRow = typeof mapSnapshots.$inferSelect;
export type MapSnapshotInsert = typeof mapSnapshots.$inferInsert;
