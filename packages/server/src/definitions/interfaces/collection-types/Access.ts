import { AccessType } from '../../constants';
import { Operation, StrapiObject } from '.';

export interface Access extends StrapiObject {
  name?: string;
  accessToken: string;
  operation: Operation;
  type: AccessType;
  active: boolean;
  expiresOn?: Date;
}
