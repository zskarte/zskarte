import { Cron } from 'croner';
import { and, eq, lte } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import type { Logger } from '../lib/logger.js';
import {
  getOperationCache,
  persistAllOperations,
  persistOperation,
  removeFromCache,
} from '../modules/operation/cache.js';
import { operations } from '../modules/operation/schema.js';

export interface SchedulerDeps {
  db: Database;
  logger: Logger;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

let runningJobs: Cron[] = [];

export const archiveStaleOperations = async (deps: SchedulerDeps): Promise<void> => {
  const { db, logger } = deps;
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  try {
    const staleOperations = await db
      .select({ documentId: operations.documentId, organizationId: operations.organizationId })
      .from(operations)
      .where(and(eq(operations.phase, 'active'), lte(operations.updatedAt, cutoff)));

    for (const op of staleOperations) {
      logger.info({ operationId: op.documentId }, 'auto-archiving stale operation');
      await db
        .update(operations)
        .set({ phase: 'archived', updatedAt: new Date() })
        .where(eq(operations.documentId, op.documentId));

      const cache = getOperationCache(op.documentId);
      if (cache) {
        cache.changesetEndpointMutex.abortAll('operation is archived, changes no longer possible');
        await persistOperation(db, op.documentId, cache);
        removeFromCache(op.documentId);
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'failed to auto-archive stale operations');
  }
};

export const startScheduler = (deps: SchedulerDeps): void => {
  stopScheduler();

  // 15 s persistence cadence
  const persistJob = new Cron('*/15 * * * * *', async () => {
    try {
      await persistAllOperations(deps.db);
    } catch (error) {
      deps.logger.error({ err: error }, 'failed to persist operation cache');
    }
  });

  // Hourly auto-archive cadence
  const archiveJob = new Cron('0 * * * *', async () => {
    await archiveStaleOperations(deps);
  });

  runningJobs = [persistJob, archiveJob];
  deps.logger.info('scheduler started (15s persist, hourly auto-archive)');
};

export const stopScheduler = (): void => {
  for (const job of runningJobs) {
    job.stop();
  }
  runningJobs = [];
};
