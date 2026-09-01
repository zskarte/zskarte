import { asc, eq } from 'drizzle-orm';
import { user } from '../../db/auth-schema.js';
import { files } from '../file/schema.js';
import { publicProcedure } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { organizations } from './schema.js';

/** Public organization projection used by the login organization selector. */
export const organizationRouter = router({
  forLogin: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        organizationId: organizations.documentId,
        name: organizations.name,
        logo: {
          formats: files.formats,
          url: files.url,
        },
        username: user.username,
      })
      .from(organizations)
      .leftJoin(files, eq(organizations.logoId, files.documentId))
      .leftJoin(user, eq(user.organizationId, organizations.documentId))
      .orderBy(asc(organizations.name));

    const organizationsById = new Map<string, { name: string; logo: (typeof rows)[number]['logo']; users: { username: string }[] }>();

    for (const row of rows) {
      if (organizationsById.has(row.organizationId)) continue;
      organizationsById.set(row.organizationId, {
        name: row.name,
        logo: row.logo,
        users: row.username ? [{ username: row.username }] : [],
      });
    }

    return [...organizationsById.values()];
  }),
});
