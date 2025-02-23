import { Socket } from 'socket.io';
import { User } from './collection-types';

export interface Connection {
  user: User;
  socket: Socket;
  identifier: string;
  label: string;
  currentLocation?: { long: number; lat: number };
}
