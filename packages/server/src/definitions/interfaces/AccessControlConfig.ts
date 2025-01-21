import { Common } from '@strapi/strapi';
import { AccessControlType } from '..';

export interface AccessControlConfig<T extends Common.UID.ContentType> {
  type: T;
  check?: AccessControlType;
  notForShare?: boolean;
}
