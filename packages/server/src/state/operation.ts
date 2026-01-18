import { applyPatches, enablePatches } from 'immer';
import { Core } from '@strapi/types';
import _ from 'lodash';
import type { Context } from 'koa';
import { IZsChangeset } from '@zskarte/types';
import { updateChangesetIdsAfterApply, verifyChangesetConsistency } from '@zskarte/common';
import os from 'os';

import {
  Operation,
  OperationCache,
  OperationPhases,
  StrapiLifecycleHook,
  StrapiLifecycleHooks,
  User,
} from '../definitions';
import { broadcastChangeset, broadcastConnections } from './socketio';
import { QueueMutex, QueueTask } from '../utils/queue-mutex';
import { execSync } from 'child_process';

const WEEK = 1000 * 60 * 60 * 24 * 7;
const MIN = 1000 * 60;

const MAX_WAIT_MS = 15_000;

enablePatches();

const interfaces = os.networkInterfaces();
const serverIPs = Object.keys(interfaces)
  .flatMap((key) => interfaces[key])
  .filter((item) => item.family === 'IPv4' && !item.internal)
  .map((item) => item.address);
//https://www.perplexity.ai/search/wenn-ich-auf-awz-azure-oder-gc-0nu7bnbhROeFkjMTNShqzg#0
let externalIP: string;
/*
TODO: user better logic not relay on external service?
try {
  externalIP = execSync('curl ifconfig.me', { encoding: 'utf8' });
  if (!externalIP.match(/^\d{1-3}\.\d{1-3}\.\d{1-3}\.\d{1-3}$/)) {
    externalIP = undefined;
  }
} catch (ignoreMe) {}
*/
const SERVER_ID = os.hostname() + '-' + (externalIP || serverIPs[0] || '0.0.0.0');

const operationCaches: { [key: number]: OperationCache } = {};

/** Loads all active operations initially and generates the in-memory cache */
const loadOperations = async (strapi: Core.Strapi) => {
  try {
    const activeOperations = (await strapi.documents('api::operation.operation').findMany({
      filters: { phase: OperationPhases.ACTIVE },
      populate: ['organization'],
      limit: -1,
    })) as Operation[];
    for (const operation of activeOperations) {
      await lifecycleOperation(StrapiLifecycleHooks.AFTER_CREATE, operation);
    }
  } catch (error) {
    strapi.log.error(error);
    strapi.log.info('Error while loading the active operations, shutdown the strapi server.');
    process.exit(1);
  }
};

/** The implementation of the Strapi Lifecylce hooks of the operation collection type */
const lifecycleOperation = async (lifecycleHook: StrapiLifecycleHook, operation: Operation) => {
  operation =
    ((await strapi.documents('api::operation.operation').findOne({
      documentId: operation.documentId,
      populate: ['organization.users'],
    })) as Operation) || operation;
  if (lifecycleHook === StrapiLifecycleHooks.AFTER_CREATE) {
    const mapState = operation.mapState || {};
    const changesets = operation.changesets || {};
    const changesetEndpointMutex = new QueueMutex();
    operationCaches[operation.documentId] = {
      operation,
      connections: [],
      users: [],
      changesetEndpointMutex,
      mapState,
      changesets,
      changed: false,
    };
    if (!operation.organization) return;
    operationCaches[operation.documentId].users.push(...(operation.organization.users || []));
  }
  if (lifecycleHook === StrapiLifecycleHooks.AFTER_UPDATE) {
    if (operation.phase === OperationPhases.ARCHIVED) {
      const operationCache: OperationCache = operationCaches[operation.documentId];
      delete operationCaches[operation.documentId];
      if (!operationCache) return;
      if (operationCache.changesetEndpointMutex) {
        operationCache.changesetEndpointMutex.abortAll('operation is archived, changes no longer possible');
      }
      //persist last changes before archive
      await strapi.documents('api::operation.operation').update({
        documentId: operation.documentId,
        data: {
          mapState: operationCache.mapState as any,
          changesets: operationCache.changesets as any,
        },
      });
      return;
    } else if (!(operation.documentId in operationCaches)) {
      //maybe an "unarchive" operation
      const mapState = operation.mapState || {};
      const changesets = operation.changesets || {};
      const changesetEndpointMutex = new QueueMutex();
      operationCaches[operation.documentId] = {
        operation,
        connections: [],
        users: [],
        changesetEndpointMutex,
        mapState,
        changesets,
        changed: false,
      };
      if (!operation.organization) return;
      operationCaches[operation.documentId].users.push(...(operation.organization.users || []));
    } else {
      operationCaches[operation.documentId].operation = operation;
    }
  }
  if (lifecycleHook === StrapiLifecycleHooks.AFTER_DELETE) {
    const operationCache: OperationCache = operationCaches[operation.documentId];
    delete operationCaches[operation.documentId];
    if (!operationCache) return;
    if (operationCache.changesetEndpointMutex) {
      operationCache.changesetEndpointMutex.abortAll('operation is deleted');
    }
  }
};

