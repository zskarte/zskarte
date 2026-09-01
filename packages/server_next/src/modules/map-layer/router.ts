import { z } from 'zod';
import { orgProcedure, publicProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { mapLayerTypeEnum } from './schema.js';
import * as service from './service.js';

const documentIdInput = z.string().uuid();

/** tolerates the strapi relation payloads the app still sends (`{ connect: [documentId] }`) */
const relationInput = z
  .union([
    documentIdInput,
    z.null(),
    z.object({ documentId: documentIdInput }),
    z.object({ connect: z.array(z.union([documentIdInput, z.object({ documentId: documentIdInput })])) }),
  ])
  .transform((value) => {
    if (value === null || typeof value === 'string') return value;
    if ('documentId' in value) return value.documentId;
    const [first] = value.connect;
    if (first === undefined) return null;
    return typeof first === 'string' ? first : first.documentId;
  });

/**
 * `id`/`documentId`/`organization` are accepted so the ported access control checks can reject
 * them, every other unknown key is stripped by zod.
 */
const mapLayerDataInput = z.object({
  id: z.unknown().optional(),
  documentId: z.string().nullish(),
  organization: z.string().nullish(),
  label: z.string().nullish(),
  serverLayerName: z.string().nullish(),
  type: z.enum(mapLayerTypeEnum.enumValues).nullish(),
  wms_source: relationInput.optional(),
  media_source: relationInput.optional(),
  custom_source: z.string().nullish(),
  options: z.record(z.string(), z.unknown()).nullish(),
  public: z.boolean().nullish(),
});

export const mapLayerRouter = router({
  list: publicProcedure.use(requirePermission('mapLayer.list')).query(({ ctx }) => service.list(ctx)),

  byId: publicProcedure
    .use(requirePermission('mapLayer.byId'))
    .input(z.object({ documentId: documentIdInput }))
    .query(({ ctx, input }) => service.byId(ctx, input.documentId)),

  create: orgProcedure
    .use(requirePermission('mapLayer.create'))
    .input(z.object({ data: mapLayerDataInput }))
    .mutation(({ ctx, input }) => service.create(ctx, input.data)),

  update: orgProcedure
    .use(requirePermission('mapLayer.update'))
    .input(z.object({ documentId: documentIdInput, data: mapLayerDataInput }))
    .mutation(({ ctx, input }) => service.update(ctx, input.documentId, input.data)),

  delete: orgProcedure
    .use(requirePermission('mapLayer.delete'))
    .input(z.object({ documentId: documentIdInput }))
    .mutation(({ ctx, input }) => service.remove(ctx, input.documentId)),
});
