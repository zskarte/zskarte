import { OperationPhase } from '../../../definitions';
import { Organization, StrapiObject } from '.';
import { MapSnapshot } from './MapSnapshot';
import { IZsChangeset, ZsMapState } from '@zskarte/types';

export interface Operation extends StrapiObject {
  name: string;
  description: string;
  mapState: object | ZsMapState;
  changesets: object | Record<string, IZsChangeset>;
  changesetSigns: object | Record<string, string>;
  signingKeyIds: object | Array<string>;
  organization: Organization;
  mapSnapshots?: MapSnapshot[];
  eventStates: object;
  phase: OperationPhase;
}
