/*


switzerchees: WILL BE DELETED/REFACTORED shortly

*/
import { Operation, OperationPhase } from '../definitions';
import { Strapi } from '@strapi/strapi';
// import { Core } from '@strapi/strapi'; -> V5

// switzerchees: Remove at the end of the week
export const migrateOperationStatusesToPhases = async (strapi: Strapi) => {
  try {
    const operations = (await strapi.entityService.findMany('api::operation.operation', {
      limit: -1,
    })) as unknown as Operation[];
    strapi.log.info(`Found ${operations.length} operations to migrate status`);
    const operationCount = operations.length;
    let currentOperation = 1;
    for (const operation of operations) {
      try {
        strapi.log.info(`Migrating operation status -> phase (${currentOperation}/${operationCount}) ${operation.id}`);
        if (operation.phase) {
          strapi.log.info(`Operation ${operation.id} already migrated`);
          continue;
        }
        await strapi.entityService.update('api::operation.operation', operation.id, {
          data: {
            phase: operation.status as OperationPhase,
          },
        });
        strapi.log.info(`Operation ${operation.id} migrated`);
      } catch (error) {
        strapi.log.error(error);
      }
      currentOperation++;
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
