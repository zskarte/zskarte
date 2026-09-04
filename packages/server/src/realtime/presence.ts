import { randomUUID } from 'node:crypto';
import type { AuthSession } from '../trpc/context.js';
import { publishConnections } from './event-bus.js';
import type { RealtimeConnection } from './types.js';

interface PresenceEntry extends RealtimeConnection {
  registrationId: string;
}

const presenceByOperation = new Map<string, Map<string, PresenceEntry>>();

const broadcast = (operationId: string): void => {
  publishConnections(operationId, listPresence(operationId));
};

export const listPresence = (operationId: string): RealtimeConnection[] => {
  const entries = presenceByOperation.get(operationId);
  if (!entries) return [];
  return Array.from(entries.values(), ({ registrationId: _registrationId, ...connection }) => connection);
};

export const registerPresence = (
  operationId: string,
  identifier: string,
  label: string,
  user: AuthSession['user'],
): string => {
  let entries = presenceByOperation.get(operationId);
  if (!entries) {
    entries = new Map();
    presenceByOperation.set(operationId, entries);
  }

  const registrationId = randomUUID();
  entries.set(identifier, {
    registrationId,
    identifier,
    label,
    user: {
      username: user.username ?? user.name,
      email: user.email,
      confirmed: user.emailVerified,
      blocked: false,
    },
  });
  broadcast(operationId);
  return registrationId;
};

export const unregisterPresence = (operationId: string, identifier: string, registrationId: string): void => {
  const entries = presenceByOperation.get(operationId);
  if (entries?.get(identifier)?.registrationId !== registrationId) return;
  entries.delete(identifier);
  if (entries.size === 0) presenceByOperation.delete(operationId);
  broadcast(operationId);
};

export const updateCurrentLocation = (
  operationId: string,
  identifier: string,
  location?: { long: number; lat: number },
): boolean => {
  const entry = presenceByOperation.get(operationId)?.get(identifier);
  if (!entry) return false;
  entry.currentLocation = location;
  broadcast(operationId);
  return true;
};

export const clearOperationPresence = (operationId: string): void => {
  presenceByOperation.delete(operationId);
};

export const resetPresenceForTesting = (): void => {
  presenceByOperation.clear();
};
