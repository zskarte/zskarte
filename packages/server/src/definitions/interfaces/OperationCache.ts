import { IZsChangeset, ZsMapState } from '@zskarte/types';
import { Connection } from '.';
import { Operation, User } from './collection-types';
import { QueueMutex } from '../../utils/queue-mutex';

export interface OperationCache {
  operation: Operation;
  connections: Connection[];
  users: User[];
  changesetEndpointMutex: QueueMutex;
  mapState: ZsMapState;
  changesets: Record<string, IZsChangeset>;
  changed: boolean;
}
