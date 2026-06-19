import { migrateOperationMapStates, migrateOperationStatusesToPhases } from './migrations';
import { loadOperations, persistMapStates } from './state/operation';
import { connectSocketIo } from './state/socketio';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    connectSocketIo(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await migrateOperationMapStates(strapi);
    await migrateOperationStatusesToPhases(strapi);
    await loadOperations(strapi);

    // Map-state changes are applied to an in-memory cache and were previously only written to
    // the database on a graceful shutdown - so an ungraceful stop lost everything drawn since
    // the last clean exit. Periodically flush changed map states so reloads (and crashes) keep
    // recent edits. `persistMapStates` is a no-op for operations whose state hasn't changed.
    const PERSIST_INTERVAL_MS = 30 * 1000;
    const persistInterval = setInterval(() => {
      persistMapStates(strapi).catch((error) => strapi.log.error(error));
    }, PERSIST_INTERVAL_MS);
    persistInterval.unref?.();
  },

  /**
   * An asynchronous destroy function that runs before
   * your application gets shut down.
   */
  async destroy({ strapi }) {
    strapi.log.info('application shutdown initiated');
    await persistMapStates(strapi);
  },
};
