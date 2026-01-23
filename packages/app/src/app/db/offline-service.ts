import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { SyncService } from '../sync/sync.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionService } from '../session/session.service';
import { ZsMapStateService } from '../state/state.service';
import { GeoJSONMapLayer, MapLayer, ZsMapStateSource, zsMapStateSourceToDownloadUrl } from '@zskarte/types';
import { BlobEventType, BlobOperation, BlobService } from './blob.service';
import { LOCAL_MAP_STYLE_PATH, LOCAL_MAP_STYLE_SOURCE } from '../session/default-map-values';
import { db, LocalBlobMeta, LocalMapInfo } from './db';
import { MapLayerService } from '../map-layer/map-layer.service';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private _state = inject(ZsMapStateService);
  private _session = inject(SessionService);
  private _syncService = inject(SyncService);
  private _blobService = inject(BlobService);
  private _mapLayerService = inject(MapLayerService);
  readonly displayState = toSignal(this._state.observeDisplayState());
  readonly connection = toSignal(this._syncService.observeConnections());
  readonly isOnline = toSignal(this._session.observeIsOnline());
  //readonly isWorkLocal = toSignal(this._session.isWorkLocal());
  readonly operationId = toSignal(this._session.observeOperationId());
  readonly localOperation = computed(() => this.operationId()?.startsWith('local-') ?? false);
  public readonly canWorkOffline = signal(false);

  private updateMapCallbacks: Record<string, (eventType: BlobEventType, infos: BlobOperation) => Promise<void>> = {};

  readonly attempToWorkOffline = signal<boolean>(false);

  readonly useLocalBaseMap = signal<boolean>(false);
  readonly downloadLocalBaseMap = signal<boolean>(false);
  readonly hideUnavailableLayers = signal<boolean>(false);
  readonly downloadAvailableLayers = signal<boolean>(false);
  readonly haveSearchCapability = signal<boolean>(false);
  readonly isLoadingBaseMap = signal<boolean>(false);
  readonly isLoadingMapLayers = signal<boolean>(false);

  constructor() {
    effect(() => {
      const displayState = this.displayState();
      if (!displayState) return;
      this.useLocalBaseMap.set(
        displayState.source === ZsMapStateSource.LOCAL || displayState.source === ZsMapStateSource.NONE,
      );
      this.hideUnavailableLayers.set(
        displayState.layers.filter((l) => l.type !== 'geojson' && l.type !== 'shape' && l.type !== 'csv' && !l.hidden)
          .length === 0,
      );
      this.downloadAvailableLayers.set(
        displayState.layers.filter(
          (l) => (l.type === 'geojson' || l.type === 'shape' || l.type === 'csv') && !l.offlineAvailable,
        ).length === 0,
      );
      this.haveSearchCapability.set(
        displayState.layers.filter(
          (l) => (l.type === 'geojson' || l.type === 'shape' || l.type === 'csv') && (l as GeoJSONMapLayer).searchable,
        ).length > 0,
      );
      this.getLocalMapInfo().then((localMapInfo) => {
        BlobService.isDownloaded(localMapInfo.mapBlobId).then((downloaded) => {
          if (downloaded) {
            BlobService.isDownloaded(localMapInfo.styleBlobId).then((styleDownloaded) => {
              this.downloadLocalBaseMap.set(styleDownloaded);
            });
          } else {
            this.downloadLocalBaseMap.set(false);
          }
        });
      });
    });
  }

  async prepareLocalAvailability() {
    this.attempToWorkOffline.set(true);
    return Promise.allSettled([
      this.downloadLocalMap(),
      this.changeToLocalMap(),
      this.hideUnavailable(),
      this.downloadAvailable(),
    ]);
  }

  changeToLocalMap() {
    this._state.setMapSource(ZsMapStateSource.LOCAL);
  }

  private async updateMapCallback(eventType: BlobEventType, infos: BlobOperation) {
    for (const callback of Object.values(this.updateMapCallbacks)) {
      await callback(eventType, infos);
    }
  }

  public setUpdateMapCallbacks(
    name: string,
    callback: null | ((eventType: BlobEventType, infos: BlobOperation) => Promise<void>),
  ) {
    if (!callback) {
      delete this.updateMapCallbacks[name];
    } else {
      this.updateMapCallbacks[name] = callback;
    }
  }

  async getLocalMapInfo() {
    return (
      (await db.localMapInfo.get(ZsMapStateSource.LOCAL)) || {
        map: ZsMapStateSource.LOCAL,
        styleSourceName: LOCAL_MAP_STYLE_SOURCE,
      }
    );
  }

  async downloadLocalMap() {
    if (!this.downloadLocalBaseMap() && !this.isLoadingBaseMap()) {
      this.isLoadingBaseMap.set(true);
      const localMapInfo = await this.getLocalMapInfo();
      let mapDownloaded = false;
      if (await BlobService.isDownloaded(localMapInfo.mapBlobId)) {
        mapDownloaded = true;
      } else {
        if (zsMapStateSourceToDownloadUrl[ZsMapStateSource.LOCAL]) {
          const localBlobMeta = await this._blobService.downloadBlob(
            zsMapStateSourceToDownloadUrl[ZsMapStateSource.LOCAL],
            localMapInfo.mapBlobId,
            this.updateMapCallback.bind(this),
          );
          localMapInfo.mapBlobId = localBlobMeta.id;
          mapDownloaded = localBlobMeta.blobState === 'downloaded';
        }
      }
      let styleDownloaded = false;
      if (await BlobService.isDownloaded(localMapInfo.styleBlobId)) {
        styleDownloaded = true;
      } else {
        const localBlobMeta = await this._blobService.downloadBlob(LOCAL_MAP_STYLE_PATH, localMapInfo.styleBlobId);
        localMapInfo.styleBlobId = localBlobMeta.id;
        styleDownloaded = localBlobMeta.blobState === 'downloaded';
      }
      localMapInfo.offlineAvailable = mapDownloaded && styleDownloaded;
      await db.localMapInfo.put(localMapInfo);
      this.downloadLocalBaseMap.set(localMapInfo.offlineAvailable);
      this.isLoadingBaseMap.set(false);
    }
  }

  hideUnavailable() {
    this._state.updateDisplayState((draft) => {
      draft.layers.forEach((l) => {
        if (l.type !== 'geojson' && l.type !== 'shape' && l.type !== 'csv') {
          l.hidden = true;
        }
      });
    });
  }

  async downloadAvailable() {
    if (!this.isLoadingMapLayers()) {
      const displayState = this.displayState();
      if (!displayState) return;
      this.isLoadingMapLayers.set(true);
      const layers: MapLayer[] = [];
      for (const layerRO of displayState.layers) {
        const layer = { ...layerRO };
        if (layer.type === 'geojson' || layer.type === 'shape' || layer.type === 'csv') {
          if (!layer.offlineAvailable) {
            await this._mapLayerService.saveLocalMapLayer(layer);
          }
        }
        layers.push(layer);
      }
      this._state.updateDisplayState((draft) => {
        draft.layers = layers;
      });
      this.isLoadingMapLayers.set(false);
    }
  }

  async downloadMap(map: ZsMapStateSource, styleSourceName?: string) {
    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    const localMapInfo = (await db.localMapInfo.get(map)) || { map, styleSourceName };

    const localBlobMeta = await this._blobService.downloadBlob(
      downloadUrl,
      localMapInfo.mapBlobId,
      this.updateMapCallback.bind(this),
    );
    this.handleBlobOperationResult(localBlobMeta, localMapInfo);
  }

  async cancelDownloadMap(map: ZsMapStateSource) {
    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    await this._blobService.cancelDownload(downloadUrl);
  }

  async uploadMap(event: Event, map: ZsMapStateSource) {
    if (!event.target) return;

    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    const localMapInfo = (await db.localMapInfo.get(map)) || { map };

    const localBlobMeta = await this._blobService.uploadBlob(event, downloadUrl, this.updateMapCallback.bind(this));
    if (localBlobMeta) {
      this.handleBlobOperationResult(localBlobMeta, localMapInfo);
    }
  }

  async handleBlobOperationResult(localBlobMeta: LocalBlobMeta, localMapInfo: LocalMapInfo) {
    localMapInfo.mapBlobId = localBlobMeta.id;
    localMapInfo.offlineAvailable = localBlobMeta.blobState === 'downloaded';
    await db.localMapInfo.put(localMapInfo);

    if (localMapInfo.offlineAvailable) {
      localBlobMeta = await this._blobService.downloadBlob(LOCAL_MAP_STYLE_PATH, localMapInfo.styleBlobId);
      localMapInfo.styleBlobId = localBlobMeta.id;
      localMapInfo.offlineAvailable = localBlobMeta.blobState === 'downloaded';
      await db.localMapInfo.put(localMapInfo);
    }
  }

  async removeLocalMap(map: ZsMapStateSource): Promise<void> {
    const blobMeta = await db.localMapInfo.get(map);
    if (!blobMeta || (!blobMeta.mapBlobId && !blobMeta.styleBlobId)) return;
    blobMeta.offlineAvailable = false;
    if (blobMeta.mapBlobId) {
      await BlobService.removeBlob(blobMeta.mapBlobId);
      blobMeta.mapBlobId = undefined;
      await db.localMapInfo.put(blobMeta);
    }
    if (blobMeta.styleBlobId) {
      await BlobService.removeBlob(blobMeta.styleBlobId);
      blobMeta.styleBlobId = undefined;
      await db.localMapInfo.put(blobMeta);
    }
    this.downloadLocalBaseMap.set(false);
  }
}
