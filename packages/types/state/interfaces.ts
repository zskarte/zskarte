import { Coordinate } from 'ol/coordinate';
import { MapLayer, WmsSource } from '../map-layer/interfaces';
import { FillStyle, IconsOffset } from '../sign/interfaces';
import { Feature } from 'ol';
import { PermissionType } from '../session/interfaces';
import { Sort } from '@angular/material/sort';
import { Extent } from 'ol/extent';

export enum ZsMapStateSource {
  OPEN_STREET_MAP = 'openStreetMap',
  GEO_ADMIN_SWISS_IMAGE = 'geoAdminSwissImage',
  GEO_ADMIN_PIXEL = 'geoAdminPixel',
  GEO_ADMIN_PIXEL_BW = 'geoAdminPixelBW',
  LOCAL = 'local',
  NONE = 'noBaseMap',
}

export const zsMapStateSourceToDownloadUrl = {
  [ZsMapStateSource.LOCAL]: 'https://zskarte.blob.core.windows.net/etienne/ch.swisstopo.pmtiles',
};

export type ZsMapState = IZsMapStateV2;

export interface IZsMapStateV2 {
  version: number;
  id: string;
  name?: string;
  layers?: Record<string, ZsMapLayerState>;
  drawElements?: Record<string, ZsMapDrawElementState>;
  center: Coordinate;
}

export interface IZsMapStateV1 {
  version: 1;
  id: string;
  name?: string;
  layers?: ZsMapLayerState[];
  drawElements?: ZsMapDrawElementState[];
  center: Coordinate;
}

export type ZsMapStateAllVersions = IZsMapStateV1 | IZsMapStateV2;

export const getDefaultZsMapState = (): ZsMapState => {
  return {} as ZsMapState;
};

export interface IPositionFlag {
  coordinates: number[];
  isVisible: boolean;
}

export enum ZsMapDisplayMode {
  DRAW = 'draw',
  HISTORY = 'history',
}

export interface IZsMapDisplayState {
  id?: string;
  version: number;
  displayMode: ZsMapDisplayMode;
  expertView: boolean;
  mapOpacity: number;
  mapCenter: Coordinate;
  mapZoom: number;
  mapExtent: Extent;
  dpi?: number;
  showMyLocation: boolean;
  activeLayer: string | undefined;
  layerVisibility: Record<string, boolean>;
  layerOpacity: Record<string, number>;
  layerOrder: string[];
  source: ZsMapStateSource;
  elementOpacity: Record<string, number>;
  elementVisibility: Record<string, boolean>;
  layers: MapLayer[];
  wmsSources?: WmsSource[];
  positionFlag: IPositionFlag;
  hiddenSymbols: number[];
  hiddenFeatureTypes: string[];
  highlightedFeature: string[];
  enableClustering: boolean;
  journalSort: Sort;
  journalFilter: IZsJournalFilter;
  searchConfig: IZsGlobalSearchConfig;
  journalMessageEditConfig: IZsJournalMessageEditConfig;
}

export interface IZsJournalFilter {
  department: string;
  triageFilter: boolean;
  outgoingFilter: boolean;
  decisionFilter: boolean;
  keyMessageFilter: boolean;
}

export interface IZsGlobalSearchConfig {
  filterMapSection: boolean;
  filterByDistance: boolean;
  maxDistance: number;
  filterByArea: false;
  area: Extent | null;
  sortedByDistance: boolean;
  distanceReferenceCoordinate: Coordinate | null;
}

export interface IZsJournalMessageEditConfig {
  showMap: boolean;
  showAllAddresses: boolean;
  showLinkedText: boolean;
}

//DIN paper dimension in mm, landscape
export const PaperDimensions = {
  A0: [1189, 841],
  A1: [841, 594],
  A2: [594, 420],
  A3: [420, 297],
  A4: [297, 210],
  A5: [210, 148],
} as const;
export type PaperFormats = keyof typeof PaperDimensions;

export interface IZsMapPrintExtent {
  dpi: number;
  scale?: number;
  autoScaleVal?: number;
  dimensions: [number, number];
}

export interface IZsMapPrintState extends IZsMapPrintExtent {
  printView: boolean;
  format: string;
  orientation: 'landscape' | 'portrait';
  printMargin: number;
  printScale: boolean;
  emptyMap: boolean;
  qrCode: boolean;
  shareLink: boolean;
  sharePermission: PermissionType;
  printCenter?: Coordinate;
  generateCallback: (() => void) | undefined;
  tileEventCallback: ((Event) => void) | undefined;
  backupResolution?: number;
  backupDpi?: number;
  attributions?: string[];
}

export type ZsMapLayerState = IZsMapDrawLayerState | IZsMapGeoDataLayerState;