const changesetAlreadyExist = (operationCache: OperationCache, changeset: IZsChangeset) => {
  const savedChangeset = operationCache.changesets[changeset.id];
  if (savedChangeset) {
    let savedChangesetToCompare: Partial<IZsChangeset>,
      incommingChangesetToCompare: Partial<IZsChangeset>,
      _unused: any;
    ({
      applied: _unused,
      saved: _unused,
      serverSavedAt: _unused,
      authorIp: _unused,
      serverId: _unused,
      ...savedChangesetToCompare
    } = savedChangeset);
    ({
      applied: _unused,
      saved: _unused,
      serverSavedAt: _unused,
      authorIp: _unused,
      serverId: _unused,
      ...incommingChangesetToCompare
    } = changeset);

    if (_.isEqual(savedChangesetToCompare, incommingChangesetToCompare)) {
      return true;
    }

    throw new Error('re-submit changeset with other content');
  }
  return false;
};

const addChangeset = async (
  operationId: string,
  identifier: string,
  changeset: IZsChangeset,
  ctx: Context,
  onTimeout?: () => void,
) => {
  const operationCache: OperationCache = operationCaches[operationId];
  if (!operationCache) return { message: 'operation is not in operationCache, is it archived?' };

  if (changesetAlreadyExist(operationCache, changeset)) {
    return false;
  }

  const task = operationCache.changesetEndpointMutex.enqueueWithTimeout(ctx, {
    maxWaitMs: MAX_WAIT_MS,
    fn: async (task: QueueTask) => {
      if (changesetAlreadyExist(operationCache, changeset)) {
        return false;
      }
      let mapState = operationCache.mapState;
      const error = verifyChangesetConsistency(mapState, changeset);
      if (error) {
        strapi.log.error(error.message);
        return error;
      }
      const oldMapState = mapState;
      mapState = applyPatches(mapState, changeset.patches);

      if (task.aborted || task.clientAborted) {
        return true;
      }

      //verify clean reverse possible
      const revertedMapState = applyPatches(mapState, changeset.inversePatches);
      if (!_.isEqual(oldMapState, revertedMapState)) {
        const elemId = changeset.patches[0].path[1];
        console.error(
          changeset.patches,
          changeset.inversePatches,
          'inverse invalid',
          oldMapState.drawElements[elemId],
          revertedMapState.drawElements[elemId],
        );

        return { message: 'inverse patches do not reset cleanly', isInvalid: true };
      }
      mapState = updateChangesetIdsAfterApply(mapState, changeset);

      changeset.saved = true;
      changeset.serverSavedAt = new Date().getTime();
      changeset.authorIp = ctx.request.ips?.length > 0 ? ctx.request.ips.join(' ') : ctx.request.ip;
      changeset.serverId = SERVER_ID;

      if (operationCache.mapState !== oldMapState) {
        return { message: 'concurrent modification error' };
      }
      if (task.aborted || task.clientAborted) {
        return true;
      }
      operationCache.changesets[changeset.id] = changeset;
      operationCache.mapState = mapState;
      operationCache.changed = true;
      broadcastChangeset(operationCache, identifier, changeset);
      return null;
    },
    onTimeout,
  });
  return await task.result;
};

