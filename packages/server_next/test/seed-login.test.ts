import { describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { ADMIN_ORGANIZATION_NAME, BASELINE_ORGANIZATIONS, BASELINE_USERS } from '../src/db/seed.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const createLoginDatabase = (rows: unknown[]) => {
  const query = {
    from: () => query,
    leftJoin: () => query,
    orderBy: () => Promise.resolve(rows),
  };
  return { select: () => query } as unknown as Database;
};

describe('seeded admin login identity', () => {
  it('links zso_admin to the dedicated organization in the baseline seed', () => {
    expect(BASELINE_ORGANIZATIONS).toContainEqual({ name: ADMIN_ORGANIZATION_NAME });
    expect(BASELINE_USERS).toContainEqual(
      expect.objectContaining({
        username: 'zso_admin',
        role: 'admin',
        organization: ADMIN_ORGANIZATION_NAME,
      }),
    );
  });

  it('exposes zso_admin as the login identity for the seeded organization', async () => {
    const db = createLoginDatabase([
      {
        organizationId: 'admin-org-id',
        name: ADMIN_ORGANIZATION_NAME,
        logoUrl: null,
        logoFormats: null,
        username: 'zso_admin',
      },
    ]);

    const caller = createCallerFactory(organizationRouter)(await createContextInner({ db }));

    await expect(caller.forLogin()).resolves.toEqual([
      {
        name: ADMIN_ORGANIZATION_NAME,
        logo: null,
        users: [{ username: 'zso_admin' }],
      },
    ]);
  });
});
