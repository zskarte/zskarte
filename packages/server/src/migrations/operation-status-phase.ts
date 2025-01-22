/*


switzerchees: WILL BE DELETED/REFACTORED shortly

*/
import { Operation, OperationPhase } from '../definitions';
import { Core } from '@strapi/strapi';

// switzerchees: Remove at the end of the week
export const migrateOperationStatusesToPhases = async (strapi: Core.Strapi) => {
  try {
    const operations = (await strapi.documents('api::operation.operation').findMany({
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
        await strapi.documents('api::operation.operation').update({
          documentId: operation.id.toString(),
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
