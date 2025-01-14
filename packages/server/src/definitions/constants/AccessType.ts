export const AccessTypes = {
  READ: 'read',
  WRITE: 'write',
  ALL: 'all',
} as const;
export type AccessType = (typeof AccessTypes)[keyof typeof AccessTypes];
