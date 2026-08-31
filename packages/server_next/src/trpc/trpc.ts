import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

/**
 * The single tRPC instance of the backend. superjson keeps `Date` round trips
 * identical to the superjson middleware of the strapi backend.
 */
const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
