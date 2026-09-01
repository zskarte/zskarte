import { TRPCError } from '@trpc/server';
import { updateChangesetIdsAfterApply, verifyChangesetConsistency } from '@zskarte/common';
import type { IZsChangeset, ZsMapState } from '@zskarte/types';
import { applyPatches, enablePatches } from 'immer';
import isEqual from 'lodash/isEqual.js';
import type { Database } from '../../db/client.js';
import { QueueMutex } from '../../lib/queue-mutex.js';
import { signData } from '../../lib/signing.js';
import { closeOperationChannel, publishChangeset } from '../../realtime/event-bus.js';
import { clearOperationPresence } from '../../realtime/presence.js';
import { getActiveSigningKeyConfig } from '../signing-key/service.js';
import { findActiveOperations, updateOperationState } from './repository.js';
import type { OperationRow } from './schema.js';

enablePatches();

export interface OperationCache {
  operation: OperationRow;
  changesetEndpointMutex: QueueMutex;
  mapState: ZsMapState;
  changesets: Record<string, IZsChangeset>;
  changesetSigns: Record<string, string>;
  signingKeyIds: Set<string>;
  changed: boolean;
}

export interface AddChangesetParams {
  operationId: string;
  identifier: string;
  changeset: IZsChangeset;
  authorIp?: string;
  signal?: AbortSignal;
  req?: any;
  res?: any;
}

export interface SubmitChangesetResult {
  success: boolean;
  alreadySubmitted?: boolean;
  data?: {
    serverSavedAt: number;
    authorIp?: string | null;
    serverId: string;
    signKeyId: string;
    sign: string;
  };
}

const operationCaches = new Map<string, OperationCache>();

export const getOperationCache = (operationId: string): OperationCache | undefined => {
  return operationCaches.get(operationId);
};

export const getOperationCaches = (): ReadonlyMap<string, OperationCache> => operationCaches;

export const addToCache = (operation: OperationRow): OperationCache => {
  const mapState: ZsMapState =
    operation.mapState ||
    ({
      version: 2,
      layers: {},
      drawElements: {},
    } as unknown as ZsMapState);
  const changesets: Record<string, IZsChangeset> = operation.changesets || {};
  const changesetSigns: Record<string, string> = operation.changesetSigns || {};
  const signingKeyIds = new Set<string>(operation.signingKeyIds || []);

  const changesetEndpointMutex = new QueueMutex();
  const cache: OperationCache = {
    operation,
    changesetEndpointMutex,
    mapState,
    changesets,
    changesetSigns,
    signingKeyIds,
    changed: false,
  };

  operationCaches.set(operation.documentId, cache);
  return cache;
};

export const removeFromCache = (operationId: string, reason = 'Operation removed from cache'): void => {
  const cache = operationCaches.get(operationId);
  if (!cache) return;
  operationCaches.delete(operationId);
  cache.changesetEndpointMutex.abortAll(reason);
  clearOperationPresence(operationId);
  closeOperationChannel(operationId);
};

export const warmupOperationCache = async (db: Database): Promise<void> => {
  const activeOperations = await findActiveOperations(db);
  for (const op of activeOperations) {
    addToCache(op);
  }
};

export const signChangeset = (changeset: IZsChangeset): string => {
  const activeConfig = getActiveSigningKeyConfig();
  if (!activeConfig) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Active signing key configuration is not initialized.',
    });
  }

  changeset.serverId = activeConfig.serverId;
  changeset.signKeyId = activeConfig.keyId;
  return signData(changeset, activeConfig.privateKeyObject, activeConfig.keyType);
};

export const changesetAlreadyExist = (operationCache: OperationCache, changeset: IZsChangeset): boolean => {
  const savedChangeset = operationCache.changesets[changeset.id];
  if (!savedChangeset) {
    return false;
  }

  const {
    applied: _savedApplied,
    saved: _savedSaved,
    serverSavedAt: _savedServerSavedAt,
    authorIp: _savedAuthorIp,
    serverId: _savedServerId,
    signKeyId: _savedSignKeyId,
    ...savedChangesetToCompare
  } = savedChangeset;

  const {
    applied: _incommingApplied,
    saved: _incommingSaved,
    serverSavedAt: _incommingServerSavedAt,
    authorIp: _incommingAuthorIp,
    serverId: _incommingServerId,
    signKeyId: _incommingSignKeyId,
    ...incommingChangesetToCompare
  } = changeset;

  if (isEqual(savedChangesetToCompare, incommingChangesetToCompare)) {
    return true;
  }

  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 're-submit changeset with other content',
  });
};

