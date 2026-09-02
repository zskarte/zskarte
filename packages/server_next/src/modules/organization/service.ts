import type { IZsMapOrganization, IZsMapOrganizationSettings } from '@zskarte/types';
import { TRPCError } from '@trpc/server';
import type { Context, Scope } from '../../trpc/context.js';
import type { LoginOrganization } from './repository.js';
import * as repository from './repository.js';

/** Keys strapi accepted on the layer settings endpoint, every other key was dropped. */
export interface LayerSettingsInput {
  wms_sources?: string[];
  map_layer_favorites?: string[];
}

export type MutationResult = { success: true };

const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';

const logViolation = (ctx: Context, message: string): void => {
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

const isForeignKeyViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === POSTGRES_FOREIGN_KEY_VIOLATION;

const unique = (values: string[]): string[] => [...new Set(values)];

/**
 * Port of the strapi UPDATE_BY_ID access control: a client supplied organization id
 * that is not the organization of the session is forbidden, missing entries are not
 * distinguishable from foreign ones so nothing leaks.
 */
export const resolveOwnScope = (
  ctx: Context & { scope: Scope },
  organizationId: string,
): repository.OrganizationScope => {
  if (organizationId !== ctx.scope.organizationId) {
    logViolation(ctx, `access not allowed, organizationId:${organizationId}`);
    throw forbidden;
  }
  return { organizationId: ctx.scope.organizationId };
};

export const listForLogin = (ctx: Context): Promise<LoginOrganization[]> => repository.listForLogin(ctx.db);

export const current = (ctx: Context & { scope: Scope }): Promise<IZsMapOrganization | null> =>
  repository.getOrganization(ctx.db, { organizationId: ctx.scope.organizationId });

export const updateSettings = async (
  ctx: Context & { scope: Scope },
  organizationId: string,
  settings: IZsMapOrganizationSettings | null,
): Promise<MutationResult> => {
  await repository.updateSettings(ctx.db, resolveOwnScope(ctx, organizationId), settings);
  return { success: true };
};

export const updateJournalEntryTemplate = async (
  ctx: Context & { scope: Scope },
  organizationId: string,
  journalEntryTemplate: Record<string, unknown> | null,
): Promise<MutationResult> => {
  await repository.updateJournalEntryTemplate(ctx.db, resolveOwnScope(ctx, organizationId), journalEntryTemplate);
  return { success: true };
};

/**
 * Only the keys present in the payload are written, duplicates are ignored and an id
 * that does not exist violates the foreign key, which becomes a bad request.
 */
export const updateLayerSettings = async (
  ctx: Context & { scope: Scope },
  organizationId: string,
  data: LayerSettingsInput,
): Promise<MutationResult> => {
  const scope = resolveOwnScope(ctx, organizationId);
  const rows: repository.LayerSettingsRows = {
    ...(data.wms_sources === undefined ? {} : { wmsSourceIds: unique(data.wms_sources) }),
    ...(data.map_layer_favorites === undefined ? {} : { mapLayerIds: unique(data.map_layer_favorites) }),
  };

  try {
    await repository.replaceLayerSettings(ctx.db, scope, rows);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unknown wms source or map layer reference.', cause: error });
    }
    throw error;
  }
  return { success: true };
};
