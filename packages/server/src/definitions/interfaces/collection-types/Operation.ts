import { Organization, StrapiObject } from '.';
import { PatchExtended } from '../PatchExtended';
import { MapSnapshot } from './MapSnapshot';

export interface Operation extends StrapiObject {
  name: string;
  description: string;
  status: string;
  mapState: object;
  organization: Organization;
  patches: PatchExtended[];
  mapSnapshots: MapSnapshot[];
  eventStates: object;
}
