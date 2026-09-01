import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hasPermission, type PermissionKey } from '../auth/permissions.js';
import { operations } from '../modules/operation/schema.js';
import type { Context } from './context.js';
import { middleware, publicProcedure as baseProcedure } from './trpc.js';

const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const logViolation = (
  ctx: Context,
  message: string,
  operationId?: string,
) => {
  ctx.logger.warn(
    {
      url: ctx.requestPath,
      userOrganisationId: ctx.scope?.organizationId,
      jwtOperationId: ctx.session?.operationId,
      operationId,
      ip: ctx.requestIp,
      userAgent: ctx.userAgent,
    },
    `[global::accessControl]: ${message}`,
  );
};

const requireSessionMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.authSession || !ctx.user || !ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'This action is unauthorized.' });
  }
  return next({ ctx: { ...ctx, authSession: ctx.authSession, user: ctx.user, session: ctx.session } });
});

const requireOrgScopeMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.scope) {
    logViolation(ctx, 'access not allowed, missing organization scope');
    throw forbidden;
  }
  return next({ ctx: { ...ctx, scope: ctx.scope } });
});

export const publicProcedure = baseProcedure;
export const sessionProcedure = baseProcedure.use(requireSessionMiddleware);
export const orgProcedure = sessionProcedure.use(requireOrgScopeMiddleware);

export const operationProcedure = orgProcedure
  .input(z.object({ operationId: z.string().uuid() }))
  .use(async ({ ctx, input, next, type, path }) => {
    const [operation] = await ctx.db
      .select({ documentId: operations.documentId, organizationId: operations.organizationId, phase: operations.phase })
      .from(operations)
      .where(eq(operations.documentId, input.operationId))
      .limit(1);

    const belongsToScope =
      operation &&
      operation.organizationId === ctx.scope.organizationId &&
      (!ctx.scope.operationId || ctx.scope.operationId === operation.documentId);
    if (!belongsToScope) {
      logViolation(ctx, 'access not allowed', input.operationId);
      throw forbidden;
    }

    const allowedArchivedMutation =
      path === 'unarchive' ||
      path.endsWith('.unarchive') ||
      path === 'shadowDelete' ||
      path.endsWith('.shadowDelete');
    if (type === 'mutation' && operation.phase !== 'active' && !allowedArchivedMutation) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'The operation is archived, no update allowed.' });
    }

    return next({ ctx: { ...ctx, operation } });
  });

export const requirePermission = (permission: PermissionKey) =>
  middleware(({ ctx, next }) => {
    if (!hasPermission(ctx.role, permission)) {
      logViolation(ctx, `access not allowed, missing permission ${permission}`);
      throw forbidden;
    }
    return next();
  });

export const rejectShareSession = middleware(({ ctx, next }) => {
  if (ctx.session?.operationId) {
    logViolation(ctx, 'access not allowed, notForShare endpoint');
    throw forbidden;
  }
  return next();
});

export const assertCreateIdentifiersNotForced = (value: { id?: unknown; documentId?: unknown }): void => {
  if (value.id !== undefined || value.documentId !== undefined) throw forbidden;
};
