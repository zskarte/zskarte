import { TRPCError } from '@trpc/server';
import { publishJournalChange } from '../../realtime/event-bus.js';
import type { Context, Scope } from '../../trpc/context.js';
import { assertCreateIdentifiersNotForced } from '../../trpc/procedures.js';
import * as repository from './repository.js';
import type { JournalEntryRow } from './schema.js';
import { isUniqueViolation } from '../../db/util.js';

type ScopedContext = Context & { scope: Scope };

export interface JournalEntryData extends Partial<repository.JournalValues> {
  documentId?: string;
}

const NUMBER_RETRIES = 8;
const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const scopeFor = (ctx: ScopedContext, operationId: string): repository.JournalScope => ({
  organizationId: ctx.scope.organizationId,
  operationId,
});

const numberConflict = (messageNumber: number, cause?: unknown) =>
  new TRPCError({ code: 'CONFLICT', message: `messageNumber ${messageNumber} already exist`, cause });

const writableValues = (data: JournalEntryData): Partial<repository.JournalValues> => {
  const values: Partial<repository.JournalValues> = {};
  const fields = [
    'messageNumber',
    'sender',
    'creator',
    'communicationType',
    'communicationDetails',
    'messageSubject',
    'messageContent',
    'visumMessage',
    'isKeyMessage',
    'dateMessage',
    'visumTriage',
    'dateTriage',
    'decision',
    'dateDecision',
    'dateDecisionDelivered',
    'visumDecider',
    'decisionReceiver',
    'decisionSender',
    'entryStatus',
    'department',
    'isDrawnOnMap',
    'isDrawingOnMap',
    'wrongContentInfo',
    'wrongTriageInfo',
  ] as const satisfies readonly (keyof repository.JournalValues)[];
  for (const field of fields) {
    if (data[field] !== undefined) (values as Record<string, unknown>)[field] = data[field];
  }
  return values;
};

export const list = (ctx: ScopedContext, operationId: string): Promise<JournalEntryRow[]> => {
  return repository.list(ctx.db, scopeFor(ctx, operationId));
};

export const byId = async (ctx: ScopedContext, operationId: string, documentId: string): Promise<JournalEntryRow> => {
  const row = await repository.findByDocumentId(ctx.db, scopeFor(ctx, operationId), documentId);
  if (!row) throw forbidden;
  return row;
};

export const byNumber = async (
  ctx: ScopedContext,
  operationId: string,
  messageNumber: number,
): Promise<JournalEntryRow> => {
  const row = await repository.findByNumber(ctx.db, scopeFor(ctx, operationId), messageNumber);
  if (!row) throw forbidden;
  return row;
};

export const create = async (
  ctx: ScopedContext,
  operationId: string,
  data: JournalEntryData,
): Promise<JournalEntryRow> => {
  assertCreateIdentifiersNotForced(data);
  const values = writableValues(data);
  const requestedNumber = values.messageNumber;
  const explicitNumber = requestedNumber !== undefined && requestedNumber > 0;
  let preferredOfflineNumber = requestedNumber !== undefined && requestedNumber < 0 ? -requestedNumber : undefined;
  if (requestedNumber === 0) preferredOfflineNumber = undefined;

  for (let attempt = 0; attempt < NUMBER_RETRIES; attempt += 1) {
    let candidate = requestedNumber;
    try {
      const row = await ctx.db.transaction(async (tx) => {
        if (!explicitNumber) {
          candidate =
            preferredOfflineNumber ?? (await repository.highestMessageNumber(tx, scopeFor(ctx, operationId))) + 1;
        }
        return repository.insert(tx, scopeFor(ctx, operationId), {
          ...values,
          messageNumber: candidate as number,
        } as repository.JournalValues);
      });
      publishJournalChange(operationId, row.documentId, row);
      return row;
    } catch (error) {
      if (!isUniqueViolation(error, 'journal_entries_number_unique')) throw error;
      if (explicitNumber) throw numberConflict(requestedNumber, error);
      preferredOfflineNumber = undefined;
      if (attempt === NUMBER_RETRIES - 1) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Could not allocate a journal message number.',
          cause: error,
        });
      }
    }
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not create the journal entry.' });
};

export const update = async (
  ctx: ScopedContext,
  operationId: string,
  data: JournalEntryData,
): Promise<JournalEntryRow> => {
  const scope = scopeFor(ctx, operationId);
  const current = await repository.findByDocumentId(ctx.db, scope, data.documentId);
  if (!current) throw forbidden;
  const values = writableValues(data);
  if (values.messageNumber !== undefined && values.messageNumber <= 0) {
    throw new TRPCError({ code: 'CONFLICT', message: `messageNumber ${values.messageNumber} not valid` });
  }
  try {
    const row = await repository.update(ctx.db, scope, current.documentId, values);
    if (!row) throw forbidden;
    publishJournalChange(operationId, row.documentId, row);
    return row;
  } catch (error) {
    if (values.messageNumber !== undefined && isUniqueViolation(error, 'journal_entries_number_unique')) {
      throw numberConflict(values.messageNumber, error);
    }
    throw error;
  }
};
