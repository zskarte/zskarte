import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { shareTokenSchema } from '../src/auth/share-access-plugin.js';
import { orgProcedure, requirePermission } from '../src/trpc/procedures.js';
import { appRouter } from '../src/trpc/router.js';
import { createCallerFactory, router } from '../src/trpc/trpc.js';
import { TEST_ORG_ID } from './helpers/fixtures.js';
import { createTestContext, createTestSession } from './helpers/session.js';

const testRouter = router({
  allowed: orgProcedure.use(requirePermission('operation.overview')).query(({ ctx }) => ctx.scope),
});
const createCaller = createCallerFactory(testRouter);

describe('auth procedure guards', () => {
  it('does not expose an auth domain router', () => {
    expect(appRouter._def.procedures).not.toHaveProperty('auth.me');
  });

  it('rejects anonymous callers', async () => {
    const context = await createTestContext({ authSession: null });
    await expect(createCaller(context).allowed()).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'UNAUTHORIZED',
    });
  });

  it('rejects sessions without an organization scope', async () => {
    const context = await createTestContext({ authSession: createTestSession('organization', null) });
    await expect(createCaller(context).allowed()).rejects.toMatchObject<Partial<TRPCError>>({ code: 'FORBIDDEN' });
  });

  it('returns the server-derived organization scope', async () => {
    const organizationId = TEST_ORG_ID;
    const context = await createTestContext({ authSession: createTestSession('operationread', organizationId) });
    await expect(createCaller(context).allowed()).resolves.toEqual({ organizationId });
  });

  it('rejects a role without the requested permission', async () => {
    const context = await createTestContext({
      authSession: createTestSession('operationread', TEST_ORG_ID),
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