export enum ZsMapLayerStateType {
  DRAW = 'draw',
  GEO_DATA = 'geoData',
}

interface IZsMapBaseLayerState {
  id: string;
  type: ZsMapLayerStateType;
  name?: string;
}

export interface IZsMapDrawLayerState extends IZsMapBaseLayerState {
  type: ZsMapLayerStateType.DRAW;
}

export interface IZsMapGeoDataLayerState extends IZsMapBaseLayerState {
  type: ZsMapLayerStateType.GEO_DATA;
}

export enum ZsMapDrawElementStateType {
  TEXT = 'text',
  SYMBOL = 'symbol',
  POLYGON = 'polygon',
  LINE = 'line',
  FREEHAND = 'freehand',
}

export type ZsMapDrawElementState =
  | ZsMapTextDrawElementState
  | ZsMapSymbolDrawElementState
  | ZsMapLineDrawElementState
  | ZsMapPolygonDrawElementState
  | ZsMapFreehandDrawElementState;

export interface IZsMapBaseElementState {
  id?: string;
  layer?: string;
  coordinates?: number[] | number[][];
  createdAt?: number;
}

export interface IZsMapBaseDrawElementState extends IZsMapBaseElementState {
  type: ZsMapDrawElementStateType;
  protected?: boolean;
  color?: string;
  name?: string;
  createdBy?: string;
  nameShow?: boolean;
  iconOpacity?: number;
  description?: string;
  iconSize?: number;
  rotation?: number;
  symbolId?: number;
  hideIcon?: boolean;
  iconsOffset?: IconsOffset;
  style?: string;
  arrow?: string;
  strokeWidth?: number;
  fillStyle?: FillStyle;
  fillOpacity?: number;
  fontSize?: number;
  images?: string[];
  zindex?: number;
  reportNumber?: number | number[];
  affectedPersons?: number;
}

export interface ZsMapTextDrawElementState extends IZsMapBaseDrawElementState {
  type: ZsMapDrawElementStateType.TEXT;
  text?: string;
}

export interface ZsMapSymbolDrawElementState extends IZsMapBaseDrawElementState {
  type: ZsMapDrawElementStateType.SYMBOL;
  coordinates: number[] | number[][];
}

export interface ZsMapLineDrawElementState extends IZsMapBaseDrawElementState {
  type: ZsMapDrawElementStateType.LINE;
}

export interface ZsMapPolygonDrawElementState extends IZsMapBaseDrawElementState {
  type: ZsMapDrawElementStateType.POLYGON;
}

export interface ZsMapFreehandDrawElementState extends IZsMapBaseDrawElementState {
  type: ZsMapDrawElementStateType.FREEHAND;
}

export interface ZsMapElementToDraw {
  type: ZsMapDrawElementStateType;
  layer: string;
  symbolId?: number;
  text?: string;
}

export type ZsMapDrawElementParams =
  | IZsMapBaseDrawElementParams
  | IZsMapSymbolDrawElementParams
  | IZsMapTextDrawElementParams;

interface IZsMapBaseDrawElementParams {
  type: ZsMapDrawElementStateType;
  layer: string;
}

export interface IZsMapSymbolDrawElementParams extends IZsMapBaseDrawElementParams {
  type: ZsMapDrawElementStateType.SYMBOL;
  symbolId: number;
}

export interface IZsMapTextDrawElementParams extends IZsMapBaseDrawElementParams {
  type: ZsMapDrawElementStateType.TEXT;
  text: string;
}

export interface IZsMapSearchResult {
  label: string;
  mercatorCoordinates?: Coordinate;
  lonLat?: Coordinate;
  feature?: Feature;
  internal?: Partial<IFoundLocationAttrs> & {
    id?: string | number;
    dist?: number;
    center?: Coordinate;
    addressToken?: string;
  };
}

export type SearchFunction = (
  searchText: string,
  abortController: AbortController,
  searchConfig: IZsGlobalSearchConfig,
  maxResultCount?: number,
) => Promise<IZsMapSearchResult[]>;

export interface IZsMapSearchConfig {
  label: string;
  func: SearchFunction;
  active: boolean;
  maxResultCount: number;
  resultOrder: number;
}

export interface IResultSet {
  config: IZsMapSearchConfig;
  results: IZsMapSearchResult[];
  collapsed: boolean | 'peek';
}

export interface IFoundLocation {
  attrs: IFoundLocationAttrs;
  id?: number;
}

export interface IFoundLocationAttrs {
  label: string;
  lon: number;
  lat: number;
  objectclass?: string;
  origin?: string;
  featureId?: string;
  geom_st_box2d: string;
}
