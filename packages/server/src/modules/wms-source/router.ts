import { z } from 'zod';
import { orgProcedure, publicProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { wmsSourceTypeEnum } from './schema.js';
import * as service from './service.js';

const documentIdInput = z.uuid();

/**
 * `id`/`documentId`/`organization` are accepted so the ported access control checks can reject
 * them, every other unknown key is stripped by zod.
 */
const wmsSourceDataInput = z.object({
  id: z.unknown().optional(),
  documentId: z.string().nullish(),
  organization: z.string().nullish(),
  label: z.string().nullish(),
  type: z.enum(wmsSourceTypeEnum.enumValues).nullish(),
  url: z.string().nullish(),
  attribution: z.unknown().optional(),
  public: z.boolean().nullish(),
});

export const wmsSourceRouter = router({
  list: publicProcedure.use(requirePermission('wmsSource.list')).query(({ ctx }) => service.list(ctx)),

  byId: publicProcedure
    .use(requirePermission('wmsSource.byId'))
    .input(z.object({ documentId: documentIdInput }))
    .query(({ ctx, input }) => service.byId(ctx, input.documentId)),

  create: orgProcedure
    .use(requirePermission('wmsSource.create'))
    .input(z.object({ data: wmsSourceDataInput }))
    .mutation(({ ctx, input }) => service.create(ctx, input.data)),

  update: orgProcedure
    .use(requirePermission('wmsSource.update'))
    .input(z.object({ documentId: documentIdInput, data: wmsSourceDataInput }))
    .mutation(({ ctx, input }) => service.update(ctx, input.documentId, input.data)),

  delete: orgProcedure
    .use(requirePermission('wmsSource.delete'))
    .input(z.object({ documentId: documentIdInput }))
    .mutation(({ ctx, input }) => service.remove(ctx, input.documentId)),
});
