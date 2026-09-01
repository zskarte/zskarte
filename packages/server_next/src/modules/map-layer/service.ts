import { TRPCError } from '@trpc/server';
import type { Context, Scope } from '../../trpc/context.js';
import { assertCreateIdentifiersNotForced } from '../../trpc/procedures.js';
import * as repository from './repository.js';
import type { MapLayerRow } from './schema.js';

const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const logViolation = (ctx: Context, message: string) => {
  ctx.logger.warn(
    {
      url: ctx.requestPath,
      userOrganisationId: ctx.scope?.organizationId,
      jwtOperationId: ctx.session?.operationId,
      ip: ctx.requestIp,
      userAgent: ctx.userAgent,
    },
    `[global::accessControl]: ${message}`,
  );
};

/** strapi `canNotUseBodyValue`: null clears a relation, a different value moves the entry */
const canNotUseBodyValue = (bodyValue: string | null | undefined, idToCheck: string | null): boolean =>
  bodyValue === null || (bodyValue !== undefined && bodyValue !== idToCheck);

export interface MapLayerData {
  id?: unknown;
  documentId?: string | null;
  organization?: string | null;
  label?: string | null;
  serverLayerName?: string | null;
  type?: MapLayerRow['type'] | null;
  wms_source?: string | null;
  media_source?: string | null;
  custom_source?: string | null;
  options?: Record<string, unknown> | null;
  public?: boolean | null;
}

/** mirrors `MapLayerApi` of @zskarte/types, without the dropped numeric strapi id */
export interface MapLayerApiResponse {
  documentId: string;
  label: string | null;
  serverLayerName: string | null;
  type: MapLayerRow['type'] | null;
  public: boolean;
  options: Record<string, unknown>;
  wms_source: { documentId: string } | null;
  media_source: { documentId: string; url: string; name: string } | null;
  custom_source: string | null;
  organization: { documentId: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

/** `options` is spread by `convertMapLayerFromApi()` so it must never be null */
const toApi = (record: repository.MapLayerRecord): MapLayerApiResponse => ({
  documentId: record.documentId,
  label: record.label,
  serverLayerName: record.serverLayerName,
  type: record.type,
  public: record.public ?? false,
  options: record.options ?? {},
  wms_source: record.wmsSourceId ? { documentId: record.wmsSourceId } : null,
  media_source:
    record.mediaSourceId && record.mediaSourceUrl !== null
      ? { documentId: record.mediaSourceId, url: record.mediaSourceUrl, name: record.mediaSourceName ?? '' }
      : null,
  custom_source: record.customSource,
  organization: record.organizationId ? { documentId: record.organizationId } : null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

/** allowlist, everything the client sends on top of these keys is dropped */
const writableValues = (data: MapLayerData): repository.MapLayerValues => {
  const values: repository.MapLayerValues = {};
  if (data.label !== undefined) values.label = data.label;
  if (data.serverLayerName !== undefined) values.serverLayerName = data.serverLayerName;
  if (data.type !== undefined) values.type = data.type;
  if (data.wms_source !== undefined) values.wmsSourceId = data.wms_source;
  if (data.media_source !== undefined) values.mediaSourceId = data.media_source;
  if (data.custom_source !== undefined) values.customSource = data.custom_source;
  if (data.options !== undefined) values.options = data.options;
  if (data.public !== undefined) values.public = data.public;
  return values;
};

export const list = async (ctx: Context): Promise<MapLayerApiResponse[]> => {
  const records = await repository.listVisible(ctx.db, ctx.scope);
  return records.map(toApi);
};

export const byId = async (ctx: Context, documentId: string): Promise<MapLayerApiResponse> => {
  const record = await repository.findVisible(ctx.db, documentId, ctx.scope);
  if (!record) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`);
    throw forbidden;
  }
  return toApi(record);
};

export const create = async (ctx: Context & { scope: Scope }, data: MapLayerData): Promise<MapLayerApiResponse> => {
  if (data.id !== undefined || data.documentId !== undefined) {
    logViolation(ctx, `create with forcing entry documentId, data.documentId:${JSON.stringify(data.documentId)}`);
  }
  assertCreateIdentifiersNotForced(data);
  if (data.organization !== undefined && data.organization !== ctx.scope.organizationId) {
    logViolation(ctx, `create with other/no organization, data.organization:${JSON.stringify(data.organization)}`);
    throw forbidden;
  }

  const documentId = await repository.insert(ctx.db, ctx.scope, writableValues(data));
  const record = documentId ? await repository.findVisible(ctx.db, documentId, ctx.scope) : undefined;
  if (!record) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'The map layer could not be created.' });
  return toApi(record);
};

export const update = async (
  ctx: Context & { scope: Scope },
  documentId: string,
  data: MapLayerData,
): Promise<MapLayerApiResponse> => {
  const current = await repository.findOwned(ctx.db, documentId, ctx.scope);
  if (!current) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`);
    throw forbidden;
  }
  if (canNotUseBodyValue(data.documentId, current.documentId)) {
    logViolation(ctx, `update to other id, data.documentId:${JSON.stringify(data.documentId)}`);
    throw forbidden;
  }
  if (canNotUseBodyValue(data.organization, current.organizationId)) {
    logViolation(ctx, `update to other organization, data.organization:${JSON.stringify(data.organization)}`);
    throw forbidden;
  }

  await repository.update(ctx.db, documentId, ctx.scope, writableValues(data));
  const record = await repository.findVisible(ctx.db, documentId, ctx.scope);
  if (!record) throw forbidden;
  return toApi(record);
};

export const remove = async (ctx: Context & { scope: Scope }, documentId: string): Promise<MapLayerApiResponse> => {
  const current = await repository.findOwned(ctx.db, documentId, ctx.scope);
  if (!current) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`);
    throw forbidden;
  }
  await repository.remove(ctx.db, documentId, ctx.scope);
  return toApi(current);
};
