import { describe, expect, it } from 'vitest';
import { ADMIN_ORGANIZATION_NAME, BASELINE_ORGANIZATIONS, BASELINE_USERS } from '../src/db/seed.js';
import { organizationRouter } from '../src/modules/organization/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import { createMockDb, createTestContext } from './helpers/index.js';

const logo = {
  logoUrl: '/uploads/logo.png',
  logoFormats: { small: { url: '/uploads/logo-small.png', width: 320 } },
};

describe('organization.forLogin', () => {
  it('is public and returns every user of an organization', async () => {
    const { db } = createMockDb({
      rows: [
        { organizationId: 'org-a', name: 'Alpha', ...logo, username: 'alpha-user' },
        { organizationId: 'org-a', name: 'Alpha', ...logo, username: 'zso_guest' },
        { organizationId: 'org-b', name: 'Zulu', logoUrl: null, logoFormats: null, username: 'zulu-user' },
      ],
    });
    const caller = createCallerFactory(organizationRouter)(await createTestContext({ db }));

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
    const { db } = createMockDb({
      rows: [{ organizationId: 'org-a', name: 'Alpha', logoUrl: null, logoFormats: null, username: 'alpha-user' }],
    });
    const caller = createCallerFactory(organizationRouter)(await createTestContext({ db }));

    await expect(caller.forLogin()).resolves.toEqual([
      { name: 'Alpha', logo: null, users: [{ username: 'alpha-user' }] },
    ]);
  });

  it('keeps organizations without a user and drops the null username row', async () => {
    const { db } = createMockDb({
      rows: [{ organizationId: 'org-a', name: 'Alpha', logoUrl: null, logoFormats: null, username: null }],
    });
    const caller = createCallerFactory(organizationRouter)(await createTestContext({ db }));

    await expect(caller.forLogin()).resolves.toEqual([{ name: 'Alpha', logo: null, users: [] }]);
  });

  it('sorts by organization name and username so the order is stable', async () => {
    const { db, captured } = createMockDb({ rows: [] });
    const caller = createCallerFactory(organizationRouter)(await createTestContext({ db }));

    await caller.forLogin();

    expect(captured.selects[0].orderBy).toHaveLength(2);
  });

  describe('seeded baseline login identity', () => {
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
      const { db } = createMockDb({
        rows: [
          {
            organizationId: 'admin-org-id',
            name: ADMIN_ORGANIZATION_NAME,
            logoUrl: null,
            logoFormats: null,
            username: 'zso_admin',
          },
        ],
      });
      const caller = createCallerFactory(organizationRouter)(await createTestContext({ db }));

      await expect(caller.forLogin()).resolves.toEqual([
        {
          name: ADMIN_ORGANIZATION_NAME,
          logo: null,
          users: [{ username: 'zso_admin' }],
        },
      ]);
    });
  });
});
