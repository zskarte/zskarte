import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { type Database, db } from '../db/client.js';
import { type Logger, logger } from '../lib/logger.js';

export interface CreateInnerContextOptions {
  /** Remote address of the caller, captured as changeset author ip. */
  requestIp?: string | null;
}

export interface InnerContext {
  db: Database;
  logger: Logger;
  requestIp: string | null;
}

/**
 * Context without any request objects, so tests and server side callers
 * (schedulers, cli scripts) can call procedures directly.
 */
export const createContextInner = async (opts: CreateInnerContextOptions = {}): Promise<InnerContext> => ({
  db,
  logger,
  requestIp: opts.requestIp ?? null,
});

export const createContext = async ({ req }: CreateFastifyContextOptions): Promise<Context> =>
  createContextInner({ requestIp: req?.ip ?? null });

export type Context = InnerContext;