export const addChangeset = async (params: AddChangesetParams): Promise<SubmitChangesetResult> => {
  const operationCache = operationCaches.get(params.operationId);
  if (!operationCache) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'The operation is archived, no update allowed.',
    });
  }

  if (changesetAlreadyExist(operationCache, params.changeset)) {
    return { success: true, alreadySubmitted: true };
  }

  const task = operationCache.changesetEndpointMutex.enqueueWithTimeout({
    maxWaitMs: 15_000,
    signal: params.signal,
    req: params.req,
    res: params.res,
    fn: async (task) => {
      if (changesetAlreadyExist(operationCache, params.changeset)) {
        return { success: true, alreadySubmitted: true };
      }

      if (!params.changeset.drawElementsLastChangeset) {
        params.changeset.drawElementsLastChangeset = {};
      }
      if (!params.changeset.changedDrawElements) {
        params.changeset.changedDrawElements = [];
      }
      if (!params.changeset.deletedDrawElements) {
        params.changeset.deletedDrawElements = [];
      }

      let mapState = operationCache.mapState;
      const error = verifyChangesetConsistency(mapState, params.changeset);
      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'changeset is inconsistent',
        });
      }

      const oldMapState = mapState;
      mapState = applyPatches(mapState, params.changeset.patches);

      if (task.aborted || task.clientAborted) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'aborted' });
      }

      const revertedMapState = applyPatches(mapState, params.changeset.inversePatches);
      if (!isEqual(oldMapState, revertedMapState)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'inverse patches do not reset cleanly',
        });
      }

      mapState = updateChangesetIdsAfterApply(mapState, params.changeset);
      params.changeset.applied = true;
      params.changeset.saved = true;
      params.changeset.serverSavedAt = Date.now();
      params.changeset.authorIp = params.authorIp;

      const sign = signChangeset(params.changeset);

      if (operationCache.mapState !== oldMapState) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'concurrent modification error',
        });
      }

      if (task.aborted || task.clientAborted) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'aborted' });
      }

      operationCache.changesets[params.changeset.id] = params.changeset;
      operationCache.changesetSigns[params.changeset.id] = sign;
      operationCache.signingKeyIds.add(params.changeset.signKeyId!);
      operationCache.mapState = mapState;
      operationCache.changed = true;
      publishChangeset(params.operationId, params.identifier, params.changeset, sign);

      return {
        success: true,
        data: {
          serverSavedAt: params.changeset.serverSavedAt!,
          authorIp: params.changeset.authorIp ?? null,
          serverId: params.changeset.serverId!,
          signKeyId: params.changeset.signKeyId!,
          sign,
        },
      };
    },
  });

  return await task.result;
};

export const persistOperation = async (
  db: Database,
  operationId: string,
  operationCache: OperationCache,
): Promise<void> => {
  await updateOperationState(db, operationId, {
    mapState: operationCache.mapState,
    changesets: operationCache.changesets,
    changesetSigns: operationCache.changesetSigns,
    signingKeyIds: Array.from(operationCache.signingKeyIds),
  });
};

export const persistAllOperations = async (db: Database): Promise<void> => {
  for (const [operationId, operationCache] of operationCaches.entries()) {
    if (!operationCache.changed) continue;
    await persistOperation(db, operationId, operationCache);
    operationCache.changed = false;
  }
};

export const abortAllQueuedChangesets = (reason = 'server shutdown'): void => {
  for (const operationCache of operationCaches.values()) {
    operationCache.changesetEndpointMutex.abortAll(reason);
  }
};

export const resetCacheForTesting = (): void => {
  for (const operationId of Array.from(operationCaches.keys())) removeFromCache(operationId, 'reset for testing');
};
