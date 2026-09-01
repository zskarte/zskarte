import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { createContextInner } from '../src/trpc/context.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const createFakeDatabase = (rows: unknown[]): Database => {
  const query = {
    from: () => query,
    leftJoin: () => query,
    orderBy: () => Promise.resolve(rows),
  };
  return { select: () => query } as unknown as Database;
};

describe('organization.forLogin', () => {
  it('is public and returns only fields used by the login component', async () => {
    const db = createFakeDatabase([
      {
        organizationId: 'org-a',
        name: 'Alpha',
        logo: { url: '/uploads/logo.png', formats: { small: { url: '/uploads/logo-small.png', width: 320 } } },
        username: 'alpha-user',
      },
      {
        organizationId: 'org-a',
        name: 'Alpha',
        logo: { url: '/uploads/logo.png', formats: { small: { url: '/uploads/logo-small.png', width: 320 } } },
        username: 'second-user',
      },
      {
        organizationId: 'org-b',
        name: 'Zulu',
        logo: null,
        username: 'zulu-user',
      },
    ]);
    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await expect(caller.forLogin()).resolves.toEqual([
      {
        name: 'Alpha',
        logo: { url: '/uploads/logo.png', formats: { small: { url: '/uploads/logo-small.png', width: 320 } } },
        users: [{ username: 'alpha-user' }],
      },
      {
        name: 'Zulu',
        logo: null,
        users: [{ username: 'zulu-user' }],
      },
    ]);
  });
});
