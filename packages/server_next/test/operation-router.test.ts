import type { TRPCError } from '@trpc/server';
import type { IZsChangeset, ZsMapState } from '@zskarte/types';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../src/db/client.js';
import { addToCache, getOperationCache, resetCacheForTesting } from '../src/modules/operation/cache.js';
import { operationRouter } from '../src/modules/operation/router.js';
import type { OperationRow } from '../src/modules/operation/schema.js';
import { initializeSigningKeys } from '../src/modules/signing-key/service.js';
import type { AuthSession } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import {
  TEST_OP_ID,
  TEST_OP_ID_2,
  TEST_ORG_ID,
  TEST_ORG_ID_2,
  createMockDb,
  createSilentLogger,
  createTestContext,
  createTestSession,
} from './helpers/index.js';

const ORG_A = TEST_ORG_ID;
const ORG_B = TEST_ORG_ID_2;
const OP_1 = TEST_OP_ID;
const OP_2 = TEST_OP_ID_2;

const createCaller = async (db: Database, session: AuthSession | null) =>
  createCallerFactory(operationRouter)(
    await createTestContext({
      db,
      authSession: session,
      requestIp: '127.0.0.1',
      requestPath: '/trpc/operation',
      logger: createSilentLogger(),
    }),
  );

const sampleOperationRow = (overrides: Partial<OperationRow> = {}): OperationRow => ({
  documentId: OP_1,
  name: 'Test Operation',
  description: 'Test description',
  organizationId: ORG_A,
  phase: 'active',
  eventStates: [1, 2],
  mapState: {
    version: 2,
    layers: {},
    drawElements: {},
  } as unknown as ZsMapState,
  changesets: {},
  changesetSigns: {},
  signingKeyIds: [],
  mapLayers: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('operationRouter', () => {
  beforeEach(async () => {
    resetCacheForTesting();
    const { db } = createMockDb({ selects: [[]], returning: [[]] });
    await initializeSigningKeys({
      db,
      logger: createSilentLogger(),
    });
  });

  describe('overview', () => {
    it('returns operation overview list for the organization', async () => {
      const { db } = createMockDb({
        selects: [
          [
            {
              documentId: OP_1,
              name: 'Op 1',
              description: 'Desc 1',
              phase: 'active',
              eventStates: [1],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        ],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const res = await caller.overview();
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Op 1');
    });

    it('rejects unauthenticated caller', async () => {
      const { db } = createMockDb();
      const caller = await createCaller(db, null);
      await expect(caller.overview()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('byId', () => {
    it('returns operation merged with live cache', async () => {
      const baseRow = sampleOperationRow();
      const cache = addToCache(baseRow);
      cache.mapState = {
        version: 2,
        layers: {},
        drawElements: {
          el1: { id: 'el1', type: 'symbol', coordinates: [0, 0] } as any,
        },
      } as any;

      const { db } = createMockDb({
        selects: [[baseRow]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.byId({ documentId: OP_1 });

      expect(result.documentId).toBe(OP_1);
      expect(result.mapState).toEqual(cache.mapState);
    });

    it('rejects foreign operation with FORBIDDEN', async () => {
      const { db } = createMockDb({ selects: [[]] });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      await expect(caller.byId({ documentId: OP_2 })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('create', () => {
    it('inserts operation and populates in-memory cache', async () => {
      const createdRow = sampleOperationRow({ documentId: OP_1, name: 'New Op' });
      const { db, captured } = createMockDb({
        returning: [[createdRow]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.create({
        name: 'New Op',
        description: 'New Desc',
      });

      expect(result.documentId).toBe(OP_1);
      expect(captured.inserted[0]).toMatchObject({
        name: 'New Op',
        organizationId: ORG_A,
      });
      expect(getOperationCache(OP_1)).toBeDefined();
    });

    it('rejects forcing documentId on create', async () => {
      const { db } = createMockDb();
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      await expect(
        caller.create({
          documentId: OP_1,
          name: 'Forced Op',
        } as any),
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('archive and unarchive', () => {
    it('archives operation and evicts from cache', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
        returning: [[row]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.archive({ operationId: OP_1 });

      expect(result.success).toBe(true);
      expect(getOperationCache(OP_1)).toBeUndefined();
    });

    it('unarchives operation and restores cache', async () => {
      const row = sampleOperationRow({ phase: 'active' });
      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'archived' }], [row]],
        returning: [[row]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.unarchive({ operationId: OP_1 });

      expect(result.success).toBe(true);
      expect(getOperationCache(OP_1)).toBeDefined();
    });

    it('shadowDeletes operation and evicts from cache', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
        returning: [[row]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.shadowDelete({ operationId: OP_1 });

      expect(result.success).toBe(true);
      expect(getOperationCache(OP_1)).toBeUndefined();
    });
  });

  describe('updateMeta and updateMapLayers', () => {
    it('updates operation metadata and updates cache', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const { db, captured } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
        returning: [[row]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.updateMeta({
        operationId: OP_1,
        data: { name: 'Updated Name', description: 'Updated Desc', eventStates: [3, 4] },
      });

      expect(result.success).toBe(true);
      expect(captured.updated[0]).toMatchObject({
        name: 'Updated Name',
        description: 'Updated Desc',
        eventStates: [3, 4],
      });
      const cache = getOperationCache(OP_1)!;
      expect(cache.operation.name).toBe('Updated Name');
      expect(cache.operation.description).toBe('Updated Desc');
      expect(cache.operation.eventStates).toEqual([3, 4]);
    });

    it('updates operation mapLayers and updates cache', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const mapLayers = { layer1: { opacity: 0.8 } } as any;
      const { db, captured } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
        returning: [[row]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const result = await caller.updateMapLayers({
        operationId: OP_1,
        mapLayers,
      });

      expect(result.success).toBe(true);
      expect(captured.updated[0]).toMatchObject({
        mapLayers,
      });
      const cache = getOperationCache(OP_1)!;
      expect(cache.operation.mapLayers).toEqual(mapLayers);
    });
  });

  describe('submitChangeset', () => {
    it('applies patches, verifies inverse, signs and stores changeset in cache', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const changeset: IZsChangeset = {
        id: 'cs-1',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'Test user',
        timestamp: Date.now(),
        sequence: 1,
        baseChangesetId: undefined,
        baseChangesetSequence: undefined,
        patches: [
          {
            op: 'add',
            path: ['drawElements', 'elem1'],
            value: { id: 'elem1', type: 'symbol', coordinates: [10, 20] },
          },
        ],
        inversePatches: [
          {
            op: 'remove',
            path: ['drawElements', 'elem1'],
          },
        ],
      } as any;

      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));
      const res = await caller.submitChangeset({
        operationId: OP_1,
        identifier: 'client-1',
        changeset,
      });

      expect(res.success).toBe(true);
      expect(res.data?.sign).toBeDefined();
      expect(res.data?.serverId).toBeDefined();
      expect(res.data?.signKeyId).toBeDefined();

      const cache = getOperationCache(OP_1)!;
      expect(cache.changesets['cs-1']).toBeDefined();
      expect(cache.changesetSigns['cs-1']).toBe(res.data?.sign);
      expect(cache.mapState.drawElements?.['elem1']).toBeDefined();
    });

    it('returns alreadySubmitted for identical duplicate submit', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const changeset: IZsChangeset = {
        id: 'cs-dup',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'Test user',
        timestamp: Date.now(),
        sequence: 1,
        patches: [
          {
            op: 'add',
            path: ['drawElements', 'elem1'],
            value: { id: 'elem1', type: 'symbol' },
          },
        ],
        inversePatches: [
          {
            op: 'remove',
            path: ['drawElements', 'elem1'],
          },
        ],
      } as any;

      const { db } = createMockDb({
        selects: [
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
        ],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));

      const first = await caller.submitChangeset({
        operationId: OP_1,
        identifier: 'client-1',
        changeset,
      });
      expect(first.success).toBe(true);

      const second = await caller.submitChangeset({
        operationId: OP_1,
        identifier: 'client-1',
        changeset,
      });
      expect(second.success).toBe(true);
      expect(second.alreadySubmitted).toBe(true);
    });

    it('rejects re-submit with different content for same changeset id', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const changeset1: IZsChangeset = {
        id: 'cs-conflict',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'Test user',
        timestamp: Date.now(),
        sequence: 1,
        patches: [
          {
            op: 'add',
            path: ['drawElements', 'elem1'],
            value: { id: 'elem1', type: 'symbol' },
          },
        ],
        inversePatches: [
          {
            op: 'remove',
            path: ['drawElements', 'elem1'],
          },
        ],
      } as any;

      const changeset2: IZsChangeset = {
        ...changeset1,
        patches: [
          {
            op: 'add',
            path: ['drawElements', 'elem2'],
            value: { id: 'elem2', type: 'symbol' },
          },
        ],
      } as any;

      const { db } = createMockDb({
        selects: [
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
        ],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));

      await caller.submitChangeset({
        operationId: OP_1,
        identifier: 'client-1',
        changeset: changeset1,
      });

      await expect(
        caller.submitChangeset({
          operationId: OP_1,
          identifier: 'client-1',
          changeset: changeset2,
        }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 're-submit changeset with other content',
      });
    });

    it('rejects non-reversible inverse patches', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const changeset: IZsChangeset = {
        id: 'cs-bad-inverse',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'Test user',
        timestamp: Date.now(),
        sequence: 1,
        patches: [
          {
            op: 'add',
            path: ['drawElements', 'elem1'],
            value: { id: 'elem1', type: 'symbol' },
          },
        ],
        inversePatches: [
          // bad inverse patch: doesn't revert elem1
          {
            op: 'replace',
            path: ['version'],
            value: 999,
          },
        ],
      } as any;

      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));

      await expect(
        caller.submitChangeset({
          operationId: OP_1,
          identifier: 'client-1',
          changeset,
        }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'inverse patches do not reset cleanly',
      });
    });

    it('rejects changeset submission on archived operation', async () => {
      const { db } = createMockDb({
        selects: [[{ documentId: OP_1, organizationId: ORG_A, phase: 'archived' }]],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));

      const changeset: IZsChangeset = {
        id: 'cs-archived',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'Test user',
        timestamp: Date.now(),
        sequence: 1,
        patches: [],
        inversePatches: [],
      } as any;

      await expect(
        caller.submitChangeset({
          operationId: OP_1,
          identifier: 'client-1',
          changeset,
        }),
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'The operation is archived, no update allowed.',
      });
    });

    it('serializes concurrent changeset submissions', async () => {
      const row = sampleOperationRow();
      addToCache(row);

      const changesetA: IZsChangeset = {
        id: 'cs-concurrent-1',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-1',
        name: 'User 1',
        timestamp: Date.now(),
        sequence: 1,
        patches: [{ op: 'add', path: ['drawElements', 'e1'], value: { id: 'e1' } }],
        inversePatches: [{ op: 'remove', path: ['drawElements', 'e1'] }],
      } as any;

      const changesetB: IZsChangeset = {
        id: 'cs-concurrent-2',
        operationId: OP_1,
        organisationId: ORG_A,
        userId: 'user-2',
        name: 'User 2',
        timestamp: Date.now(),
        sequence: 2,
        patches: [{ op: 'add', path: ['drawElements', 'e2'], value: { id: 'e2' } }],
        inversePatches: [{ op: 'remove', path: ['drawElements', 'e2'] }],
      } as any;

      const { db } = createMockDb({
        selects: [
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
          [{ documentId: OP_1, organizationId: ORG_A, phase: 'active' }],
        ],
      });
      const caller = await createCaller(db, createTestSession('organization', ORG_A));

      const [resA, resB] = await Promise.all([
        caller.submitChangeset({ operationId: OP_1, identifier: 'c1', changeset: changesetA }),
        caller.submitChangeset({ operationId: OP_1, identifier: 'c2', changeset: changesetB }),
      ]);

      expect(resA.success).toBe(true);
      expect(resB.success).toBe(true);

      const cache = getOperationCache(OP_1)!;
      expect(cache.mapState.drawElements?.['e1']).toBeDefined();
      expect(cache.mapState.drawElements?.['e2']).toBeDefined();
    });
  });
});
