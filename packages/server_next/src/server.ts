import { mkdir } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import websocket from '@fastify/websocket';
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { authHandlerPlugin } from './auth/handler.js';
import { env } from './env.js';
import { logger } from './lib/logger.js';
import { createContext } from './trpc/context.js';
import { type AppRouter, appRouter } from './trpc/router.js';

const MAX_BODY_SIZE = 25 * 1024 * 1024;

/** `keepAlive` is handled by the fastify plugin but missing in its option type (@trpc/server 11.18). */
type TrpcPluginOptions = FastifyTRPCPluginOptions<AppRouter>['trpcOptions'] & {
  keepAlive?: { enabled: boolean; pingMs: number; pongWaitMs: number };
};

export const uploadsDirectory = isAbsolute(env.STORAGE_LOCAL_DIR)
  ? env.STORAGE_LOCAL_DIR
  : resolve(process.cwd(), env.STORAGE_LOCAL_DIR);

export const buildServer = async () => {
  const app = Fastify({
    loggerInstance: logger,
    // httpBatchLink encodes all procedure names into the url path
    routerOptions: { maxParamLength: 5000 },
    bodyLimit: MAX_BODY_SIZE,
    trustProxy: true,
  });

  await app.register(cors, {
    origin: env.TRUSTED_ORIGINS,
    credentials: true,
  });

  if (env.STORAGE_PROVIDER === 'local') {
    await mkdir(uploadsDirectory, { recursive: true });
    await app.register(fastifyStatic, {
      root: uploadsDirectory,
      prefix: '/uploads/',
    });
  }

  await app.register(authHandlerPlugin);

  // has to be registered before the trpc plugin, otherwise the websocket route is ignored
  await app.register(websocket);

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    useWSS: true,
    trpcOptions: {
      router: appRouter,
      createContext,
      keepAlive: { enabled: true, pingMs: 30_000, pongWaitMs: 5_000 },
      onError({ path, error, type }) {
        logger.error({ err: error, path, type }, 'trpc handler failed');
      },
    } satisfies TrpcPluginOptions,
  });

  app.get('/health', () => ({ status: 'ok' }));

  return app;
};

export type AppServer = Awaited<ReturnType<typeof buildServer>>;
