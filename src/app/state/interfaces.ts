export enum ZsMapStateSource {
  OPEN_STREET_MAP = 'openStreetMap',
  GEO_ADMIN_SWISS_IMAGE = 'geoAdminSwissImage',
  GEO_ADMIN_PIXEL = 'geoAdminPixel',
  GEO_ADMIN_PIXEL_BW = 'geoAdminPixelBW',
}

export interface IZsMapState {
  id: string;
  name?: string;
  source: ZsMapStateSource;
  layers?: ZsMapLayerState[];
  center: { lng: number; lat: number };
}

export enum ZsMapDisplayMode {
  DRAW = 'draw',
  HISTORY = 'history',
}

export interface IZsMapDisplayState {
  displayMode: ZsMapDisplayMode;
  currentLayer: string;
  visibleLayers: string[];
  // TODO add additional props as filter aso.
}


export type ZsMapLayerState = IZsMapDrawLayerState | IZsMapGeoDataLayerState;

export enum ZsMapLayerStateType {
  DRAW = 'draw',
  GEO_DATA = 'geoData',
}

interface IZsMapBaseLayerState {
  id?: string;
  type: ZsMapLayerStateType;
  name?: string;
}

export interface IZsMapDrawLayerState extends IZsMapBaseLayerState {
  type: ZsMapLayerStateType.DRAW;
  elements: ZsMapDrawElementState[];
}

export interface IZsMapGeoDataLayerState extends IZsMapBaseLayerState {
  type: ZsMapLayerStateType.GEO_DATA;
  // TODO additional props
}

export enum ZsMapDrawElementStateType {
  TEXT = 'text',
  SYMBOL = 'symbol',
  POLYGON = 'polygon',
  LINE = 'line',
  FREEHAND = 'freehand',
}

export type ZsMapDrawElementState = ZsMapTextDrawElementState;

interface IZsMapDrawElementState {
  id: string;
  type: ZsMapDrawElementStateType;
}

export interface ZsMapTextDrawElementState extends IZsMapDrawElementState {
  type: ZsMapDrawElementStateType.TEXT;
}
