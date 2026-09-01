import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const createFakeDatabase = (rows: unknown[]) => {
  const recorded: { orderBy: unknown[] } = { orderBy: [] };
  const query = {
    from: () => query,
    leftJoin: () => query,
    orderBy: (...expressions: unknown[]) => {
      recorded.orderBy = expressions;
      return Promise.resolve(rows);
    },
  };
  return { db: { select: () => query } as unknown as Database, recorded };
};

const logo = {
  logoUrl: '/uploads/logo.png',
  logoFormats: { small: { url: '/uploads/logo-small.png', width: 320 } },
};

describe('organization.forLogin', () => {
  it('is public and returns every user of an organization', async () => {
    const { db } = createFakeDatabase([
      { organizationId: 'org-a', name: 'Alpha', ...logo, username: 'alpha-user' },
      { organizationId: 'org-a', name: 'Alpha', ...logo, username: 'zso_guest' },
      { organizationId: 'org-b', name: 'Zulu', logoUrl: null, logoFormats: null, username: 'zulu-user' },
    ]);
    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await expect(caller.forLogin()).resolves.toEqual([
      {
        name: 'Alpha',
        logo: { url: '/uploads/logo.png', formats: { small: { url: '/uploads/logo-small.png', width: 320 } } },
        users: [{ username: 'alpha-user' }, { username: 'zso_guest' }],
      },
      {
        name: 'Zulu',
        logo: null,
        users: [{ username: 'zulu-user' }],
      },
    ]);
  });

  it('returns no logo instead of an all-null logo object', async () => {
    const { db } = createFakeDatabase([
      { organizationId: 'org-a', name: 'Alpha', logoUrl: null, logoFormats: null, username: 'alpha-user' },
    ]);
    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await expect(caller.forLogin()).resolves.toEqual([
      { name: 'Alpha', logo: null, users: [{ username: 'alpha-user' }] },
    ]);
  });

  it('keeps organizations without a user and drops the null username row', async () => {
    const { db } = createFakeDatabase([
      { organizationId: 'org-a', name: 'Alpha', logoUrl: null, logoFormats: null, username: null },
    ]);
    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await expect(caller.forLogin()).resolves.toEqual([{ name: 'Alpha', logo: null, users: [] }]);
  });

  it('sorts by organization name and username so the order is stable', async () => {
    const { db, recorded } = createFakeDatabase([]);
    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await caller.forLogin();

    expect(recorded.orderBy).toHaveLength(2);
  });
});
