import { OperationPhase } from '../../../definitions';
import { Organization, StrapiObject } from '.';
import { MapSnapshot } from './MapSnapshot';
import { IZsChangeset, ZsMapState } from '@zskarte/types';

export interface Operation extends StrapiObject {
  name: string;
  description: string;
  status?: string; //Deprecated
  mapState: object | ZsMapState;
  changesets: object | Record<string, IZsChangeset>;
  organization: Organization;
  mapSnapshots?: MapSnapshot[];
  eventStates: object;
  phase: OperationPhase;
}
