import type { ZsMapState } from '@zskarte/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/db/client.js';
import { createMapStateSnapshots, purgeExpiredAccesses, purgeGuestOperations } from '../src/jobs/scheduler.js';
import * as accessRepository from '../src/modules/access/repository.js';
import { addToCache, getOperationCache, resetCacheForTesting } from '../src/modules/operation/cache.js';
import type { OperationRow } from '../src/modules/operation/schema.js';
import { TEST_OP_ID, TEST_ORG_ID, createMockDb, createMockLogger } from './helpers/index.js';

const OPERATION_ID = TEST_OP_ID;
const ORGANIZATION_ID = TEST_ORG_ID;

vi.mock('../src/modules/access/repository.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/modules/access/repository.js')>()),
  deleteExpired: vi.fn(),
}));

const operation = (changesetIds: string[]): OperationRow => ({
  documentId: OPERATION_ID,
  name: 'Operation',
  description: null,
  organizationId: ORGANIZATION_ID,
  mapState: { version: 2, layers: {}, drawElements: {}, changesetIds } as unknown as ZsMapState,
  changesets: {},
  changesetSigns: {},
  signingKeyIds: [],
  eventStates: [],
  mapLayers: null,
  phase: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
});

afterEach(() => {
  resetCacheForTesting();
  vi.clearAllMocks();
});

describe('createMapStateSnapshots', () => {
  it('stores the full state and only changeset ids missing from the previous snapshot', async () => {
    addToCache(operation(['initial', 'change-1']));
    const logger = createMockLogger();
    const { db, captured } = createMockDb({
      selects: [[{ mapState: { changesetIds: ['initial'] } }]],
    });

    await createMapStateSnapshots({ db, logger });

    expect(captured.inserted).toHaveLength(1);
    expect(captured.inserted[0]).toMatchObject({ operationId: OPERATION_ID, changesetIds: ['change-1'] });
    expect((captured.inserted[0] as any)?.mapState).toBe(getOperationCache(OPERATION_ID)?.mapState);
  });

  it('skips an unchanged operation', async () => {
    addToCache(operation(['initial']));
    const logger = createMockLogger();
    const { db, captured } = createMockDb({
      selects: [[{ mapState: { changesetIds: ['initial'] } }]],
    });

    await createMapStateSnapshots({ db, logger });

    expect(captured.inserted).toHaveLength(0);
  });
});

describe('purgeGuestOperations', () => {
  it('evicts guest caches and deletes operation sessions before operations', async () => {
    addToCache(operation([]));
    const logger = createMockLogger();
    const { db, captured } = createMockDb({
      selects: [[{ organizationId: ORGANIZATION_ID }], [{ documentId: OPERATION_ID }]],
    });

    await purgeGuestOperations({ db, logger });

    expect(getOperationCache(OPERATION_ID)).toBeUndefined();
    expect(captured.deleted).toHaveLength(2);
    expect(logger.info).toHaveBeenCalledWith({ count: 1 }, 'guest operations purged');
  });
});

describe('purgeExpiredAccesses', () => {
  it('logs the number of removed expired tokens without token values', async () => {
    vi.mocked(accessRepository.deleteExpired).mockResolvedValue(2);
    const logger = createMockLogger();

    await purgeExpiredAccesses({ db: {} as Database, logger });

    expect(logger.info).toHaveBeenCalledWith({ count: 2 }, 'expired access tokens purged');
  });
});
