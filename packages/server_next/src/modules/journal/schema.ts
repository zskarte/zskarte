import { boolean, index, integer, uuid, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { operations } from '../operation/schema.js';
import { organizations } from '../organization/schema.js';

export const journalEntryStatusEnum = pgEnum('journal_entry_status', [
  'awaiting_message',
  'awaiting_triage',
  'awaiting_decision',
  'awaiting_completion',
  'completed',
]);

export const journalEntryDepartmentEnum = pgEnum('journal_entry_department', [
  'politische-behoerde',
  'chef-fuehrungsorgan',
  'stabschef',
  'fb-lage',
  'fb-information',
  'fb-oeffentliche-sicherheit',
  'fb-schutz-rettung',
  'fb-gesundheit',
  'fb-logistik',
  'fb-infrastrukturen',
]);

export const journalEntries = pgTable(
  'journal_entries',
  {
    documentId: documentId(),
    uuid: text('uuid').notNull().unique(),
    operationId: uuid('operation_id').references(() => operations.documentId, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.documentId, { onDelete: 'cascade' }),
    messageNumber: integer('message_number').notNull(),
    sender: text('sender'),
    creator: text('creator'),
    communicationType: text('communication_type'),
    communicationDetails: text('communication_details'),
    messageSubject: text('message_subject'),
    messageContent: text('message_content'),
    visumMessage: text('visum_message'),
    isKeyMessage: boolean('is_key_message'),
    dateMessage: timestamp('date_message', { withTimezone: true }),
    visumTriage: text('visum_triage'),
    dateTriage: timestamp('date_triage', { withTimezone: true }),
    decision: text('decision'),
    dateDecision: timestamp('date_decision', { withTimezone: true }),
    dateDecisionDelivered: timestamp('date_decision_delivered', { withTimezone: true }),
    visumDecider: text('visum_decider'),
    decisionReceiver: text('decision_receiver'),
    decisionSender: text('decision_sender'),
    entryStatus: journalEntryStatusEnum('entry_status'),
    department: journalEntryDepartmentEnum('department'),
    isDrawnOnMap: boolean('is_drawn_on_map'),
    isDrawingOnMap: boolean('is_drawing_on_map'),
    wrongContentInfo: text('wrong_content_info'),
    wrongTriageInfo: text('wrong_triage_info'),
    ...timestamps,
  },
  (table) => [
    // replaces the count-and-repair numbering of the strapi controller
    unique('journal_entries_number_unique').on(table.operationId, table.organizationId, table.messageNumber),
    index('journal_entries_operation_id_idx').on(table.operationId),
  ],
);

export type JournalEntryRow = typeof journalEntries.$inferSelect;
export type JournalEntryInsert = typeof journalEntries.$inferInsert;
