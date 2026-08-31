/*


swerder: WILL BE DELETED/REFACTORED shortly

*/
import { Core } from '@strapi/strapi';
import {
  updateChangesetFromDiff,
  createNewChangeset,
  updateChangesetIdsAfterApply,
  zsMapStateMigration,
  updateDescription,
} from '@zskarte/common';
import { INITIAL_CHANGESET_ID, IZsChangeset, ZsMapState } from '@zskarte/types';
import { signChangeset } from '../state/operation';

// swerder: Remove at the end of the week
export const migrateOperationChangesets = async (strapi: Core.Strapi) => {
  try {
    const operations = await strapi.documents('api::operation.operation').findMany({
      limit: -1,
      populate: {
        organization: { fields: ['documentId'] },
      },
    });
    strapi.log.info(`Found ${operations.length} operations to migrate to changesets`);
    const operationCount = operations.length;
    let currentOperation = 1;
    for (const operation of operations) {
      try {
        strapi.log.info(
          `Migrating changesets of operation (${currentOperation}/${operationCount}) ${operation.documentId}`,
        );
        currentOperation++;
        if (!operation.mapState) continue;
        if (operation.changesets && Object.keys(operation.changesets).length > 0) {
          strapi.log.info(`Operation ${operation.documentId} already migrated`);
          continue;
        }
        const organisationId = operation.organization.documentId;
        const operationMapState: ZsMapState = operation.mapState as any;
        const changesets: Record<string, IZsChangeset> = {};
        const changesetSigns: Record<string, string> = {};
        const signingKeyIds = new Set<string>();

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
              `Migrating snapshot (${currentSnapshots}/${snapshotCount}) ${snapshot.documentId} (OP: ${operation.documentId}) `,
            );
            currentSnapshots++;
            if (!snapshot.mapState) continue;
            let mapState = zsMapStateMigration(snapshot.mapState as any);
            const newChangesetIds: string[] = [];
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
              updateDescription(changeset, mapState, () => null);
              changeset.startAt =
                changeset.firstChangeAt =
                changeset.lastChangeAt =
                changeset.endAt =
                  new Date(snapshot.createdAt).getTime();

              mapState = updateChangesetIdsAfterApply(mapState, changeset);
              changeset.applied = true;
              changeset.saved = true;
              changeset.serverSavedAt = new Date().getTime();
              changeset.authorIp = undefined;
              const sign = signChangeset(changeset);

              changesets[changeset.id] = changeset;
              changesetSigns[changeset.id] = sign;
              signingKeyIds.add(changeset.signKeyId);
              newChangesetIds.push(changeset.id);
            }

            await strapi.documents('api::map-snapshot.map-snapshot').update({
              documentId: snapshot.documentId,
              data: {
                mapState: mapState as any,
                changesetIds: newChangesetIds,
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
            changesetSigns: changesetSigns as any,
            signingKeyIds: [...signingKeyIds],
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
