import { z } from 'zod';
import { operationProcedure, orgProcedure, rejectShareSession, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import type { RealtimeEvent } from '../../realtime/types.js';
import { subscribeToOperation } from '../../realtime/event-bus.js';
import { registerPresence, unregisterPresence } from '../../realtime/presence.js';
import * as service from './service.js';

export const operationRouter = router({
  onChangeset: operationProcedure
    .use(requirePermission('operation.byId'))
    .input(z.object({ operationId: z.uuid(), identifier: z.string().min(1) }))
    .subscription(async function* ({ input, signal }) {
      service.assertRealtimeAvailable(input.operationId);
      try {
        for await (const [event] of subscribeToOperation(input.operationId, signal)) {
          const realtimeEvent = event as RealtimeEvent;
          if (realtimeEvent.type === 'closed') return;
          if (realtimeEvent.type === 'changeset' && realtimeEvent.identifier !== input.identifier) {
            yield { changeset: realtimeEvent.changeset, sign: realtimeEvent.sign };
          }
        }
      } catch (error) {
        if (!signal?.aborted) throw error;
      }
    }),

  onConnections: operationProcedure
    .use(requirePermission('operation.byId'))
    .input(z.object({ operationId: z.uuid(), identifier: z.string().min(1), label: z.string().min(1).max(40) }))
    .subscription(async function* ({ ctx, input, signal }) {
      service.assertRealtimeAvailable(input.operationId);
      const events = subscribeToOperation(input.operationId, signal);
      const registrationId = registerPresence(input.operationId, input.identifier, input.label, ctx.authSession!.user);
      try {
        for await (const [event] of events) {
          const realtimeEvent = event as RealtimeEvent;
          if (realtimeEvent.type === 'closed') return;
          if (realtimeEvent.type === 'connections') yield realtimeEvent.connections;
        }
      } catch (error) {
        if (!signal?.aborted) throw error;
      } finally {
        unregisterPresence(input.operationId, input.identifier, registrationId);
      }
    }),

  overview: orgProcedure
    .use(requirePermission('operation.overview'))
    .input(
      z
        .object({
          phase: z.enum(['active', 'archived', 'deleted']).optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => service.listOverview(ctx, input?.phase)),

  byId: orgProcedure
    .use(requirePermission('operation.byId'))
    .input(
      z.object({
        documentId: z.uuid(),
      }),
    )
    .query(({ ctx, input }) => service.byId(ctx, input.documentId)),

  create: orgProcedure
    .use(rejectShareSession)
    .use(requirePermission('operation.create'))
    .input(
      z.object({
        id: z.unknown().optional(),
        documentId: z.unknown().optional(),
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        phase: z.enum(['active', 'archived', 'deleted']).optional(),
        eventStates: z.array(z.number()).nullable().optional(),
        mapState: z.record(z.string(), z.unknown()).nullable().optional(),
        mapLayers: z.record(z.string(), z.unknown()).nullable().optional(),
        organization: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => service.create(ctx, input as any)),

  updateMeta: operationProcedure
    .use(requirePermission('operation.updateMeta'))
    .input(
      z.object({
        operationId: z.uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          description: z.string().nullable().optional(),
          eventStates: z.array(z.number()).nullable().optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => service.updateMeta(ctx, input.operationId, input.data)),

  updateMapLayers: operationProcedure
    .use(requirePermission('operation.updateMapLayers'))
    .input(
      z.object({
        operationId: z.uuid(),
        mapLayers: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(({ ctx, input }) => service.updateMapLayers(ctx, input.operationId, input.mapLayers as any)),

  archive: operationProcedure
    .use(rejectShareSession)
    .use(requirePermission('operation.archive'))
    .input(
      z.object({
        operationId: z.uuid(),
      }),
    )
    .mutation(({ ctx, input }) => service.archive(ctx, input.operationId)),

  unarchive: operationProcedure
    .use(rejectShareSession)
    .use(requirePermission('operation.unarchive'))
    .input(
      z.object({
        operationId: z.uuid(),
      }),
    )
    .mutation(({ ctx, input }) => service.unarchive(ctx, input.operationId)),

  shadowDelete: operationProcedure
    .use(rejectShareSession)
    .use(requirePermission('operation.shadowDelete'))
    .input(
      z.object({
        operationId: z.uuid(),
      }),
    )
    .mutation(({ ctx, input }) => service.shadowDelete(ctx, input.operationId)),

  submitChangeset: operationProcedure
    .use(requirePermission('operation.submitChangeset'))
    .input(
      z.object({
        operationId: z.uuid(),
        identifier: z.string().min(1),
        changeset: z.any(),
      }),
    )
    .mutation(({ ctx, input }) => service.submitChangeset(ctx, input)),

  publishCurrentLocation: operationProcedure
    .use(requirePermission('operation.publishCurrentLocation'))
    .input(
      z.object({
        operationId: z.uuid(),
        identifier: z.string().min(1),
        location: z.object({ long: z.number().finite(), lat: z.number().finite() }).optional(),
      }),
    )
    .mutation(({ ctx, input }) => service.publishCurrentLocation(ctx, input)),
});
