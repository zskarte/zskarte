import { OperationPhase } from '../../../definitions';
import { Organization, StrapiObject } from '.';
import { MapSnapshot } from './MapSnapshot';

export interface Operation extends StrapiObject {
  name: string;
  description: string;
  status?: string; //Deprecated
  mapState: object;
  organization: Organization;
  mapSnapshots: MapSnapshot[];
  eventStates: object;
  phase: OperationPhase;
}
