import { EventEmitter, on } from 'node:events';
import type { IZsChangeset } from '@zskarte/types';
import type { RealtimeConnection, RealtimeEvent } from './types.js';

const operationEmitters = new Map<string, EventEmitter>();

const getEmitter = (operationId: string): EventEmitter => {
  let emitter = operationEmitters.get(operationId);
  if (!emitter) {
    emitter = new EventEmitter();
    operationEmitters.set(operationId, emitter);
  }
  return emitter;
};

export const subscribeToOperation = (operationId: string, signal?: AbortSignal) => {
  const emitter = getEmitter(operationId);
  // `on()` registers immediately. This matters for presence, which is published
  // between creating the iterator and consuming its first value.
  const events = on(emitter, 'event', signal ? { signal } : undefined);

  return (async function* () {
    try {
      for await (const event of events) yield event;
    } finally {
      if (operationEmitters.get(operationId) === emitter && emitter.listenerCount('event') === 0) {
        operationEmitters.delete(operationId);
      }
    }
  })();
};

export const publishChangeset = (
  operationId: string,
  identifier: string,
  changeset: IZsChangeset,
  sign: string,
): void => {
  getEmitter(operationId).emit('event', { type: 'changeset', identifier, changeset, sign } satisfies RealtimeEvent);
};

export const publishConnections = (operationId: string, connections: RealtimeConnection[]): void => {
  getEmitter(operationId).emit('event', { type: 'connections', connections } satisfies RealtimeEvent);
};

export const closeOperationChannel = (operationId: string): void => {
  const emitter = operationEmitters.get(operationId);
  if (!emitter) return;
  emitter.emit('event', { type: 'closed' } satisfies RealtimeEvent);
  emitter.removeAllListeners();
  operationEmitters.delete(operationId);
};

export const resetEventBusForTesting = (): void => {
  for (const operationId of operationEmitters.keys()) closeOperationChannel(operationId);
};
