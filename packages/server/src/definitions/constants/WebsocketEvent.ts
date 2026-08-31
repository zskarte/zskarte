export const WebsocketEvent = {
  STATE_CHANGESET: 'state:changeset',
  STATE_JOURNAL: 'state:journal',
  CONNECTIONS: 'state:connections',
} as const;
export type WebsocketEvent = (typeof WebsocketEvent)[keyof typeof WebsocketEvent];
