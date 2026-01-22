import { IZsChangeset, IZsChangesetExport, IZSMapOperationMapLayers, ZsMapState } from '@zskarte/types';
import { JournalEntry } from 'src/app/journal/journal.types';

export enum OperationExportFileVersion {
  V1 = 'V1',
  V2 = 'V2',
}

// If you adjust this file you need to adjust the import as well
export interface OperationExportFile {
  name: string;
  description: string;
  version: OperationExportFileVersion;
  mapState: ZsMapState;
  changesets: Record<string, IZsChangeset>;
  outgoingChangesets?: IZsChangesetExport[];
  mapLayers?: IZSMapOperationMapLayers;
  eventStates: number[];
  journal: JournalEntry[];
}
