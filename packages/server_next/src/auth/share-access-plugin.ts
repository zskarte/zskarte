import { APIError, type BetterAuthPlugin } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client.js';
import { user } from '../db/auth-schema.js';
import { accesses } from '../modules/access/schema.js';

const shareTokenSchema = z.string().regex(/^(?:\d{6}|[0-9a-fA-F]{32})$/);

const loadAccess = async (token: string) => {
  const condition = and(
    eq(accesses.accessToken, token),
    eq(accesses.active, true),
    or(isNull(accesses.expiresOn), gt(accesses.expiresOn, new Date())),
  );

  const [access] = await db.select().from(accesses).where(condition).limit(1);
  return access;
};

export const shareAccess = () =>
  ({
    id: 'shareAccess',
    endpoints: {
      redeemShareAccess: createAuthEndpoint(
        '/share-access/redeem',
        { method: 'POST', body: z.object({ accessToken: shareTokenSchema }) },
        async (ctx) => {
          let access = await loadAccess(ctx.body.accessToken);
          if (!access?.operationId || !access.organizationId) {
            throw new APIError('UNAUTHORIZED', { message: 'Invalid or expired access token' });
          }

          const username = `operation_${access.type}`;
          const [shareUser] = await db.select().from(user).where(eq(user.username, username)).limit(1);
          if (!shareUser) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: `Missing share access user ${username}`,
            });
          }

          if (ctx.body.accessToken.length === 6) {
            const [consumed] = await db
              .delete(accesses)
              .where(and(eq(accesses.documentId, access.documentId), eq(accesses.active, true)))
              .returning();
            if (!consumed) {
              throw new APIError('UNAUTHORIZED', { message: 'Invalid or expired access token' });
            }
            access = consumed;
          }

          const session = await ctx.context.internalAdapter.createSession(shareUser.id, false, {
            operationId: access.operationId,
            organizationId: access.organizationId,
            permission: access.type,
          });
          if (!session) {
            throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Failed to create share session' });
          }

          await setSessionCookie(ctx, { session, user: shareUser });
          return ctx.json({
            token: session.token,
            user: shareUser,
            session,
          });
        },
      ),
    },
  }) as const satisfies BetterAuthPlugin;

export { shareTokenSchema };
