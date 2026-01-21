/*


swerder: WILL BE DELETED/REFACTORED shortly

*/
import { Operation } from 'src/definitions';
import { Core } from '@strapi/strapi';
import { zsMapStateMigration } from '@zskarte/common';

const CURRENT_MIN_VERSION = 3;

// swerder: Remove at the end of the week
export const migrateOperationMapStates = async (strapi: Core.Strapi) => {
  try {
    const operations = (await strapi.documents('api::operation.operation').findMany({
      limit: -1,
    })) as unknown as Operation[];
    strapi.log.info(`Found ${operations.length} operations to migrate`);
    const operationCount = operations.length;
    let currentOperation = 1;
    for (const operation of operations) {
      try {
        strapi.log.info(`Migrating operation (${currentOperation}/${operationCount}) ${operation.documentId}`);
        currentOperation++;
        if (!operation.mapState) continue;
        if ((operation.mapState as any)?.version >= CURRENT_MIN_VERSION) {
          strapi.log.info(`Operation ${operation.documentId} already migrated`);
          continue;
        }
        operation.mapState = zsMapStateMigration(operation.mapState as any);
        await strapi.documents('api::operation.operation').update({
          documentId: operation.documentId,
          data: {
            mapState: operation.mapState as any,
          },
        });
        strapi.log.info(`Operation ${operation.documentId} migrated`);
      } catch (error) {
        strapi.log.error(error);
      }
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
