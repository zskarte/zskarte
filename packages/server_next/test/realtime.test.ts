import type { IZsChangeset } from '@zskarte/types';
import { afterEach, describe, expect, it } from 'vitest';
import { closeOperationChannel, publishChangeset, resetEventBusForTesting, subscribeToOperation } from '../src/realtime/event-bus.js';
import {
  listPresence,
  registerPresence,
  resetPresenceForTesting,
  unregisterPresence,
  updateCurrentLocation,
} from '../src/realtime/presence.js';
import type { AuthSession } from '../src/trpc/context.js';

const OPERATION_ID = '11111111-1111-4111-8111-111111111111';

const authSession = (): AuthSession => ({
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    username: 'test',
    organizationId: 'ca548097-df0f-4862-8bd3-b104bf537bd8',
    zsRole: 'organization',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'session-1',
    token: 'secret',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    ipAddress: null,
    userAgent: null,
    operationId: null,
    organizationId: 'ca548097-df0f-4862-8bd3-b104bf537bd8',
    permission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

afterEach(() => {
  resetPresenceForTesting();
  resetEventBusForTesting();
});

describe('realtime event bus', () => {
  it('fans changesets out with the origin identifier', async () => {
    const abortController = new AbortController();
    const events = subscribeToOperation(OPERATION_ID, abortController.signal);
    const changeset = { id: 'change-1', operationId: OPERATION_ID } as IZsChangeset;
    const next = events[Symbol.asyncIterator]().next();

    publishChangeset(OPERATION_ID, 'client-a', changeset, 'signature');

    await expect(next).resolves.toEqual({
      done: false,
      value: [{ type: 'changeset', identifier: 'client-a', changeset, sign: 'signature' }],
    });
    abortController.abort();
  });

  it('notifies subscribers when an operation channel closes', async () => {
    const events = subscribeToOperation(OPERATION_ID);
    const next = events[Symbol.asyncIterator]().next();
    closeOperationChannel(OPERATION_ID);
    await expect(next).resolves.toEqual({ done: false, value: [{ type: 'closed' }] });
  });
});

describe('presence', () => {
  it('broadcasts the initial presence when a client registers', async () => {
    const abortController = new AbortController();
    const events = subscribeToOperation(OPERATION_ID, abortController.signal);
    const next = events.next();

    registerPresence(OPERATION_ID, 'client-a', 'Alice', authSession().user);

    await expect(next).resolves.toMatchObject({
      done: false,
      value: [
        {
          type: 'connections',
          connections: [{ identifier: 'client-a', label: 'Alice' }],
        },
      ],
    });
    abortController.abort();
  });

  it('sanitizes users and broadcasts location updates', () => {
    const registrationId = registerPresence(OPERATION_ID, 'client-a', 'Alice', authSession().user);

    expect(listPresence(OPERATION_ID)).toEqual([
      {
        identifier: 'client-a',
        label: 'Alice',
        user: { username: 'test', email: 'test@example.com', confirmed: true, blocked: false },
      },
    ]);
    expect(updateCurrentLocation(OPERATION_ID, 'client-a', { long: 8.5, lat: 47.3 })).toBe(true);
    expect(listPresence(OPERATION_ID)[0]?.currentLocation).toEqual({ long: 8.5, lat: 47.3 });

    unregisterPresence(OPERATION_ID, 'client-a', registrationId);
    expect(listPresence(OPERATION_ID)).toEqual([]);
  });

  it('does not let delayed cleanup remove a replacement registration', () => {
    const oldRegistration = registerPresence(OPERATION_ID, 'client-a', 'Old', authSession().user);
    const newRegistration = registerPresence(OPERATION_ID, 'client-a', 'New', authSession().user);

    unregisterPresence(OPERATION_ID, 'client-a', oldRegistration);
    expect(listPresence(OPERATION_ID)).toHaveLength(1);
    expect(listPresence(OPERATION_ID)[0]?.label).toBe('New');

    unregisterPresence(OPERATION_ID, 'client-a', newRegistration);
    expect(listPresence(OPERATION_ID)).toEqual([]);
  });
});
