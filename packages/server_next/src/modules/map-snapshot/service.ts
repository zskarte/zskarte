import { TRPCError } from '@trpc/server';
import { type PaginatedResult, type PaginationInput, paginated } from '../../lib/pagination.js';
import type { Context, Scope } from '../../trpc/context.js';
import {
  type MapSnapshotDetailRow,
  type MapSnapshotField,
  type MapSnapshotListRow,
  countByOperation,
  findByDocumentId,
  listByOperation,
} from './repository.js';

type ScopedContext = Context & { scope: Scope };

const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

/** Same log shape as `src/trpc/procedures.ts`, a missing snapshot is treated as an access violation. */
const logViolation = (ctx: ScopedContext, message: string, documentId: string) => {
  ctx.logger.warn(
    {
      url: ctx.requestPath,
      userOrganisationId: ctx.scope.organizationId,
      jwtOperationId: ctx.session?.operationId,
      documentId,
      ip: ctx.requestIp,
      userAgent: ctx.userAgent,
    },
    `[global::accessControl]: ${message}`,
  );
};

export interface ListMapSnapshotsInput extends PaginationInput {
  operationId: string;
  fields?: MapSnapshotField[];
}

export const listMapSnapshots = async (
  ctx: ScopedContext,
  input: ListMapSnapshotsInput,
): Promise<PaginatedResult<MapSnapshotListRow>> => {
  const { operationId, fields, ...pagination } = input;
  // an empty selection means "all columns", the app omits `fields` on some calls
  const selection = fields && fields.length > 0 ? fields : undefined;

  const [rows, total] = await Promise.all([
    listByOperation(ctx.db, ctx.scope, operationId, pagination, selection),
    countByOperation(ctx.db, ctx.scope, operationId),
  ]);

  return paginated(rows, pagination, total);
};

export const getMapSnapshotById = async (ctx: ScopedContext, documentId: string): Promise<MapSnapshotDetailRow> => {
  const snapshot = await findByDocumentId(ctx.db, ctx.scope, documentId);
  if (!snapshot) {
    // unknown snapshot and snapshot of another tenant answer the same, existence must not leak
    logViolation(ctx, 'access not allowed', documentId);
    throw forbidden;
  }
  return snapshot;
};
