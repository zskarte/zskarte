import { Locale } from '../i18n/interfaces';
import { IZsMapOperation, IZsMapOrganization } from '../operation/interfaces';

export const ROLES = ['admin', 'organization', 'guest', 'operationwrite', 'operationread', 'public'] as const;
export type Role = (typeof ROLES)[number];

export type PermissionType = 'read' | 'write' | 'all';
export type AccessTokenType = 'long' | 'short';

export interface IZsAccess {
  documentId: string;
  type: PermissionType;
  expiresOn: Date | null;
}

export interface IZsMapSession {
  id: string;
  permission?: PermissionType;
  operation?: IZsMapOperation;
  organization?: IZsMapOrganization | null;
  organizationLogo?: string;
  label?: string;
  locale: Locale;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultZoomLevel?: number;
  workLocal?: boolean;
  zsRole?: Role;
}

export interface IZso {
  name: string;
  identifier: string;
  logoSrc?: string;
  logoSrcSet?: string;
}

export interface IZsRolePermission {
  role: Role;
  permission: string;
}

export interface IZsRolePermissionToggleInput {
  role: Role | string;
  permission: string;
  enabled: boolean;
}

export interface IZsPermissionMatrix {
  permissions: readonly string[];
  roles: readonly Role[];
  matrix: Record<Role, Record<string, boolean>>;
}
