import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../env.js';
import { logger } from '../lib/logger.js';
import * as schema from './schema.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  min: env.DATABASE_POOL_MIN,
  max: env.DATABASE_POOL_MAX,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED } : false,
  ...(env.DATABASE_SCHEMA === 'public' ? {} : { options: `-c search_path=${env.DATABASE_SCHEMA}` }),
});

pool.on('error', (error) => logger.error({ err: error }, 'unexpected postgres pool error'));

export const db = drizzle(pool, { schema });

export type Database = typeof db;

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};
