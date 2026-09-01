import { randomBytes, randomInt } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import type { Context, Scope } from '../../trpc/context.js';
import * as repository from './repository.js';
import { isUniqueViolation } from '../../db/util.js';

type ScopedContext = Context & { scope: Scope };
const TOKEN_RETRIES = 8;
const SHORT_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const forbidden = new TRPCError({ code: 'FORBIDDEN', message: 'This action is forbidden.' });

const scopeFor = (ctx: ScopedContext): repository.AccessScope => ({ organizationId: ctx.scope.organizationId });

export interface GenerateAccessInput {
  name?: string;
  type: 'read' | 'write' | 'all';
  operationId: string;
  tokenType: 'long' | 'short';
}

export const generate = async (
  ctx: ScopedContext,
  input: GenerateAccessInput,
): Promise<{ accessToken: string }> => {
  for (let attempt = 0; attempt < TOKEN_RETRIES; attempt += 1) {
    const accessToken = input.tokenType === 'long'
      ? randomBytes(16).toString('hex')
      : randomInt(0, 1_000_000).toString().padStart(6, '0');
    try {
      await repository.insert(ctx.db, scopeFor(ctx), accessToken, {
        name: input.name,
        type: input.type,
        active: true,
        expiresOn: input.tokenType === 'short' ? new Date(Date.now() + SHORT_TOKEN_LIFETIME_MS) : null,
        operationId: input.operationId,
      });
      return { accessToken };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      if (attempt === TOKEN_RETRIES - 1) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Could not generate a unique access token.', cause: error });
      }
    }
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not generate an access token.' });
};

export const list = (ctx: ScopedContext, operationId?: string) => repository.list(ctx.db, scopeFor(ctx), operationId);

export const byId = async (ctx: ScopedContext, documentId: string): Promise<repository.AccessPublicRow> => {
  const row = await repository.findById(ctx.db, scopeFor(ctx), documentId);
  if (!row) throw forbidden;
  return row;
};

export const update = async (
  ctx: ScopedContext,
  documentId: string,
  values: Partial<Pick<repository.AccessValues, 'name' | 'type' | 'active' | 'expiresOn'>>,
): Promise<repository.AccessPublicRow> => {
  const row = await repository.update(ctx.db, scopeFor(ctx), documentId, values);
  if (!row) throw forbidden;
  return row;
};

export const remove = async (ctx: ScopedContext, documentId: string): Promise<repository.AccessPublicRow> => {
  const row = await repository.remove(ctx.db, scopeFor(ctx), documentId);
  if (!row) throw forbidden;
  return row;
};
