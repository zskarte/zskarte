import { StrapiApiResponseList } from 'src/app/helper/strapi-utils';
import { MapLayer } from '../map-layer/interfaces';
import { ZsMapState, ZsMapStateSource } from '../state/interfaces';

export interface IZSMapOperationMapLayers {
  baseLayer: ZsMapStateSource;
  layerConfigs: MapLayer[];
}

export type ZsOperationPhase = 'active' | 'archived' | 'deleted';

export interface IZsMapOperation {
  id?: number;
  documentId?: string;
  name: string;
  description: string;
  updatedAt?: Date;
  mapState: ZsMapState;
  eventStates: number[];
  phase: ZsOperationPhase;
  mapLayers?: IZSMapOperationMapLayers;
}

export interface IZsMapSnapshot {
  id: number;
  documentId: string;
  createdAt: Date;
}
export type IZsMapSnapshots = StrapiApiResponseList<IZsMapSnapshot[]>;

export interface IZsMapOrganizationMapLayerSettings {
  wms_sources: number[];
  map_layer_favorites: number[];
}

export interface IZsMapOrganization extends IZsMapOrganizationMapLayerSettings {
  id: number;
  documentId: string;
  name: string;
  mapLongitude: number;
  mapLatitude: number;
  mapZoomLevel: number;
  defaultLocale: string;
  url: string;
  logo: IZsStrapiAsset;
  operations: IZsMapOperation[];
  users: IZsMapUser[];
  journalEntryTemplate: object | null;
}

export interface IZsMapUser {
  id: number;
  username: string;
  email: string;
}

export interface UZsStrapiAssetFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface IZsStrapiAsset extends UZsStrapiAssetFormat {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  formats?: {
    large?: UZsStrapiAssetFormat;
    medium?: UZsStrapiAssetFormat;
    small?: UZsStrapiAssetFormat;
    thumbnail?: UZsStrapiAssetFormat;
  };
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}
