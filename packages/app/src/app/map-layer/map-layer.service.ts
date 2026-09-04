import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Coordinate } from 'ol/coordinate';
import { DEFAULT_RESOLUTION, LOG2_ZOOM_0_RESOLUTION } from '../session/default-map-values';
import { trpc } from '../api/trpc.client';
import { trpcRequest } from '../api/trpc.error';
import { environment } from '../../environments/environment';
import { getPropertyDifferences } from '../helper/diff';
import TileGrid, { Options as TileGridOptions } from 'ol/tilegrid/TileGrid';
import { db, LocalMapLayer, LocalMapLayerMeta } from '../db/db';
import { BlobService } from '../db/blob.service';
import {
  GeoJSONMapLayer,
  IZsMapOrganizationMapLayerSettings,
  MapLayer,
  MapLayerAllFields,
  MapLayerOptionsApi,
  MapLayerSourceApi,
  MapSource,
  Media,
  WmsSource,
} from '@zskarte/types';

/** projections of the `mapLayer` procedures, inferred from the client so the server stays authoritative */
export type MapLayerApiResponse = Awaited<ReturnType<typeof trpc.mapLayer.list.query>>[number];
export type MapLayerSourceApiResponse = Pick<MapLayerApiResponse, 'wms_source' | 'media_source' | 'custom_source'>;
export type MapLayerApiData = Parameters<typeof trpc.mapLayer.create.mutate>[0]['data'];

@Injectable({
  providedIn: 'root',
})
export class MapLayerService {
  private _domSanitizer = inject(DomSanitizer);
  private _blobService = inject(BlobService);
  /** the new backend serves the uploaded media and style files below its own origin */
  private _apiUrl = environment.apiUrl;

  static getScaledTileGridInfos(grid: TileGrid, scaling = 1) {
    if (scaling === 1) {
      return null;
    }
    const resolutions = grid.getResolutions().slice(); // take a copy
    const origins: Coordinate[] = [];
    const tileSizes: Array<number | Array<number>> = [];
    for (let i = 0; i < resolutions.length; i++) {
      origins[i] = grid.getOrigin(i);
      tileSizes[i] = grid.getTileSize(i);
      if (!Array.isArray(tileSizes[i])) {
        // @ts-expect-error "it's not a number[], checked the line above..."
        tileSizes[i] = [tileSizes[i], tileSizes[i]];
      }
      tileSizes[i][0] = tileSizes[i][0] * scaling;
      tileSizes[i][1] = tileSizes[i][1] * scaling;
      resolutions[i] = resolutions[i] / scaling;
    }
    return {
      extent: grid.getExtent(),
      resolutions,
      tileSizes,
      origins,
    } as TileGridOptions;
  }

  public static scaleDominatorToZoom(scaleDenominator: number | undefined) {
    if (scaleDenominator === undefined) {
      return undefined;
    }
    //no idea why the * 0.97 is required to make value match more accurate
    return (LOG2_ZOOM_0_RESOLUTION - Math.log2(scaleDenominator / DEFAULT_RESOLUTION)) * 0.97;
  }

  public static getLocalMapLayers() {
    return db.localMapLayer.toArray();
  }

  public static async saveLocalWmsSource(wmsSource: WmsSource) {
    if (!wmsSource.id) {
      const minId = Math.min(0, ...(await db.localWmsSource.toArray()).map((o) => o.id ?? 0));
      wmsSource.id = minId - 1;
    }
    await db.localWmsSource.put(wmsSource);
  }

  public static getLocalWmsSources() {
    return db.localWmsSource.toArray();
  }

  public static async saveLocalMapLayerSettings(data: IZsMapOrganizationMapLayerSettings) {
    await db.localMapLayerSettings.put({ ...data, id: 'local' });
  }

  public static async loadLocalMapLayerSettings() {
    return await db.localMapLayerSettings.get('local');
  }

