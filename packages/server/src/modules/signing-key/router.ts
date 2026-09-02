import { z } from 'zod';
import { publicProcedure } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { getPublicSigningKey } from './service.js';

/**
 * `GET /signing-key/bykey/:id` of the strapi backend was explicitly unauthenticated, the browser
 * needs the public keys to verify changeset signatures of foreign servers as well.
 */
export const signingKeyRouter = router({
  byKeyId: publicProcedure
    .input(z.object({ keyId: z.string().min(1).max(255) }))
    .query(({ ctx, input }) => getPublicSigningKey(ctx.db, input.keyId)),
});
