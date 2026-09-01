import { z } from 'zod';
import {
  operationProcedure,
  orgProcedure,
  rejectShareSession,
  requirePermission,
} from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import * as service from './service.js';

export const operationRouter = router({
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
});
