import { describe, expect, it } from 'vitest';
import { createCustomSession } from '../src/auth/auth.js';
import type { Database } from '../src/db/client.js';

const createFakeDatabase = (results: unknown[][]): Database => {
  let index = 0;
  return {
    select: () => {
      const result = results[index++];
      const query = Object.assign(Promise.resolve(result), {
        from: () => query,
        leftJoin: () => query,
        where: () => query,
        limit: () => Promise.resolve(result),
      });
      return query;
    },
  } as unknown as Database;
};

const user = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  image: null,
  username: 'test-user',
  organizationId: 'user-org',
  zsRole: 'organization',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const session = {
  id: 'session-1',
  token: 'token',
  userId: user.id,
  expiresAt: new Date(Date.now() + 60_000),
  ipAddress: null,
  userAgent: null,
  operationId: 'operation-1',
  organizationId: 'session-org',
  permission: 'all',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('custom session payload', () => {
  it('returns the complete organization projection consumed by the app', async () => {
    const organization = {
      documentId: 'session-org',
      name: 'Organization',
      mapLongitude: 7.4,
      mapLatitude: 46.9,
      mapZoomLevel: 9,
      defaultLocale: 'de',
      url: null,
      journalEntryTemplate: null,
      settings: null,
      logo: { documentId: 'logo-1', name: 'logo.png', url: '/uploads/logo.png', formats: null, provider: 'local' },
    };
    const database = createFakeDatabase([
      [organization],
      [{ documentId: 'wms-1' }],
      [{ documentId: 'layer-1' }],
      [{ documentId: 'operation-1' }],
      [{ id: 'user-1' }],
    ]);

    await expect(createCustomSession(database, { user, session })).resolves.toEqual({
      user,
      session,
      zsRole: 'organization',
      operationId: 'operation-1',
      organization: {
        ...organization,
        users: [{ id: 'user-1' }],
        operations: [{ documentId: 'operation-1' }],
        wms_sources: ['wms-1'],
        map_layer_favorites: ['layer-1'],
      },
    });
  });

  it('uses the user organization when the session has no organization override', async () => {
    const database = createFakeDatabase([[], [], [], [], []]);

    const result = await createCustomSession(database, {
      user,
      session: { ...session, organizationId: null, operationId: null },
    });

    expect(result).toMatchObject({ zsRole: 'organization', operationId: null, organization: null });
  });
});
