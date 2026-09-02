import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { logger } from '../lib/logger.js';
import { closeDatabase, db } from './client.js';
import { ensureDatabaseExists } from './create-database.js';

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), '../../drizzle');

export const runMigrations = async (): Promise<void> => {
  await ensureDatabaseExists();
  logger.info({ migrationsFolder }, 'applying database migrations');
  await migrate(db, { migrationsFolder });
  logger.info('database migrations applied');
};

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  runMigrations()
    .then(() => closeDatabase())
    .catch(async (error) => {
      logger.fatal({ err: error }, 'database migration failed');
      await closeDatabase().catch(() => undefined);
      process.exit(1);
    });
}
