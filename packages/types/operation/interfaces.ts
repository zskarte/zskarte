import { MapLayer } from '../map-layer/interfaces';
import { IZsChangeset, IZsChangesetConfig, ZsMapState, ZsMapStateSource } from '../state/interfaces';

export interface IZSMapOperationMapLayers {
  baseLayer: ZsMapStateSource;
  layerConfigs: MapLayer[];
}

export type ZsOperationPhase = 'active' | 'archived' | 'deleted';

export interface IZsMapOperation {
  documentId?: string;
  name: string;
  description: string;
  updatedAt?: Date;
  mapState: ZsMapState;
  changesets?: Record<string, IZsChangeset>;
  changesetSigns?: Record<string, string>;
  signingKeyIds?: Array<string>;
  eventStates: number[];
  phase: ZsOperationPhase;
  mapLayers?: IZSMapOperationMapLayers;
}

export interface IZsMapSnapshot {
  documentId: string;
  changesetIds: string[];
  mapState: ZsMapState;
  createdAt: Date;
}

export interface IZsMapOrganizationMapLayerSettings {
  wms_sources: string[];
  map_layer_favorites: string[];
}

export interface IZsMapOrganizationSettings {
  journalMessageTextTemplate?: string;
  changeset: IZsChangesetConfig;
}

export interface IZsMapOrganization extends IZsMapOrganizationMapLayerSettings {
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
  settings: IZsMapOrganizationSettings;
}

export interface IZsMapUser {
  username: string;
  email: string;
}

export interface UZsStrapiAssetFormat {
  url: string;
  name: string;
}

export interface IZsStrapiAsset extends UZsStrapiAssetFormat {
  name: string;
  alternativeText?: string;
  caption?: string;
  formats?: {
    large?: UZsStrapiAssetFormat;
    medium?: UZsStrapiAssetFormat;
    small?: UZsStrapiAssetFormat;
    thumbnail?: UZsStrapiAssetFormat;
  };
  url: string;
  previewUrl?: string;
  provider: string;
}

export type IZsSignKeyType = 'rsa' | 'ed25519';

export interface IZsSigningKey {
  keyId: string;
  serverId: string;
  validFrom: Date;
  validUntil?: Date;
  keyType: IZsSignKeyType;
  privateKeyEncrypted?: string;
  publicKey: string;
}
