import { z } from 'zod';
import { operationProcedure, orgProcedure, rejectShareSession, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import * as service from './service.js';

const documentIdInput = z.object({ documentId: z.uuid() });

export const accessRouter = router({
  generate: operationProcedure
    .use(rejectShareSession)
    .use(requirePermission('access.generate'))
    .input(z.object({
      operationId: z.uuid(),
      name: z.string().max(255).optional(),
      type: z.enum(['read', 'write', 'all']),
      tokenType: z.enum(['long', 'short']),
    }))
    .mutation(({ ctx, input }) => service.generate(ctx, input)),

  list: orgProcedure
    .use(rejectShareSession)
    .use(requirePermission('access.list'))
    .input(z.object({ operationId: z.uuid().optional() }).optional())
    .query(({ ctx, input }) => service.list(ctx, input?.operationId)),

  byId: orgProcedure
    .use(rejectShareSession)
    .use(requirePermission('access.byId'))
    .input(documentIdInput)
    .query(({ ctx, input }) => service.byId(ctx, input.documentId)),

  update: orgProcedure
    .use(rejectShareSession)
    .use(requirePermission('access.update'))
    .input(documentIdInput.extend({
      data: z.object({
        name: z.string().max(255).nullable().optional(),
        type: z.enum(['read', 'write', 'all']).optional(),
        active: z.boolean().optional(),
        expiresOn: z.date().nullable().optional(),
      }),
    }))
    .mutation(({ ctx, input }) => service.update(ctx, input.documentId, input.data)),

  delete: orgProcedure
    .use(rejectShareSession)
    .use(requirePermission('access.delete'))
    .input(documentIdInput)
    .mutation(({ ctx, input }) => service.remove(ctx, input.documentId)),
});
