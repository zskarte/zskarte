import { z } from 'zod';
import { orgProcedure, publicProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import * as service from './service.js';

const changesetConfigSchema = z.object({
  applyOnExpertViewOnly: z.boolean(),
  hiddenMode: z.boolean(),
  automerge: z.boolean(),
  conflictTakeOur: z.boolean(),
});

const settingsSchema = z.object({
  journalMessageTextTemplate: z.string().optional(),
  changeset: changesetConfigSchema,
});

const uuidList = z.array(z.string().uuid());

/** strapi kept exactly these two keys of the payload and dropped every other one. */
const layerSettingsSchema = z.object({
  wms_sources: uuidList.optional(),
  map_layer_favorites: uuidList.optional(),
});

const organizationIdInput = z.object({ organizationId: z.string().uuid() });

export const organizationRouter = router({
  /** Public organization projection used by the login organization selector. */
  forLogin: publicProcedure.query(({ ctx }) => service.listForLogin(ctx)),

  current: orgProcedure.use(requirePermission('organization.current')).query(({ ctx }) => service.current(ctx)),

  updateSettings: orgProcedure
    .use(requirePermission('organization.updateSettings'))
    .input(organizationIdInput.extend({ data: settingsSchema.nullable() }))
    .mutation(({ ctx, input }) => service.updateSettings(ctx, input.organizationId, input.data)),

  updateLayerSettings: orgProcedure
    .use(requirePermission('organization.updateLayerSettings'))
    .input(organizationIdInput.extend({ data: layerSettingsSchema }))
    .mutation(({ ctx, input }) => service.updateLayerSettings(ctx, input.organizationId, input.data)),

  updateJournalEntryTemplate: orgProcedure
    .use(requirePermission('organization.updateJournalEntryTemplate'))
    .input(organizationIdInput.extend({ data: z.record(z.string(), z.unknown()).nullable() }))
    .mutation(({ ctx, input }) => service.updateJournalEntryTemplate(ctx, input.organizationId, input.data)),
});