/** Updates the current location of a connection */
const updateCurrentLocation = async (
  operationId: string,
  identifier: string,
  longLat: { long: number; lat: number },
) => {
  const operationCache: OperationCache = operationCaches[operationId];
  if (!operationCache) return;
  for (const connection of operationCache.connections) {
    try {
      if (connection.identifier !== identifier) continue;
      connection.currentLocation = longLat;
      broadcastConnections(operationCache);
    } catch (error) {
      connection.socket.disconnect();
      strapi.log.error(error);
    }
  }
};

/** Persist the map state to the database if something has changed */
const persistOperationCache = async (strapi: Core.Strapi) => {
  try {
    for (const [operationId, operationCache] of Object.entries(operationCaches)) {
      if (!operationCache.changed) continue;
      await strapi.documents('api::operation.operation').update({
        documentId: operationId,
        data: {
          mapState: operationCache.mapState as any,
          changesets: operationCache.changesets as any,
        },
      });
      operationCache.changed = false;
      strapi.log.info(`MapState/changesets of operation ${operationId} Persisted`);
    }
  } catch (error) {
    strapi.log.error(error);
  }
};

const abortAllQueuedUpdates = async (strapi: Core.Strapi) => {
  try {
    for (const operationCache of Object.values(operationCaches)) {
      if (operationCache.changesetEndpointMutex) {
        operationCache.changesetEndpointMutex.abortAll('server shutdown');
      }
    }
  } catch (error) {
    strapi.log.error(error);
  }
};

/** Archive operations who are active and are not updated since 7 days */
const archiveOperations = async (strapi: Core.Strapi) => {
  try {
    const activeOperations = (await strapi.documents('api::operation.operation').findMany({
      filters: { phase: OperationPhases.ACTIVE },
      limit: -1,
    })) as Operation[];
    for (const operation of activeOperations) {
      if (new Date(operation.updatedAt).getTime() + WEEK > new Date().getTime()) continue;
      await strapi.documents('api::operation.operation').update({
        documentId: operation.documentId,
        data: {
          phase: OperationPhases.ARCHIVED,
        },
      });
    }
  } catch (error) {
    strapi.log.error(error);
  }
};

const deleteGuestOperations = async (strapi: Core.Strapi) => {
  try {
    const guestUsers = (await strapi.documents('plugin::users-permissions.user').findMany({
      fields: ['documentId', 'username', 'email'],
      filters: { username: 'zso_guest' },
      populate: ['organization.operations'],
      limit: 1,
    })) as User[];
    const guestUser = _.first(guestUsers);
    if (!guestUser?.organization?.operations) return;
    const { operations } = guestUser.organization;
    for (const operation of operations) {
      strapi.log.info(`Deleting operation ${operation.name} of guest user`);
      await strapi.db
        .query('api::map-snapshot.map-snapshot')
        .deleteMany({ filters: { operation: { documentId: operation.documentId } } });
      await strapi.db
        .query('api::access.access')
        .deleteMany({ filters: { operation: { documentId: operation.documentId } } });
      await strapi.documents('api::operation.operation').delete({
        documentId: operation.documentId,
      });
    }
  } catch (error) {
    strapi.log.error(error);
  }
};

const createMapStateSnapshots = async (strapi: Core.Strapi) => {
  try {
    const activeOperations = (await strapi.documents('api::operation.operation').findMany({
      filters: { phase: OperationPhases.ACTIVE },
      limit: -1,
    })) as Operation[];

    strapi.log.debug(`Found ${activeOperations.length} operations to create snapshots from`);

    for (const operation of activeOperations) {
      const fiveMins = MIN * 5;
      // If the operation has not been updated in the last 5mins don't create a snapshot
      if (new Date(operation.updatedAt).getTime() + fiveMins < new Date().getTime()) continue;

      strapi.log.debug(`Creating snapshot for operation [${operation.documentId}] ${operation.name}`);

      await strapi.documents('api::map-snapshot.map-snapshot').create({
        data: {
          operation,
          mapState: operation.mapState as any,
          publishedAt: Date.now(),
        },
      });
    }
  } catch (error) {
    strapi.log.error(error);
  }
};

export {
  operationCaches,
  loadOperations,
  lifecycleOperation,
  addChangeset,
  updateCurrentLocation,
  abortAllQueuedUpdates,
  persistOperationCache,
  archiveOperations,
  deleteGuestOperations,
  createMapStateSnapshots,
};
