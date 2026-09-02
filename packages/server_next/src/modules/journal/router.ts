import { z } from 'zod';
import { subscribeToOperation } from '../../realtime/event-bus.js';
import type { RealtimeEvent } from '../../realtime/types.js';
import { operationProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import * as service from './service.js';
import { entryDepartments, entryStates } from './enums.js';

const journalData = z.object({
  documentId: z.uuid().optional(),
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
  isDrawnOnMap: z.boolean().default(false),
  isDrawingOnMap: z.boolean().default(false),
  wrongContentInfo: z.string().nullable().optional(),
  wrongTriageInfo: z.string().nullable().optional(),
});

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
    .input(z.object({ operationId: z.uuid(), identifier: z.string(), entry: journalData }))
    .mutation(({ ctx, input }) => service.create(ctx, input.operationId, input.identifier, input.entry)),

  update: operationProcedure
    .use(requirePermission('journal.update'))
    .input(z.object({ operationId: z.uuid(), identifier: z.string(), entry: journalData }))
    .mutation(({ ctx, input }) => service.update(ctx, input.operationId, input.identifier, input.entry)),

  onChanged: operationProcedure
    .use(requirePermission('journal.list'))
    .input(z.object({ operationId: z.uuid(), identifier: z.string() }))
    .subscription(async function* ({ input, signal }) {
      try {
        for await (const [event] of subscribeToOperation(input.operationId, signal)) {
          const realtimeEvent = event as RealtimeEvent;
          if (realtimeEvent.type === 'closed') return;
          if (realtimeEvent.type === 'journal' && realtimeEvent.identifier !== input.identifier)
            yield realtimeEvent.entry;
        }
      } catch (error) {
        if (!signal?.aborted) throw error;
      }
    }),
});
