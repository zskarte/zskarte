import { z } from 'zod';
import { PERMISSION_KEYS } from '../../auth/permissions.js';
import { ROLES } from '../../auth/roles.js';
import { adminProcedure } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { ALLOWED_LOGO_MIME_TYPES } from '../file/service.js';
import * as operationService from './operation.service.js';
import * as organizationService from './organization.service.js';
import * as permissionService from './permission.service.js';

const createUserInputSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  role: z.enum(ROLES).optional(),
});

const updateUserInputSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, 'Username cannot be empty').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  role: z.enum(ROLES).optional(),
});

export const adminOrganizationRouter = router({
  list: adminProcedure.query(({ ctx }) => organizationService.listOrganizations(ctx.db)),

  byId: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .query(({ ctx, input }) => organizationService.getOrganizationById(ctx.db, input.documentId)),

  create: adminProcedure
    .input(
      z
        .object({
          name: z.string().min(1),
          mapLongitude: z.number().optional(),
          mapLatitude: z.number().optional(),
          mapZoomLevel: z.number().optional(),
          defaultLocale: z.enum(['de-CH', 'fr-CH', 'it-CH', 'en-US']).optional(),
          url: z.string().nullable().optional(),
          logoId: z.uuid().nullable().optional(),
          settings: z.record(z.string(), z.unknown()).nullable().optional(),
          journalEntryTemplate: z.record(z.string(), z.unknown()).nullable().optional(),
          user: createUserInputSchema.optional(),
          users: z
            .array(createUserInputSchema)
            .max(1, 'Only a single user per organization is supported for now')
            .optional(),
        })
        .refine(
          (data) =>
            (Array.isArray(data.users) && data.users.length === 1) || Boolean(data.user),
          {
            message: 'A user with an account must be specified when creating an organization',
            path: ['user'],
          },
        ),
    )
    .mutation(({ ctx, input }) => organizationService.createOrganization(ctx.db, input as any)),

  update: adminProcedure
    .input(
      z.object({
        documentId: z.uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          mapLongitude: z.number().optional(),
          mapLatitude: z.number().optional(),
          mapZoomLevel: z.number().optional(),
          defaultLocale: z.enum(['de-CH', 'fr-CH', 'it-CH', 'en-US']).optional(),
          url: z.string().nullable().optional(),
          logoId: z.uuid().nullable().optional(),
          settings: z.record(z.string(), z.unknown()).nullable().optional(),
          journalEntryTemplate: z.record(z.string(), z.unknown()).nullable().optional(),
          user: updateUserInputSchema.optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => organizationService.updateOrganization(ctx.db, input.documentId, input.data as any)),

  delete: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .mutation(({ ctx, input }) => organizationService.deleteOrganization(ctx.db, input.documentId)),

  uploadLogo: adminProcedure
    .input(
      z.object({
        organizationId: z.uuid().optional(),
        fileName: z.string().min(1),
        mimeType: z.enum(ALLOWED_LOGO_MIME_TYPES),
        base64: z.string().min(1),
        alternativeText: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => organizationService.uploadLogo(ctx.db, input)),
});

export const adminOperationRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          organizationId: z.uuid().optional(),
          phase: z.enum(['active', 'archived', 'deleted']).optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => operationService.listOperations(ctx.db, input)),

  byId: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .query(({ ctx, input }) => operationService.getOperationById(ctx.db, input.documentId)),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.uuid(),
        description: z.string().nullable().optional(),
        eventStates: z.array(z.number()).nullable().optional(),
        mapState: z.record(z.string(), z.unknown()).nullable().optional(),
        mapLayers: z.record(z.string(), z.unknown()).nullable().optional(),
        phase: z.enum(['active', 'archived', 'deleted']).optional(),
      }),
    )
    .mutation(({ ctx, input }) => operationService.createOperation(ctx.db, input as any)),

  update: adminProcedure
    .input(
      z.object({
        documentId: z.uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          organizationId: z.uuid().optional(),
          description: z.string().nullable().optional(),
          eventStates: z.array(z.number()).nullable().optional(),
          mapState: z.record(z.string(), z.unknown()).nullable().optional(),
          mapLayers: z.record(z.string(), z.unknown()).nullable().optional(),
          phase: z.enum(['active', 'archived', 'deleted']).optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => operationService.updateOperation(ctx.db, input.documentId, input.data as any)),

  delete: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .mutation(({ ctx, input }) => operationService.deleteOperation(ctx.db, input.documentId)),

  archive: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .mutation(({ ctx, input }) => operationService.archiveOperation(ctx.db, input.documentId)),

  unarchive: adminProcedure
    .input(z.object({ documentId: z.uuid() }))
    .mutation(({ ctx, input }) => operationService.unarchiveOperation(ctx.db, input.documentId)),
});

export const adminPermissionRouter = router({
  getMatrix: adminProcedure.query(() => permissionService.getMatrix()),

  toggleRolePermission: adminProcedure
    .input(
      z.object({
        role: z.enum(ROLES),
        permission: z.enum(PERMISSION_KEYS),
        enabled: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => permissionService.toggleRolePermission(ctx.db, input)),

  resetDefaults: adminProcedure.mutation(({ ctx }) => permissionService.resetDefaults(ctx.db)),
});

export const adminRouter = router({
  organization: adminOrganizationRouter,
  operation: adminOperationRouter,
  permission: adminPermissionRouter,
});
