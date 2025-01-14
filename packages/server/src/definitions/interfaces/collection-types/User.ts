import { Organization, Role, StrapiObject } from '.';

export interface User extends StrapiObject {
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  blocked: boolean;
  role: Role;
  organization: Organization;
}
