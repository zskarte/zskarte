import { closeDatabase, db } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import { env } from './env.js';
import { startScheduler, stopScheduler } from './jobs/scheduler.js';
import { logger } from './lib/logger.js';
import {
  abortAllQueuedChangesets,
  persistAllOperations,
  warmupOperationCache,
} from './modules/operation/cache.js';
import { initializeSigningKeys } from './modules/signing-key/service.js';
import { type AppServer, buildServer } from './server.js';

let app: AppServer | undefined;
let shuttingDown = false;

const shutdown = async (reason: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ reason }, 'shutting down');
  try {
    stopScheduler();
    abortAllQueuedChangesets('server shutdown');
    await persistAllOperations(db);
    await app?.close();
    await closeDatabase();
    logger.info('shutdown complete');
  } catch (error) {
    logger.error({ err: error }, 'shutdown failed');
    process.exitCode = 1;
  }
};

const start = async (): Promise<void> => {
  if (env.RUN_MIGRATIONS_ON_BOOT) {
    await runMigrations();
  }

  await initializeSigningKeys({ db, logger });
  await warmupOperationCache(db);
  startScheduler({ db, logger });

  app = await buildServer();
  await app.listen({ host: env.HOST, port: env.PORT });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void shutdown(signal).then(() => process.exit(0));
    });
  }
};

start().catch(async (error) => {
  logger.fatal({ err: error }, 'server failed to start');
  await closeDatabase().catch(() => undefined);
  process.exit(1);
});
