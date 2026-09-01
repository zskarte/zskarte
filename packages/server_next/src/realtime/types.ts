import type { IZsChangeset } from '@zskarte/types';

export interface RealtimeUser {
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

export interface RealtimeConnection {
  user: RealtimeUser;
  identifier: string;
  label: string;
  currentLocation?: { long: number; lat: number };
}

export type RealtimeEvent =
  | { type: 'changeset'; identifier: string; changeset: IZsChangeset; sign: string }
  | { type: 'connections'; connections: RealtimeConnection[] }
  | { type: 'closed' };
