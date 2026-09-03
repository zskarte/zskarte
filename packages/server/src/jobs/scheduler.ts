import { Cron } from 'croner';
import { and, desc, eq, inArray, lte } from 'drizzle-orm';
import { env } from '../env.js';
import { session, user } from '../db/auth-schema.js';
import type { Database } from '../db/client.js';
import type { Logger } from '../lib/logger.js';
import {
  getOperationCache,
  getOperationCaches,
  persistAllOperations,
  persistOperation,
  removeFromCache,
} from '../modules/operation/cache.js';
import { operations } from '../modules/operation/schema.js';
import { mapSnapshots } from '../modules/map-snapshot/schema.js';
import { deleteExpired } from '../modules/access/repository.js';
import { getConfig } from '../modules/map-layer-generation/repository.js';
import { updateMapLayerMedias } from '../modules/map-layer-generation/service.js';

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

export const createMapStateSnapshots = async (deps: SchedulerDeps): Promise<void> => {
  for (const [operationId, cache] of getOperationCaches()) {
    try {
      const [lastSnapshot] = await deps.db
        .select({ mapState: mapSnapshots.mapState })
        .from(mapSnapshots)
        .where(eq(mapSnapshots.operationId, operationId))
        .orderBy(desc(mapSnapshots.createdAt))
        .limit(1);
      const currentIds = cache.mapState.changesetIds ?? [];
      const previousIds = new Set(lastSnapshot?.mapState?.changesetIds ?? []);
      const newIds = currentIds.filter((id: string) => !previousIds.has(id));
      if (lastSnapshot && newIds.length === 0) continue;

      await deps.db.insert(mapSnapshots).values({
        operationId,
        mapState: cache.mapState,
        changesetIds: newIds,
      });
    } catch (error) {
      deps.logger.error({ err: error, operationId }, 'failed to create map-state snapshot');
    }
  }
};

export const purgeGuestOperations = async (deps: SchedulerDeps): Promise<void> => {
  try {
    const [guest] = await deps.db
      .select({ organizationId: user.organizationId })
      .from(user)
      .where(eq(user.username, 'zso_guest'))
      .limit(1);
    if (!guest?.organizationId) return;

    const guestOperations = await deps.db
      .select({ documentId: operations.documentId })
      .from(operations)
      .where(eq(operations.organizationId, guest.organizationId));
    const operationIds = guestOperations.map(({ documentId }) => documentId);
    if (operationIds.length === 0) return;

    for (const operationId of operationIds) removeFromCache(operationId, 'guest operation purged');
    await deps.db.delete(session).where(inArray(session.operationId, operationIds));
    await deps.db.delete(operations).where(inArray(operations.documentId, operationIds));
    deps.logger.info({ count: operationIds.length }, 'guest operations purged');
  } catch (error) {
    deps.logger.error({ err: error }, 'failed to purge guest operations');
  }
};

export const purgeExpiredAccesses = async (deps: SchedulerDeps): Promise<void> => {
  try {
    const count = await deleteExpired(deps.db, new Date());
    if (count > 0) deps.logger.info({ count }, 'expired access tokens purged');
  } catch (error) {
    deps.logger.error({ err: error }, 'failed to purge expired access tokens');
  }
};

export interface RunScheduledMapLayerGenerationOptions {
  force?: boolean;
}

export const runScheduledMapLayerGeneration = async (
  deps: SchedulerDeps,
  options: RunScheduledMapLayerGenerationOptions = {},
): Promise<void> => {
  if (!env.MAPLAYER_GENERATION_ENABLED && !options.force) {
    deps.logger.debug('scheduled map layer generation skipped (MAPLAYER_GENERATION_ENABLED is false)');
    return;
  }

  try {
    const config = await getConfig(deps.db);
    if (!config) {
      deps.logger.warn('scheduled map layer generation skipped (no config row found)');
      return;
    }
    if (!config.enabled) {
      deps.logger.info('scheduled map layer generation skipped (config.enabled is false)');
      return;
    }

    deps.logger.info('starting scheduled semi-monthly map layer generation');
    const result = await updateMapLayerMedias(deps.db, { logger: deps.logger });
    deps.logger.info(result, 'scheduled map layer generation completed');
  } catch (error) {
    deps.logger.error({ err: error }, 'failed scheduled map layer generation');
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
    await Promise.all([archiveStaleOperations(deps), purgeExpiredAccesses(deps)]);
  });

  const snapshotJob = new Cron('*/5 * * * *', async () => {
    await createMapStateSnapshots(deps);
  });

  const guestPurgeJob = new Cron('0 0 * * *', async () => {
    await purgeGuestOperations(deps);
  });

  runningJobs = [persistJob, archiveJob, snapshotJob, guestPurgeJob];

  // Semi-monthly map layer generation: 1st and 15th of each month at 03:00
  if (env.MAPLAYER_GENERATION_ENABLED) {
    const mapLayerJob = new Cron('0 3 1,15 * *', async () => {
      await runScheduledMapLayerGeneration(deps);
    });
    runningJobs.push(mapLayerJob);
  }

  const mapLayerStatus = env.MAPLAYER_GENERATION_ENABLED ? ', semi-monthly map layers (0 3 1,15 * *)' : '';
  deps.logger.info(
    `scheduler started (15s persist, hourly auto-archive/access cleanup, 5m snapshots, nightly guest purge${mapLayerStatus})`,
  );
};

export const stopScheduler = (): void => {
  for (const job of runningJobs) {
    job.stop();
  }
  runningJobs = [];
};
