export const AccessControlTypes = {
  CREATE: 'create',
  UPDATE_BY_ID: 'updateById',
  DELETE_BY_ID: 'deleteById',
  BY_ID: 'byId',
  LIST: 'list',
  NO_CHECK: 'noCheck',
} as const;
export type AccessControlType = (typeof AccessControlTypes)[keyof typeof AccessControlTypes];
