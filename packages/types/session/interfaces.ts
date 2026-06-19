import { Locale } from '../i18n/interfaces';
import { IZsMapOperation, IZsMapOrganization } from '../operation/interfaces';

export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  ALL = 'all',
}

export enum AccessTokenType {
  LONG = 'long',
  SHORT = 'short',
}
export interface IZsAccess {
  id: string;
  documentId: string;
  accessToken: string;
  type: PermissionType;
}

export interface IZsMapSession {
  id: string;
  permission?: PermissionType;
  operation?: IZsMapOperation;
  organization?: IZsMapOrganization;
  organizationLogo?: string;
  label?: string;
  jwt?: string;
  locale: Locale;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultZoomLevel?: number;
  workLocal?: boolean;
  /**
   * Marks a session that must not be persisted to the local database. Used for embedded
   * share-token logins, which are scoped to a single operation and would otherwise overwrite
   * the user's real (full-access) session, hiding all other operations afterwards.
   */
  ephemeral?: boolean;
}

export interface IZso {
  name: string;
  identifier: string;
  logoSrc?: string;
  logoSrcSet?: string;
}

export interface IAuthResult {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
  };
}
