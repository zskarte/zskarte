import { authRouter } from '../auth/router.js';
import { publicProcedure, router } from './trpc.js';

/**
 * Root router. Feature routers get merged in here as the modules land.
 */
export const appRouter = router({
  auth: authRouter,
  health: publicProcedure.query(() => ({ status: 'ok' as const, time: new Date() })),
});

export type AppRouter = typeof appRouter;
