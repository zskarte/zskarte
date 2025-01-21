import { Operation, StrapiObject } from '.';

export interface MapSnapshot extends StrapiObject {
  operation: Operation;
  mapState: object;
}
