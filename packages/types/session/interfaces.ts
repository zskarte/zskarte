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
  organization?: IZsMapOrganization | null;
  organizationLogo?: string;
  label?: string;
  locale: Locale;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultZoomLevel?: number;
  workLocal?: boolean;
}

export interface IZso {
  name: string;
  identifier: string;
  logoSrc?: string;
  logoSrcSet?: string;
}
