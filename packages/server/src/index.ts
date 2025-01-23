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
