import { Patch } from 'immer';

export interface PatchExtended extends Patch {
  timestamp: Date;
  identifier: string;
}
