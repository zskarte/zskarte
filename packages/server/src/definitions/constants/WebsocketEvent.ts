export const WebsocketEvent = {
  STATE_PATCHES: 'state:patches',
  CONNECTIONS: 'state:connections',
} as const;
export type WebsocketEvent = (typeof WebsocketEvent)[keyof typeof WebsocketEvent];
