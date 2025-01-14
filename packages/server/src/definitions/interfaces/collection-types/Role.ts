import { StrapiObject } from '.';

export interface Role extends StrapiObject {
  name: string;
  description: string;
  type: string;
}
