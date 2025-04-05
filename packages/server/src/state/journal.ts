import { OperationCache } from '../definitions';
import { operationCaches } from './operation';
import { broadcastJournal } from './socketio';

const updateJournal = (identifier: string, operationId: string, data: any) => {
  const operationCache: OperationCache = operationCaches[operationId];
  if (!operationCache) return;

  broadcastJournal(operationCache, identifier, data);
};

export { updateJournal };
