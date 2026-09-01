import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { shareTokenSchema } from '../src/auth/share-access-plugin.js';
import { createContextInner, type AuthSession } from '../src/trpc/context.js';
import { orgProcedure, requirePermission } from '../src/trpc/procedures.js';
import { createCallerFactory, router } from '../src/trpc/trpc.js';

const authSession = (role: AuthSession['user']['zsRole'], organizationId: string | null): AuthSession => ({
  user: {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    username: 'test',
    organizationId,
    zsRole: role,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'session-1',
    token: 'token',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    ipAddress: null,
    userAgent: null,
    operationId: null,
    organizationId: null,
    permission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const testRouter = router({
  allowed: orgProcedure.use(requirePermission('operation.overview')).query(({ ctx }) => ctx.scope),
});
const createCaller = createCallerFactory(testRouter);

describe('auth procedure guards', () => {
  it('rejects anonymous callers', async () => {
    await expect(createCaller(await createContextInner()).allowed()).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'UNAUTHORIZED',
    });
  });

  it('rejects sessions without an organization scope', async () => {
    const context = await createContextInner({ authSession: authSession('organization', null) });
    await expect(createCaller(context).allowed()).rejects.toMatchObject<Partial<TRPCError>>({ code: 'FORBIDDEN' });
  });

  it('returns the server-derived organization scope', async () => {
    const organizationId = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
    const context = await createContextInner({ authSession: authSession('operationread', organizationId) });
    await expect(createCaller(context).allowed()).resolves.toEqual({ organizationId });
  });

  it('rejects a role without the requested permission', async () => {
    const context = await createContextInner({
      authSession: authSession('operationread', 'ca548097-df0f-4862-8bd3-b104bf537bd8'),
    });
    const deniedRouter = router({
      denied: orgProcedure.use(requirePermission('journal.create')).query(() => true),
    });
    await expect(createCallerFactory(deniedRouter)(context).denied()).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'FORBIDDEN',
    });
  });
});

describe('share token validation', () => {
  it.each(['123456', '012345', '0123456789abcdef0123456789abcdef'])('accepts %s', (token) => {
    expect(shareTokenSchema.safeParse(token).success).toBe(true);
  });

  it.each(['12345', '1234567', 'not-a-share-token', 'g123456789abcdef0123456789abcdef'])('rejects %s', (token) => {
    expect(shareTokenSchema.safeParse(token).success).toBe(false);
  });
});
