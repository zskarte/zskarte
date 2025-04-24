export const WebsocketEvent = {
  STATE_PATCHES: 'state:patches',
  STATE_JOURNAL: 'state:journal',
  CONNECTIONS: 'state:connections',
} as const;
export type WebsocketEvent = (typeof WebsocketEvent)[keyof typeof WebsocketEvent];
