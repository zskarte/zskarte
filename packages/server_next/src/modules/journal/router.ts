import { z } from 'zod';
import { paginationInput } from '../../lib/pagination.js';
import { subscribeToOperation } from '../../realtime/event-bus.js';
import type { RealtimeEvent } from '../../realtime/types.js';
import { operationProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import * as service from './service.js';
import { entryDepartments, entryStates } from './enums.js';

const journalData = z.object({
  documentId: z.unknown().optional(),
  messageNumber: z.number().int().optional(),
  sender: z.string().nullable().optional(),
  creator: z.string().nullable().optional(),
  communicationType: z.string().nullable().optional(),
  communicationDetails: z.string().nullable().optional(),
  messageSubject: z.string().nullable().optional(),
  messageContent: z.string().nullable().optional(),
  visumMessage: z.string().nullable().optional(),
  isKeyMessage: z.boolean().nullable().optional(),
  dateMessage: z.date().nullable().optional(),
  visumTriage: z.string().nullable().optional(),
  dateTriage: z.date().nullable().optional(),
  decision: z.string().nullable().optional(),
  dateDecision: z.date().nullable().optional(),
  dateDecisionDelivered: z.date().nullable().optional(),
  visumDecider: z.string().nullable().optional(),
  decisionReceiver: z.string().nullable().optional(),
  decisionSender: z.string().nullable().optional(),
  entryStatus: z.enum(entryStates).nullable().optional(),
  department: z.enum(entryDepartments).nullable().optional(),
  isDrawnOnMap: z.boolean().nullable().optional(),
  isDrawingOnMap: z.boolean().nullable().optional(),
  wrongContentInfo: z.string().nullable().optional(),
  wrongTriageInfo: z.string().nullable().optional(),
});

const realtimeInput = z.object({ operationId: z.uuid(), documentId: z.uuid() });

export const journalRouter = router({
  list: operationProcedure
    .use(requirePermission('journal.list'))
    .query(({ ctx, input }) => service.list(ctx, input.operationId)),

  byId: operationProcedure
    .use(requirePermission('journal.byId'))
    .input(z.object({ operationId: z.uuid(), documentId: z.uuid() }))
    .query(({ ctx, input }) => service.byId(ctx, input.operationId, input.documentId)),

  byNumber: operationProcedure
    .use(requirePermission('journal.byNumber'))
    .input(z.object({ operationId: z.uuid(), messageNumber: z.number().int() }))
    .query(({ ctx, input }) => service.byNumber(ctx, input.operationId, input.messageNumber)),

  create: operationProcedure
    .use(requirePermission('journal.create'))
    .input(realtimeInput.extend({ entry: journalData }))
    .mutation(({ ctx, input }) => service.create(ctx, input.operationId, input.documentId, input.entry)),

  update: operationProcedure
    .use(requirePermission('journal.update'))
    .input(realtimeInput.extend({ data: journalData }))
    .mutation(({ ctx, input }) =>
      service.update(ctx, input.operationId, input.documentId, input.data),
    ),

  onChanged: operationProcedure
    .use(requirePermission('journal.list'))
    .input(realtimeInput)
    .subscription(async function* ({ input, signal }) {
      try {
        for await (const [event] of subscribeToOperation(input.operationId, signal)) {
          const realtimeEvent = event as RealtimeEvent;
          if (realtimeEvent.type === 'closed') return;
          if (realtimeEvent.type === 'journal') yield realtimeEvent.entry;
        }
      } catch (error) {
        if (!signal?.aborted) throw error;
      }
    }),
});
