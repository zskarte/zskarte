import { AccessType } from '../../constants';
import { Operation, Organization, StrapiObject } from '.';

export interface Access extends StrapiObject {
  name?: string;
  accessToken: string;
  operation: Operation;
  organization: Organization;
  type: AccessType;
  active: boolean;
  expiresOn?: Date;
}
