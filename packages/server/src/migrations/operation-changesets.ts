/*


swerder: WILL BE DELETED/REFACTORED shortly

*/
import type { Data } from '@strapi/strapi';
import { Core } from '@strapi/strapi';
import {
  updateChangesetFromDiff,
  createNewChangeset,
  updateChangesetIdsAfterApply,
  zsMapStateMigration,
} from '@zskarte/common';
import { INITIAL_CHANGESET_ID, IZsChangeset, ZsMapState } from '@zskarte/types';

// swerder: Remove at the end of the week
export const migrateOperationChangesets = async (strapi: Core.Strapi) => {
  try {
    const operations = await strapi.documents('api::operation.operation').findMany({
      limit: -1,
      populate: {
        organization: { fields: ['documentId'] },
      },
    });
    strapi.log.info(`Found ${operations.length} operations to migrate`);
    const operationCount = operations.length;
    let currentOperation = 1;
    for (const operation of operations) {
      try {
        strapi.log.info(`Migrating operation (${currentOperation}/${operationCount}) ${operation.documentId}`);
        currentOperation++;
        if (!operation.mapState) continue;
        if (operation.changesets && Object.keys(operation.changesets).length > 0) {
          strapi.log.info(`Operation ${operation.documentId} already migrated`);
          continue;
        }
        const organisationId = operation.organization.documentId;
        const operationMapState: ZsMapState = operation.mapState as any;
        const changesets: Record<string, IZsChangeset> = {};

        const snapshots = await strapi.documents('api::map-snapshot.map-snapshot').findMany({
          filters: {
            operation: { documentId: { $eq: operation.documentId } },
          },
          limit: -1,
          sort: 'createdAt:asc',
        });
        const snapshotCount = snapshots.length;
        let prevMapState: ZsMapState = undefined;

        let currentSnapshots = 1;
        for (const snapshot of snapshots) {
          try {
            strapi.log.info(
              `Migrating snapshot (${currentSnapshots}/${snapshotCount})  ${snapshot.documentId} (OP: ${operation.documentId}) `,
            );
            currentSnapshots++;
            if (!snapshot.mapState) continue;
            let mapState = zsMapStateMigration(snapshot.mapState as any);
            if (prevMapState) {
              if (
                !mapState.changesetIds ||
                (mapState.changesetIds.length === 1 && mapState.changesetIds[0] === INITIAL_CHANGESET_ID)
              ) {
                mapState.changesetIds = [...prevMapState.changesetIds];
              }
              if (!mapState.drawElementChangesetIds || Object.keys(mapState.drawElementChangesetIds).length === 0) {
                mapState.drawElementChangesetIds = { ...prevMapState.drawElementChangesetIds };
              } else {
                mapState.drawElementChangesetIds = {
                  ...mapState.drawElementChangesetIds,
                  ...prevMapState.drawElementChangesetIds,
                };
              }
              let changeset = createNewChangeset(
                organisationId,
                operation.documentId,
                'migration',
                undefined,
                false,
                `Snapshot: ${snapshot.createdAt.toString()} / ${snapshot.documentId}`,
              );
              changeset = updateChangesetFromDiff(prevMapState, mapState, changeset);
              changeset.startAt =
                changeset.firstChangeAt =
                changeset.lastChangeAt =
                changeset.endAt =
                  new Date(snapshot.createdAt).getTime();

              changeset.authorIp = undefined;
              changeset.serverId = undefined;
              changeset.serverSavedAt = new Date().getTime();
              changeset.saved = true;
              changeset.applied = true;

              changesets[changeset.id] = changeset;
              mapState = updateChangesetIdsAfterApply(mapState, changeset);
            }

            await strapi.documents('api::map-snapshot.map-snapshot').update({
              documentId: snapshot.documentId,
              data: {
                mapState: mapState as any,
              },
            });
            prevMapState = mapState;
            strapi.log.info(`Snapshot ${snapshot.documentId} migrated`);
          } catch (error) {
            strapi.log.error(error);
          }
        }

        if (prevMapState) {
          operationMapState.changesetIds = [...prevMapState.changesetIds];
          operationMapState.drawElementChangesetIds = { ...prevMapState.drawElementChangesetIds };
        }
        await strapi.documents('api::operation.operation').update({
          documentId: operation.documentId,
          data: {
            mapState: operationMapState as any,
            changesets: changesets as any,
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
