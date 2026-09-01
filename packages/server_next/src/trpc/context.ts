import { TRPCError } from '@trpc/server';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth.js';
import { isRole, type Role } from '../auth/roles.js';
import type { session, user } from '../db/auth-schema.js';
import { type Database, db } from '../db/client.js';
import { type Logger, logger } from '../lib/logger.js';

export interface Scope {
  organizationId: string;
  operationId?: string;
}

export interface AuthSession {
  user: typeof user.$inferSelect;
  session: typeof session.$inferSelect;
}

export interface CreateInnerContextOptions {
  requestIp?: string | null;
  requestPath?: string;
  userAgent?: string | null;
  authSession?: AuthSession | null;
  db?: Database;
  logger?: Logger;
  req?: any;
}

export interface Context {
  db: Database;
  logger: Logger;
  requestIp: string | null;
  requestPath: string;
  userAgent: string | null;
  authSession: AuthSession | null;
  user: AuthSession['user'] | null;
  session: AuthSession['session'] | null;
  role: Role;
  scope: Scope | null;
  req?: any;
}

export const createContextInner = async (opts: CreateInnerContextOptions = {}): Promise<Context> => {
  const authSession = opts.authSession ?? null;
  const role = isRole(authSession?.user.zsRole) ? authSession.user.zsRole : 'public';
  const organizationId = authSession?.session.organizationId ?? authSession?.user.organizationId;

  return {
    db: opts.db ?? db,
    logger: opts.logger ?? logger,
    requestIp: opts.requestIp ?? null,
    requestPath: opts.requestPath ?? 'internal',
    userAgent: opts.userAgent ?? null,
    authSession,
    user: authSession?.user ?? null,
    session: authSession?.session ?? null,
    role,
    scope: organizationId
      ? { organizationId, ...(authSession?.session.operationId ? { operationId: authSession.session.operationId } : {}) }
      : null,
    req: opts.req,
  };
};

export const createContext = async ({ req, info }: CreateFastifyContextOptions): Promise<Context> => {
  const headers = { ...req.headers };
  if (!headers.cookie && info.connectionParams?.cookie) headers.cookie = info.connectionParams.cookie;
  const authSession = (await auth.api.getSession({ headers: fromNodeHeaders(headers) })) as AuthSession | null;

  if (req.headers.upgrade === 'websocket' && !authSession) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'This action is unauthorized.' });
  }

  return createContextInner({
    authSession,
    requestIp: req.ip ?? null,
    requestPath: req.url,
    userAgent: req.headers['user-agent'] ?? null,
    req,
  });
};
