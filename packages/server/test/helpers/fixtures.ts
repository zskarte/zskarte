import type { IZsChangeset, ZsMapState } from '@zskarte/types';
import type { Role } from '../../src/auth/roles.js';
import { ROLES } from '../../src/auth/roles.js';
import type { session, user } from '../../src/db/auth-schema.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../../src/db/default-permissions.js';
import type { AccessRow } from '../../src/modules/access/schema.js';
import type { FileRow } from '../../src/modules/file/schema.js';
import type { JournalEntryRow } from '../../src/modules/journal/schema.js';
import type { MapLayerRow } from '../../src/modules/map-layer/schema.js';
import type { MapSnapshotRow } from '../../src/modules/map-snapshot/schema.js';
import type { OperationRow } from '../../src/modules/operation/schema.js';
import type { OrganizationRow } from '../../src/modules/organization/schema.js';

// Standard test UUIDs
export const TEST_ORG_ID = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
export const TEST_ORG_ID_2 = '2b5f5f6a-2a04-4e5e-9b23-0f5a86e3a111';
export const TEST_OP_ID = '4f4c6e1e-6c8a-4a5e-9f0f-6c2d8fd0b9a2';
export const TEST_OP_ID_2 = '8c2c9f0e-3d6b-4f1a-8f7e-1a2b3c4d5e6f';
export const TEST_USER_ID = 'user-test-id-1';
export const TEST_USER_ID_2 = 'user-test-id-2';
export const TEST_ADMIN_USER_ID = 'admin-user-id-1';
export const TEST_SESSION_ID = 'session-test-id-1';
export const TEST_FILE_ID = '55555555-5555-4555-8555-555555555555';
export const TEST_SNAPSHOT_ID = '9e0d1c2b-3a49-4b58-8c67-7d86e95fa4b3';
export const TEST_LAYER_ID = '77777777-7777-4777-8777-777777777777';
export const TEST_SIGNING_KEY_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const TEST_ACCESS_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const TEST_JOURNAL_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

export type UserRow = typeof user.$inferSelect;
export type SessionRow = typeof session.$inferSelect;

/**
 * Role-permission rows fixture matching the default permissions mapping.
 */
export const DEFAULT_ROLE_PERMISSION_ROWS: Array<{ role: Role; permission: string }> = ROLES.flatMap((role) =>
  [...DEFAULT_ROLE_PERMISSIONS[role]].map((permission) => ({ role, permission })),
);

export function createOrganizationFixture(overrides: Partial<OrganizationRow> = {}): OrganizationRow {
  const now = new Date();
  return {
    documentId: TEST_ORG_ID,
    name: 'Test Organization',
    mapLongitude: 7.44297,
    mapLatitude: 46.94635,
    mapZoomLevel: 16,
    defaultLocale: 'de-CH',
    url: null,
    logoId: null,
    journalEntryTemplate: null,
    settings: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createOperationFixture(overrides: Partial<OperationRow> = {}): OperationRow {
  const now = new Date();
  return {
    documentId: TEST_OP_ID,
    name: 'Test Operation',
    description: 'Test Operation Description',
    organizationId: TEST_ORG_ID,
    mapState: { version: 1, drawElements: {} } as unknown as ZsMapState,
    changesets: {},
    changesetSigns: {},
    signingKeyIds: [],
    eventStates: [],
    mapLayers: null,
    phase: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createUserFixture(overrides: Partial<UserRow> = {}): UserRow {
  const now = new Date();
  return {
    id: TEST_USER_ID,
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    organizationId: TEST_ORG_ID,
    zsRole: 'organization',
    username: 'testuser',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createSessionFixture(overrides: Partial<SessionRow> = {}): SessionRow {
  const now = new Date();
  return {
    id: TEST_SESSION_ID,
    expiresAt: new Date(Date.now() + 3600_000),
    token: 'test-session-token',
    createdAt: now,
    updatedAt: now,
    ipAddress: '127.0.0.1',
    userAgent: 'vitest-test-agent',
    userId: TEST_USER_ID,
    operationId: null,
    organizationId: TEST_ORG_ID,
    permission: null,
    ...overrides,
  };
}

export function createMapLayerFixture(overrides: Partial<MapLayerRow> = {}): MapLayerRow {
  const now = new Date();
  return {
    documentId: TEST_LAYER_ID,
    label: 'Test Layer',
    serverLayerName: 'test-layer',
    type: 'wms',
    wmsSourceId: null,
    customSource: null,
    mediaSourceId: null,
    options: {},
    public: true,
    organizationId: TEST_ORG_ID,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createMapSnapshotFixture(overrides: Partial<MapSnapshotRow> = {}): MapSnapshotRow {
  const now = new Date();
  return {
    documentId: TEST_SNAPSHOT_ID,
    operationId: TEST_OP_ID,
    mapState: { version: 1, drawElements: {} } as unknown as ZsMapState,
    changesetIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createAccessFixture(overrides: Partial<AccessRow> = {}): AccessRow {
  const now = new Date();
  return {
    documentId: TEST_ACCESS_ID,
    accessToken: '123456',
    type: 'read',
    name: 'Test Access',
    active: true,
    expiresOn: new Date(Date.now() + 86400_000),
    operationId: TEST_OP_ID,
    organizationId: TEST_ORG_ID,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createFileFixture(overrides: Partial<FileRow> = {}): FileRow {
  const now = new Date();
  return {
    documentId: TEST_FILE_ID,
    name: 'test-file.png',
    alternativeText: null,
    caption: null,
    width: 100,
    height: 100,
    formats: null,
    hash: 'hash123',
    ext: '.png',
    mime: 'image/png',
    size: 1024,
    url: '/uploads/test-file.png',
    previewUrl: null,
    provider: 'local',
    providerMetadata: null,
    folderPath: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createJournalEntryFixture(overrides: Partial<JournalEntryRow> = {}): JournalEntryRow {
  const now = new Date();
  return {
    documentId: TEST_JOURNAL_ID,
    operationId: TEST_OP_ID,
    organizationId: TEST_ORG_ID,
    messageNumber: 1,
    sender: 'Unit 1',
    creator: 'Dispatcher',
    communicationType: 'Radio',
    communicationDetails: null,
    messageSubject: 'Incident reported',
    messageContent: 'Details of the incident',
    visumMessage: 'OK',
    isKeyMessage: false,
    dateMessage: now,
    visumTriage: null,
    dateTriage: null,
    decision: null,
    dateDecision: null,
    dateDecisionDelivered: null,
    visumDecider: null,
    decisionReceiver: null,
    decisionSender: null,
    entryStatus: 'triage',
    department: 'operations',
    isDrawnOnMap: false,
    isDrawingOnMap: false,
    wrongContentInfo: null,
    wrongTriageInfo: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createChangesetFixture(overrides: Partial<IZsChangeset> = {}): IZsChangeset {
  return {
    id: 'changeset-test-id-1',
    userId: TEST_USER_ID,
    userName: 'Test User',
    organizationId: TEST_ORG_ID,
    operationId: TEST_OP_ID,
    timestamp: new Date().toISOString(),
    patches: [],
    ...overrides,
  };
}
