/*


switzerchees: WILL BE DELETED/REFACTORED shortly

*/
import { cloneDeep } from 'lodash';
import { Operation } from 'src/definitions';
import { v4 as uuidv4 } from 'uuid';
import { Core } from '@strapi/strapi';

export const zsMapStateMigration = (mapState: any): any => {
  if (!mapState) {
    return;
  }

  // TODO implement migration over multiple versions
  switch (mapState.version) {
    case undefined:
    case 1: {
      const oldMapState = cloneDeep(mapState);
      const newMapState = cloneDeep(mapState);

      newMapState.version = 2;
      newMapState.layers = oldMapState.layers
        ? oldMapState.layers.reduce((acc, layer) => {
            if (!layer.id) {
              layer.id = uuidv4();
            }
            acc[layer.id] = layer;
            return acc;
          }, {})
        : {};
      newMapState.drawElements = oldMapState.drawElements
        ? oldMapState.drawElements.reduce((acc, element) => {
            if (!element) return acc;
            if (!element.id) {
              element.id = uuidv4();
            }
            acc[element.id] = element;
            return acc;
          }, {})
        : {};

      return newMapState;
    }
    default:
      return mapState;
  }
};

const CURRENT_MIN_VERSION = 2;

// switzerchees: Remove at the end of the week
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
      currentOperation++;
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