  static extractMapLayerDiffs(mapLayer: MapLayer, allLayers: MapLayer[]) {
    let reducedFeature: Partial<MapLayer> & MapLayerSourceApi;
    if (!mapLayer.source || mapLayer.type === 'wmts') {
      //no detail comparison for GeoAdmin and WMTS layers needed
      reducedFeature = {
        serverLayerName: mapLayer.serverLayerName,
        opacity: mapLayer.opacity,
        hidden: mapLayer.hidden,
        zIndex: mapLayer.zIndex,
        source: mapLayer.source,
      };
    } else {
      const defaultLayer = allLayers.find((g) => g.fullId === mapLayer.fullId);
      if (defaultLayer) {
        reducedFeature = getPropertyDifferences(defaultLayer, mapLayer, ['documentId', 'serverLayerName', 'source'], {
          source: ['documentId', 'url', 'type'],
        });
      } else {
        reducedFeature = { ...mapLayer };
      }
      delete reducedFeature.deleted;
    }
    if (reducedFeature.source?.type && reducedFeature.source?.documentId) {
      reducedFeature.wms_source = reducedFeature.source as WmsSource;
    } else if (!reducedFeature.source?.type && reducedFeature.source?.documentId) {
      reducedFeature.media_source = reducedFeature.source as Media;
    } else if (reducedFeature.source?.url) {
      reducedFeature.custom_source = reducedFeature.source.url;
    }
    delete reducedFeature.source;
    return reducedFeature;
  }

