import { Injectable, inject } from '@angular/core';
import { WMSMapLayer, WmsSource } from '@zskarte/types';
import { WmsService } from '../wms/wms.service';
import { SessionService } from 'src/app/session/session.service';

export const GEODIENSTE_DOMAIN = 'https://geodienste.ch/db/';
const GEODIENSTE_ATTRIBUTION: [string, string][] = [['geodienste', 'https://geodienste.ch/terms-of-use']];

@Injectable({
  providedIn: 'root',
})
export class GeodiensteService {
  private wmsService = inject(WmsService);
  private session = inject(SessionService);

  private _layersCache: WMSMapLayer[] | undefined;

  private layersAndOpacity: Record<string, number> = {
    gefahrenkarten_v1_3_0: 0.8,
    naturereigniskataster_v1_0_0: 0.8,
    stromversorgungssicherheit_netzgebiete_v1_2_0: 0.8,
    waldreservate_v2_0_0: 0.8,
    wildruhezonen_v2_1_1: 0.8,
    av_0: 1,
    avc_0: 1,
    av_situationsplan_0: 1,
    av_situationsplan_oereb_0: 1,
  };

  public async getLayers(): Promise<WMSMapLayer[]> {
    if (this._layersCache) {
      return this._layersCache;
    }
    const language = this.getLanguageSuffix();
    const mapLayers: WMSMapLayer[] = [];
    for (const [layerId, opacity] of Object.entries(this.layersAndOpacity)) {
      const mapLayer = await this.getLayer(layerId, opacity, language);
      if (mapLayer) {
        mapLayers.push(mapLayer);
      }
    }
    this._layersCache = mapLayers;
    return this._layersCache;
  }

  public getLanguageSuffix() {
    switch (this.session.getLocale()) {
      case 'de': {
        return '/deu';
      }
      case 'fr': {
        return '/fra';
      }
      /*
      case 'it': {
        return'/ita';
      }
      */
    }
    return '';
  }

  public getSource(layerId: string, language = this.getLanguageSuffix()) {
    return {
      url: `${GEODIENSTE_DOMAIN}${layerId}${language}`,
      label: `geodienste ${layerId}`,
      type: 'wms',
      attribution: GEODIENSTE_ATTRIBUTION,
    } as WmsSource;
  }

  public getServerLayerName(language = this.getLanguageSuffix()) {
    return language === '/fra' ? 'donnees' : language === '/ita' ? 'dati' : 'daten';
  }

  public async getLayer(
    layerId: string,
    opacity = 0.8,
    language = this.getLanguageSuffix(),
  ): Promise<WMSMapLayer | null> {
    if (!layerId) {
      return null;
    }
    const source = this.getSource(layerId, language);
    const capa = await this.wmsService.getWMSCapa(source);
    let gutter: number | undefined = undefined;
    if (layerId === 'stromversorgungssicherheit_netzgebiete_v1_2_0') {
      gutter = 0;
    }
    return {
      label: capa.Capability.Layer.Title,
      opacity,
      serverLayerName: this.getServerLayerName(language),
      type: 'wms',
      tileSize: 512,
      gutter,
      source,
      fullId: `geodienste|${layerId}`,
      geodiensteSourceLayerId: layerId,
    } as WMSMapLayer;
  }
}
