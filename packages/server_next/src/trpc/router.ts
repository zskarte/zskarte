import { authRouter } from '../auth/router.js';
import { organizationRouter } from '../modules/organization/router.js';
import { publicProcedure, router } from './trpc.js';

/**
 * Root router. Feature routers get merged in here as the modules land.
 */
export const appRouter = router({
  auth: authRouter,
  organization: organizationRouter,
  health: publicProcedure.query(() => ({ status: 'ok' as const, time: new Date() })),
});

export type AppRouter = typeof appRouter;
