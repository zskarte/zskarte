export interface WmsSource {
  url: string;
  label: string;
  type: 'wmts' | 'wms';
  attribution?: [string, string][];
}

//use the partial part to prevent need to use type guards in template
export interface MapSource extends Partial<WmsSource> {
  url: string;
}

interface SelectedMapLayerSettings {
  opacity: number;
  hidden: boolean;
  deleted?: boolean;
  zIndex: number;
}

interface MapLayerGeneralSettings {
  label: string;
  serverLayerName: string;
  type: string;
}

export interface GenericOptionalMapLayerOptions {
  MinScaleDenominator?: number;
  MaxScaleDenominator?: number;
  attribution?: [string, string][];
}

export interface MapLayer extends SelectedMapLayerSettings, MapLayerGeneralSettings {
  source?: MapSource | WmsSource;
  fullId: string;
}

export interface WMSMapLayer extends MapLayer, GenericOptionalMapLayerOptions {
  noneTiled?: boolean;
  subLayersNames?: string[];
  hiddenSubLayers?: string[];
  splitIntoSubLayers?: boolean;
  originalServerLayerName?: string;
  tileSize?: number;
  tileFormat?: string;
}

export interface GeoAdminMapLayer extends MapLayer {
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
