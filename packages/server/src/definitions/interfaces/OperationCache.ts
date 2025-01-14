import { Connection } from '.';
import { Operation, User } from './collection-types';

export interface OperationCache {
  operation: Operation;
  connections: Connection[];
  users: User[];
  mapState: object;
  mapStateChanged: boolean;
}
