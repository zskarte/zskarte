import { Operation, StrapiObject, User } from '.';

export interface Organization extends StrapiObject {
  name: string;
  mapLongitude: number;
  mapLatitude: number;
  mapZoomLevel: number;
  defaultLocale: string;
  url: string;
  logo: any;
  operations: Operation[];
  users: User[];
}
