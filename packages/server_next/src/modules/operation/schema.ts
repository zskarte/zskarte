import type { IZsChangeset, IZSMapOperationMapLayers, ZsMapState } from '@zskarte/types';
import { index, integer, jsonb, pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { organizations } from '../organization/schema.js';

export const operationPhaseEnum = pgEnum('operation_phase', ['active', 'archived', 'deleted']);

export const operations = pgTable(
  'operations',
  {
    id: serial('id').primaryKey(),
    documentId: documentId(),
    name: text('name').notNull(),
    description: text('description'),
    organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
    mapState: jsonb('map_state').$type<ZsMapState>(),
    changesets: jsonb('changesets').$type<Record<string, IZsChangeset>>(),
    changesetSigns: jsonb('changeset_signs').$type<Record<string, string>>(),
    signingKeyIds: jsonb('signing_key_ids').$type<string[]>(),
    eventStates: jsonb('event_states').$type<number[]>(),
    mapLayers: jsonb('map_layers').$type<IZSMapOperationMapLayers>(),
    phase: operationPhaseEnum('phase').notNull().default('active'),
    ...timestamps,
  },
  (table) => [
    index('operations_organization_id_idx').on(table.organizationId),
    index('operations_phase_idx').on(table.phase),
  ],
);

export type OperationRow = typeof operations.$inferSelect;
export type OperationInsert = typeof operations.$inferInsert;
