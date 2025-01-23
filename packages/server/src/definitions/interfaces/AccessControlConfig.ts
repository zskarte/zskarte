import { UID } from '@strapi/strapi';
import { AccessControlType } from '..';

export interface AccessControlConfig<T extends UID.ContentType> {
  type: T;
  check?: AccessControlType;
  notForShare?: boolean;
}
