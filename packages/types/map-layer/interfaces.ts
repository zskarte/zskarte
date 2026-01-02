import { Extent } from 'ol/extent';

export interface DocumentApi {
  documentId: string;
  id?: number; //deprecated
}

export interface RelationUpdateApi {
  connect: DocumentApi[] | string[] | number[];
}

export function objectToRelationUpdateApi(obj: DocumentApi, forceId = false) {
  //deprecated fallback logic
  //for connecting Media to any document currently (5.33.0) still id is required...
  if (forceId || (!obj.documentId && obj.id)) {
    //V4 variant: return obj.id;
    return { connect: [obj.id ?? -1] };
  }
  return { connect: [obj.documentId] };
  //longhand: return { connect: [{ documentId: obj.documentId }] };
}

interface PresistedSettings extends Partial<DocumentApi> {
  owner: boolean;
  public: boolean;
}

export interface WmsSource extends PresistedSettings {
  url: string;
  label: string;
  type: 'wmts' | 'wms';
  attribution?: [string, string][];
}

//use the partial part to prevent need to use type guards in template
export interface MapSource extends Partial<WmsSource> {
  url: string;
}

export interface WmsSourceApi extends WmsSource {
  organization?: DocumentApi;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SelectedMapLayerSettings {
  opacity: number;
  hidden: boolean;
  deleted?: boolean;
  zIndex: number;
}

interface MapLayerGeneralSettings {
  label: string;
  serverLayerName: string | null;
  type: string;
}

export interface GenericOptionalMapLayerOptions {
  MinScaleDenominator?: number;
  MaxScaleDenominator?: number;
  attribution?: [string, string][];
}

export interface MapLayer extends PresistedSettings, SelectedMapLayerSettings, MapLayerGeneralSettings {
  source?: MapSource | WmsSource;
  fullId: string;
  offlineAvailable?: boolean;
}

export interface WMSMapLayer extends MapLayer, GenericOptionalMapLayerOptions {
  serverLayerName: string;
  noneTiled?: boolean;
  subLayersNames?: string[];
  hiddenSubLayers?: string[];
  splitIntoSubLayers?: boolean;
  originalServerLayerName?: string;
  tileSize?: number;
  tileFormat?: string;
}

export interface GeoJSONMapLayer extends MapLayer, GenericOptionalMapLayerOptions {
  styleSourceType: 'url' | 'text';
  styleUrl?: string;
  styleText?: string;
  styleFormat: 'mapbox' | 'olFlat';
  styleSourceName?: string;
  searchable?: boolean;
  searchRegExPatterns?: string[][];
  searchResultGroupingFilterFields?: string[];
  searchResultLabelMask?: string;
  searchMaxResultCount?: number;
}

export interface CsvMapLayer extends GeoJSONMapLayer {
  delimiter: string;
  fieldX: string;
  fieldY: string;
  dataProjection: string;
  filterRegExPattern?: string[][];
  extent?: Extent;
}

export interface GeoAdminMapLayer extends MapLayer {
  serverLayerName: string;
  attribution: string;
  attributionUrl: string;
  background: boolean;
  chargeable: boolean;
  format: string;
  hasLegend: boolean;
  highlightable: boolean;
  searchable: boolean;
  timeEnabled: boolean;
  timestamps: string[];
  tooltip: boolean;
  topics: string;
  wmsLayers: string;
  wmsUrl?: string;
  subLayersIds?: string[];
  maxResolution?: number;
  minResolution?: number;
}

export interface GeoAdminMapLayers {
  [key: string]: GeoAdminMapLayer;
}
export type MapLayerAllFields = Omit<GeoAdminMapLayer & WMSMapLayer & CsvMapLayer, 'serverLayerName'> &
  MapLayerGeneralSettings;

export interface MapLayerOptionsApi extends Omit<Partial<MapLayerAllFields>, keyof MapLayer> {
  opacity?: number;
}

export interface Media extends DocumentApi {
  //for connecting Media to any document currently (5.33.0) still id is required...
  id: number;
  url: string;
  name?: string;
}

export interface MapLayerSourceApi {
  wms_source?: WmsSource | RelationUpdateApi;
  media_source?: Media | RelationUpdateApi;
  custom_source?: string;
}

export interface MapLayerApi extends Partial<PresistedSettings>, MapLayerGeneralSettings, MapLayerSourceApi {
  options: MapLayerOptionsApi;
  organization?: DocumentApi;
  public: boolean;
}
