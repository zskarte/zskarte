import type { ZsMapState } from '@zskarte/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/db/client.js';
import { createMapStateSnapshots, purgeExpiredAccesses, purgeGuestOperations } from '../src/jobs/scheduler.js';
import * as accessRepository from '../src/modules/access/repository.js';
import { addToCache, getOperationCache, resetCacheForTesting } from '../src/modules/operation/cache.js';
import type { OperationRow } from '../src/modules/operation/schema.js';

const OPERATION_ID = '11111111-1111-4111-8111-111111111111';
const ORGANIZATION_ID = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn() } as any;

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
    const inserted: Record<string, unknown>[] = [];
    const query: any = {
      from: () => query,
      where: () => query,
      orderBy: () => query,
      limit: async () => [{ mapState: { changesetIds: ['initial'] } }],
    };
    const db = {
      select: () => query,
      insert: () => ({
        values: async (value: Record<string, unknown>) => {
          inserted.push(value);
        },
      }),
    } as unknown as Database;

    await createMapStateSnapshots({ db, logger });

    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ operationId: OPERATION_ID, changesetIds: ['change-1'] });
    expect(inserted[0]?.mapState).toBe(getOperationCache(OPERATION_ID)?.mapState);
  });

  it('skips an unchanged operation', async () => {
    addToCache(operation(['initial']));
    const insert = vi.fn();
    const query: any = {
      from: () => query,
      where: () => query,
      orderBy: () => query,
      limit: async () => [{ mapState: { changesetIds: ['initial'] } }],
    };
    const db = { select: () => query, insert } as unknown as Database;

    await createMapStateSnapshots({ db, logger });

    expect(insert).not.toHaveBeenCalled();
  });
});

describe('purgeGuestOperations', () => {
  it('evicts guest caches and deletes operation sessions before operations', async () => {
    addToCache(operation([]));
    let selectCall = 0;
    const query: any = {
      from: () => query,
      where: () => {
        selectCall += 1;
        return selectCall === 1 ? query : Promise.resolve([{ documentId: OPERATION_ID }]);
      },
      limit: async () => [{ organizationId: ORGANIZATION_ID }],
    };
    const deleted: unknown[] = [];
    const db = {
      select: () => query,
      delete: (table: unknown) => ({
        where: async () => {
          deleted.push(table);
        },
      }),
    } as unknown as Database;

    await purgeGuestOperations({ db, logger });

    expect(getOperationCache(OPERATION_ID)).toBeUndefined();
    expect(deleted).toHaveLength(2);
    expect(logger.info).toHaveBeenCalledWith({ count: 1 }, 'guest operations purged');
  });
});

describe('purgeExpiredAccesses', () => {
  it('logs the number of removed expired tokens without token values', async () => {
    vi.mocked(accessRepository.deleteExpired).mockResolvedValue(2);

    await purgeExpiredAccesses({ db: {} as Database, logger });

    expect(logger.info).toHaveBeenCalledWith({ count: 2 }, 'expired access tokens purged');
  });
});
