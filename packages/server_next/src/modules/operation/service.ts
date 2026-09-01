import { TRPCError } from '@trpc/server';
import type { IZSMapOperationMapLayers, IZsChangeset, ZsMapState, ZsOperationPhase } from '@zskarte/types';
import type { Context, Scope } from '../../trpc/context.js';
import { assertCreateIdentifiersNotForced } from '../../trpc/procedures.js';
import {
  addToCache,
  getOperationCache,
  persistOperation,
  removeFromCache,
  addChangeset,
  type SubmitChangesetResult,
} from './cache.js';
import * as repository from './repository.js';
import type { OperationRow } from './schema.js';

const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const logViolation = (ctx: Context, message: string, operationId?: string) => {
  ctx.logger.warn(
    {
      url: ctx.requestPath,
      userOrganisationId: ctx.scope?.organizationId,
      jwtOperationId: ctx.session?.operationId,
      operationId,
      ip: ctx.requestIp,
      userAgent: ctx.userAgent,
    },
    `[global::accessControl]: ${message}`,
  );
};

export interface CreateOperationInput {
  id?: unknown;
  documentId?: unknown;
  name: string;
  description?: string | null;
  phase?: ZsOperationPhase;
  eventStates?: number[] | null;
  mapState?: ZsMapState | null;
  mapLayers?: IZSMapOperationMapLayers | null;
  organization?: string | null;
}

export interface UpdateOperationMetaInput {
  name?: string;
  description?: string | null;
  eventStates?: number[] | null;
}

export const listOverview = async (
  ctx: Context & { scope: Scope },
  phase: 'active' | 'archived' | 'deleted' = 'active',
): Promise<repository.OperationOverviewItem[]> => {
  return repository.listOverview(ctx.db, ctx.scope, phase);
};

export const byId = async (ctx: Context & { scope: Scope }, documentId: string): Promise<OperationRow> => {
  const row = await repository.findById(ctx.db, ctx.scope, documentId);
  if (!row) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`, documentId);
    throw forbidden;
  }

  const cache = getOperationCache(documentId);
  if (cache) {
    return {
      ...row,
      mapState: cache.mapState,
      changesets: cache.changesets,
      changesetSigns: cache.changesetSigns,
      signingKeyIds: Array.from(cache.signingKeyIds),
    };
  }

  return row;
};

export const create = async (
  ctx: Context & { scope: Scope },
  data: CreateOperationInput,
): Promise<OperationRow> => {
  if (data.id !== undefined || data.documentId !== undefined) {
    logViolation(ctx, `create with forcing entry documentId, data.documentId:${JSON.stringify(data.documentId)}`);
  }
  assertCreateIdentifiersNotForced(data);

  if (data.organization && data.organization !== ctx.scope.organizationId) {
    logViolation(ctx, `create with other/no organization, data.organization:${JSON.stringify(data.organization)}`);
    throw forbidden;
  }

  const row = await repository.insertOperation(ctx.db, ctx.scope, {
    name: data.name,
    description: data.description ?? null,
    phase: data.phase ?? 'active',
    eventStates: data.eventStates ?? null,
    mapState: data.mapState ?? null,
    mapLayers: data.mapLayers ?? null,
  });

  if (row.phase === 'active') {
    addToCache(row);
  }

  return row;
};

export const updateMeta = async (
  ctx: Context & { scope: Scope },
  operationId: string,
  data: UpdateOperationMetaInput,
): Promise<{ success: boolean }> => {
  await repository.updateOperationMeta(ctx.db, ctx.scope, operationId, data);
  const cache = getOperationCache(operationId);
  if (cache) {
    if (data.name !== undefined) cache.operation.name = data.name;
    if (data.description !== undefined) cache.operation.description = data.description;
    if (data.eventStates !== undefined) cache.operation.eventStates = data.eventStates;
  }
  return { success: true };
};

export const updateMapLayers = async (
  ctx: Context & { scope: Scope },
  operationId: string,
  mapLayers: IZSMapOperationMapLayers,
): Promise<{ success: boolean }> => {
  await repository.updateOperationMapLayers(ctx.db, ctx.scope, operationId, mapLayers);
  const cache = getOperationCache(operationId);
  if (cache) {
    cache.operation.mapLayers = mapLayers;
  }
  return { success: true };
};

export const archive = async (
  ctx: Context & { scope: Scope },
  operationId: string,
): Promise<{ success: boolean }> => {
  await repository.updateOperationPhase(ctx.db, ctx.scope, operationId, 'archived');
  const cache = getOperationCache(operationId);
  if (cache) {
    cache.changesetEndpointMutex.abortAll('operation is archived, changes no longer possible');
    await persistOperation(ctx.db, operationId, cache);
    removeFromCache(operationId);
  }
  return { success: true };
};

export const unarchive = async (
  ctx: Context & { scope: Scope },
  operationId: string,
): Promise<{ success: boolean }> => {
  await repository.updateOperationPhase(ctx.db, ctx.scope, operationId, 'active');
  const row = await repository.findById(ctx.db, ctx.scope, operationId);
  if (row) {
    addToCache(row);
  }
  return { success: true };
};

export const shadowDelete = async (
  ctx: Context & { scope: Scope },
  operationId: string,
): Promise<{ success: boolean }> => {
  await repository.updateOperationPhase(ctx.db, ctx.scope, operationId, 'deleted');
  const cache = getOperationCache(operationId);
  if (cache) {
    cache.changesetEndpointMutex.abortAll('operation is deleted');
    removeFromCache(operationId);
  }
  return { success: true };
};

export const submitChangeset = async (
  ctx: Context & { scope: Scope },
  input: {
    operationId: string;
    identifier: string;
    changeset: IZsChangeset;
  },
): Promise<SubmitChangesetResult> => {
  const { operationId, identifier, changeset } = input;

  if (changeset.operationId !== operationId) {
    logViolation(ctx, 'changeset operationId mismatch', operationId);
    throw forbidden;
  }

  const changesetOrgId = (changeset as any).organisationId || (changeset as any).organizationId;
  if (changesetOrgId && changesetOrgId !== ctx.scope.organizationId) {
    logViolation(ctx, 'changeset organizationId mismatch', operationId);
    throw forbidden;
  }

  return addChangeset({
    operationId,
    identifier,
    changeset,
    authorIp: ctx.requestIp ?? undefined,
    req: ctx.req,
  });
};
