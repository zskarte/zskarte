export const ROLES = ['admin', 'organization', 'guest', 'operationwrite', 'operationread', 'public'] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

export const roleForPermission = (permission: 'read' | 'write' | 'all'): Role =>
  permission === 'read' ? 'operationread' : 'operationwrite';
