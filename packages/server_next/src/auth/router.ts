import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '../db/auth-schema.js';
import type { Database } from '../db/client.js';
import { files } from '../modules/file/schema.js';
import { organizationMapLayerFavorites } from '../modules/map-layer/schema.js';
import { organizations } from '../modules/organization/schema.js';
import { operations } from '../modules/operation/schema.js';
import { organizationWmsSources } from '../modules/wms-source/schema.js';
import { auth } from './auth.js';
import { shareTokenSchema } from './share-access-plugin.js';
import { publicProcedure, sessionProcedure } from '../trpc/procedures.js';
import { router } from '../trpc/trpc.js';
import { IZsMapOrganization } from '@zskarte/types';

const unauthorized = (): never => {
  throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
};

const authCall = async <T>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch {
    return unauthorized();
  }
};

const getOrganization = async (db: Database, organizationId: string) => {
  const [organization] = await db
    .select({
      documentId: organizations.documentId,
      name: organizations.name,
      mapLongitude: organizations.mapLongitude,
      mapLatitude: organizations.mapLatitude,
      mapZoomLevel: organizations.mapZoomLevel,
      defaultLocale: organizations.defaultLocale,
      url: organizations.url,
      journalEntryTemplate: organizations.journalEntryTemplate,
      settings: organizations.settings,
      logo: {
        documentId: files.documentId,
        name: files.name,
        url: files.url,
        formats: files.formats,
        provider: files.provider,
      },
    })
    .from(organizations)
    .leftJoin(files, eq(organizations.logoId, files.documentId))
    .where(eq(organizations.documentId, organizationId))
    .limit(1);
  if (!organization) return null;

  const [wmsSources, mapLayerFavorites, organizationOperations, organizationUsers] = await Promise.all([
    db
      .select({ documentId: organizationWmsSources.wmsSourceId })
      .from(organizationWmsSources)
      .where(eq(organizationWmsSources.organizationId, organizationId)),
    db
      .select({ documentId: organizationMapLayerFavorites.mapLayerId })
      .from(organizationMapLayerFavorites)
      .where(eq(organizationMapLayerFavorites.organizationId, organizationId)),
    db.select().from(operations).where(eq(operations.organizationId, organizationId)),
    db.select().from(user).where(eq(user.organizationId, organizationId)),
  ]);

  return {
    ...organization,
    users: organizationUsers,
    operations: organizationOperations,
    wms_sources: wmsSources.map(({ documentId }) => documentId),
    map_layer_favorites: mapLayerFavorites.map(({ documentId }) => documentId),
  } as IZsMapOrganization;
};

const authResult = async (ctx: { db: Database }, token: string, authUser: typeof user.$inferSelect) => {
  return {
    token,
    user: {
      ...authUser,
      organization: authUser.organizationId ? await getOrganization(ctx.db, authUser.organizationId) : null,
    },
  };
};

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ identifier: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const result = await authCall(() =>
        auth.api.signInUsername({ body: { username: input.identifier, password: input.password } }),
      );
      const [authUser] = await ctx.db.select().from(user).where(eq(user.id, result.user.id)).limit(1);
      if (!authUser) return unauthorized();
      return authResult(ctx, result.token, authUser);
    }),

  me: sessionProcedure
    .query(async ({ ctx }) => {
      return {
        ...ctx.user,
        operationId: ctx.scope?.operationId,
        organization: ctx.scope ? await getOrganization(ctx.db, ctx.scope.organizationId) : null,
      };
    }),

  refresh: sessionProcedure.mutation(async ({ ctx }) => {
    const [authUser] = await ctx.db
      .select()
      .from(user)
      .where(and(eq(user.id, ctx.user.id), eq(user.zsRole, ctx.role)))
      .limit(1);
    if (!authUser) return unauthorized();
    return authResult(ctx, ctx.session.token, authUser);
  }),

  shareLogin: publicProcedure.input(z.object({ accessToken: shareTokenSchema })).mutation(async ({ ctx, input }) => {
    const result = await authCall(() => auth.api.redeemShareAccess({ body: input }));
    const [authUser] = await ctx.db.select().from(user).where(eq(user.id, result.user.id)).limit(1);
    if (!authUser) return unauthorized();
    return authResult(ctx, result.token, authUser);
  }),
});
