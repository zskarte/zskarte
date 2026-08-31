import { closeDatabase } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import { env } from './env.js';
import { logger } from './lib/logger.js';
import { type AppServer, buildServer } from './server.js';

let app: AppServer | undefined;
let shuttingDown = false;

const shutdown = async (reason: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ reason }, 'shutting down');
  try {
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
