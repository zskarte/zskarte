import { describe, expect, it } from 'vitest';
import { createCustomSession } from '../src/auth/auth.js';
import { createMockDb } from './helpers/mock-db.js';
import { createTestSession } from './helpers/session.js';

const testSession = createTestSession('organization', 'session-org', 'operation-1', {
  userId: 'user-1',
  userName: 'Test User',
  username: 'test-user',
  sessionId: 'session-1',
  token: 'token',
  permission: 'all',
  userOverrides: { organizationId: 'user-org' },
});
const user = testSession.user;
const session = testSession.session;

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
    const { db } = createMockDb({
      selects: [
        [organization],
        [{ documentId: 'wms-1' }],
        [{ documentId: 'layer-1' }],
        [{ documentId: 'operation-1' }],
        [{ id: 'user-1' }],
      ],
    });

    await expect(createCustomSession(db, { user, session })).resolves.toEqual({
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
    const { db } = createMockDb({
      selects: [[], [], [], [], []],
    });

    const result = await createCustomSession(db, {
      user,
      session: { ...session, organizationId: null, operationId: null },
    });

    expect(result).toMatchObject({ zsRole: 'organization', operationId: null, organization: null });
  });
});
