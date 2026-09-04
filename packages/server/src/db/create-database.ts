import pg from 'pg';
import { env } from '../env.js';
import { logger } from '../lib/logger.js';

const DUPLICATE_DATABASE = '42P04';

/**
 * The strapi backend still owns the `zskarte` database during the migration, so this
 * backend uses its own database. Creating it on demand keeps `npm run start:server`
 * a single command against the docker-compose postgres.
 */
export const ensureDatabaseExists = async (): Promise<void> => {
  const client = new pg.Client({
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_MAINTENANCE_DB,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED } : false,
  });

  try {
    await client.connect();
    await client.query(`create database "${env.DATABASE_NAME}"`);
    logger.info({ database: env.DATABASE_NAME }, 'database created');
  } catch (error) {
    if ((error as { code?: string }).code === DUPLICATE_DATABASE) {
      logger.debug({ database: env.DATABASE_NAME }, 'database already present');
      return;
    }
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
};