  public sanitizeHTML(html: string) {
    return this._domSanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  public sanitizeURLAttribute(url: string) {
    const result = this._domSanitizer.sanitize(SecurityContext.URL, url) ?? '';
    //prevent escape the href attribute
    return result.replace(/"/g, '&quot;');
  }

  createAttributionFromArray(attribution: [string, string][] | undefined) {
    if (attribution && attribution.length > 0) {
      return attribution.map((attr) => {
        const title = this.sanitizeHTML(attr[0]);
        if (attr[1]) {
          const url = this.sanitizeURLAttribute(attr[1]);
          return `<a target="_blank" href="${url}">${title}</a>`;
        } else {
          return title;
        }
      });
    }
    return null;
  }

  getMapSource(layerSource: MapLayerSourceApiResponse, sources: (WmsSource | MapSource)[]) {
    let source: WmsSource | MapSource | undefined;
    if (layerSource.wms_source) {
      const sourceId = layerSource.wms_source.documentId;
      source = sources.find((source) => source.documentId === sourceId);
    } else if (layerSource.media_source) {
      const url = layerSource.media_source.url;
      source = {
        documentId: layerSource.media_source.documentId,
        url: url.startsWith('/') ? this._apiUrl + url : url,
      };
    } else if (layerSource.custom_source) {
      source = { url: layerSource.custom_source };
    }
    return source;
  }

  convertMapLayerFromApi(mapLayerApi: MapLayerApiResponse, sources: (WmsSource | MapSource)[], organizationId: string) {
    const source = this.getMapSource(mapLayerApi, sources);
    const options = mapLayerApi.options as MapLayerOptionsApi;
    const layer: Partial<MapLayerAllFields> = {
      // the options blob of the strapi era can still carry a stale documentId, the column wins
      ...options,
      documentId: mapLayerApi.documentId,
      label: mapLayerApi.label ?? '',
      serverLayerName: mapLayerApi.serverLayerName,
      type: mapLayerApi.type ?? '',
      public: mapLayerApi.public,
      source,
      opacity: options.opacity ?? 0.75,
      owner: false,
      fullId: `${source?.url}|${mapLayerApi.serverLayerName}|${mapLayerApi.documentId}`,
      hidden: false,
      zIndex: 0,
    };
    if (layer.styleUrl?.startsWith('/')) {
      layer.styleUrl = this._apiUrl + layer.styleUrl;
    }
    layer.owner = mapLayerApi.organization?.documentId === organizationId;
    layer.managed = !mapLayerApi.organization;
    return layer as MapLayer;
  }

  async readGlobalMapLayers(sources: WmsSource[], organizationId: string) {
    const { error, result: mapLayers } = await trpcRequest(trpc.mapLayer.list.query());
    if (error || !mapLayers) {
      return [];
    }
    return mapLayers.map((layer) => this.convertMapLayerFromApi(layer, sources, organizationId));
  }

  convertMapLayerToApi(mapLayer: MapLayer & LocalMapLayerMeta): MapLayerApiData {
    const cleanedOptions: Partial<MapLayerAllFields> & LocalMapLayerMeta = { ...mapLayer };
    // delete values for main object / from PresistedSettings
    delete cleanedOptions.id;
    delete cleanedOptions.documentId;
    delete cleanedOptions.owner;
    delete cleanedOptions.public;
    // delete values for main object & from MapLayerGeneralSettings
    delete cleanedOptions.label;
    delete cleanedOptions.serverLayerName;
    delete cleanedOptions.type;
    // delete values for main object & from MapLayer
    delete cleanedOptions.source;
    delete cleanedOptions.fullId;
    delete cleanedOptions.offlineAvailable;
    delete cleanedOptions.managed;
    // delete display specific values / from SelectedMapLayerSettings
    delete cleanedOptions.deleted;
    delete cleanedOptions.zIndex;
    // delete local cache specific values / from LocalMapLayerMeta
    delete cleanedOptions.sourceBlobId;
    delete cleanedOptions.styleBlobId;

    const options: MapLayerOptionsApi = cleanedOptions;
    if (options.styleUrl?.startsWith(this._apiUrl)) {
      options.styleUrl = options.styleUrl.substring(this._apiUrl.length);
    }
    return {
      public: mapLayer.public,
      label: mapLayer.label,
      serverLayerName: mapLayer.serverLayerName,
      type: mapLayer.type as MapLayerApiData['type'],
      wms_source: mapLayer.source?.documentId && mapLayer.source?.type ? mapLayer.source.documentId : undefined,
      media_source: mapLayer.source?.documentId && !mapLayer.source?.type ? mapLayer.source.documentId : undefined,
      custom_source: !mapLayer.source?.documentId ? mapLayer.source?.url : undefined,
      options: { ...options },
    };
  }

  async saveGlobalMapLayer(mapLayer: MapLayer, organizationId: string | undefined) {
    if (!mapLayer.owner) {
      return null;
    }
    if (!organizationId) {
      return this.saveLocalMapLayer(mapLayer);
    }
    // the organization of the entry is derived from the session, sending it would be rejected with FORBIDDEN
    const data = this.convertMapLayerToApi(mapLayer);
    const { error, result } =
      mapLayer.documentId ?
        await trpcRequest(trpc.mapLayer.update.mutate({ documentId: mapLayer.documentId, data }))
      : await trpcRequest(trpc.mapLayer.create.mutate({ data }));
    if (error) {
      console.error('saveGlobalMapLayer', error);
    } else if (result) {
      const mapped = this.convertMapLayerFromApi(result, mapLayer.source ? [mapLayer.source] : [], organizationId);
      mapped.source = mapLayer.source;
      mapped.owner = mapLayer.owner;
      mapped.managed = false;
      mapped.fullId = `${mapped.source?.url}|${mapped.serverLayerName}|${mapped.documentId}`;
      return mapped;
    }
    return null;
  }

  public async saveLocalMapLayer(mapLayer: MapLayer, downloadMissingBlobs = true) {
    // a layer of the backend is identified by its documentId, only local only layers get a generated id
    if (!mapLayer.documentId && !mapLayer.id) {
      const minId = Math.min(0, ...(await db.localMapLayer.toArray()).map((o) => o.id ?? 0));
      mapLayer.id = minId - 1;
      mapLayer.fullId = `${mapLayer.source?.url}|${mapLayer.serverLayerName}|${mapLayer.id}`;
    }
    const localMapLayer = mapLayer as LocalMapLayer;
    await db.localMapLayer.put(localMapLayer);
    if ((mapLayer.type === 'geojson' || mapLayer.type === 'shape' || mapLayer.type === 'csv') && downloadMissingBlobs) {
      const geoMapLayer = mapLayer as GeoJSONMapLayer;
      let sourceDownloaded = await BlobService.isDownloaded(localMapLayer.sourceBlobId);
      if (geoMapLayer.source?.url && !sourceDownloaded) {
        const localBlobMeta = await this._blobService.downloadBlob(geoMapLayer.source.url, localMapLayer.sourceBlobId);
        localMapLayer.sourceBlobId = localBlobMeta.id;
        await db.localMapLayer.put(localMapLayer);
        sourceDownloaded = localBlobMeta.blobState === 'downloaded';
      }
      let styleDownloaded: boolean;
      if (geoMapLayer.styleSourceType === 'url' && geoMapLayer.styleUrl) {
        styleDownloaded = await BlobService.isDownloaded(localMapLayer.styleBlobId);
        if (!styleDownloaded) {
          const localBlobMeta = await this._blobService.downloadBlob(geoMapLayer.styleUrl, localMapLayer.styleBlobId);
          localMapLayer.styleBlobId = localBlobMeta.id;
          await db.localMapLayer.put(localMapLayer);
          styleDownloaded = localBlobMeta.blobState === 'downloaded';
        }
      } else {
        localMapLayer.styleBlobId = undefined;
        await db.localMapLayer.put(localMapLayer);
        styleDownloaded = true;
      }
      localMapLayer.offlineAvailable = sourceDownloaded && styleDownloaded;
      await db.localMapLayer.put(localMapLayer);
    }
    return mapLayer;
  }
}
