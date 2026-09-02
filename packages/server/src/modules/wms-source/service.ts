import { TRPCError } from '@trpc/server';
import type { Context, Scope } from '../../trpc/context.js';
import { assertCreateIdentifiersNotForced } from '../../trpc/procedures.js';
import * as repository from './repository.js';
import type { WmsSourceRow } from './schema.js';

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

export interface WmsSourceData {
  id?: unknown;
  documentId?: string | null;
  organization?: string | null;
  label?: string | null;
  type?: WmsSourceRow['type'] | null;
  url?: string | null;
  attribution?: unknown;
  public?: boolean | null;
}

/** mirrors `WmsSourceApi` of @zskarte/types, without the dropped numeric strapi id */
export interface WmsSourceApiResponse {
  documentId: string;
  label: string | null;
  type: WmsSourceRow['type'] | null;
  url: string | null;
  attribution: [string, string][] | null;
  public: boolean;
  organization: { documentId: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const toApi = (record: repository.WmsSourceRecord): WmsSourceApiResponse => ({
  documentId: record.documentId,
  label: record.label,
  type: record.type,
  url: record.url,
  attribution: (record.attribution ?? null) as [string, string][] | null,
  public: record.public ?? false,
  organization: record.organizationId ? { documentId: record.organizationId } : null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

/** allowlist, everything the client sends on top of these keys is dropped */
const writableValues = (data: WmsSourceData): repository.WmsSourceValues => {
  const values: repository.WmsSourceValues = {};
  if (data.label !== undefined) values.label = data.label;
  if (data.type !== undefined) values.type = data.type;
  if (data.url !== undefined) values.url = data.url;
  if (data.attribution !== undefined) values.attribution = data.attribution;
  if (data.public !== undefined) values.public = data.public;
  return values;
};

export const list = async (ctx: Context): Promise<WmsSourceApiResponse[]> => {
  const records = await repository.listVisible(ctx.db, ctx.scope);
  return records.map(toApi);
};

export const byId = async (ctx: Context, documentId: string): Promise<WmsSourceApiResponse> => {
  const record = await repository.findVisible(ctx.db, documentId, ctx.scope);
  if (!record) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`);
    throw forbidden;
  }
  return toApi(record);
};

export const create = async (ctx: Context & { scope: Scope }, data: WmsSourceData): Promise<WmsSourceApiResponse> => {
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
  if (!record) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'The wms source could not be created.' });
  return toApi(record);
};

export const update = async (
  ctx: Context & { scope: Scope },
  documentId: string,
  data: WmsSourceData,
): Promise<WmsSourceApiResponse> => {
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

export const remove = async (ctx: Context & { scope: Scope }, documentId: string): Promise<WmsSourceApiResponse> => {
  const current = await repository.findOwned(ctx.db, documentId, ctx.scope);
  if (!current) {
    logViolation(ctx, `access not allowed, paramId:${documentId}`);
    throw forbidden;
  }
  await repository.remove(ctx.db, documentId, ctx.scope);
  return toApi(current);
};
