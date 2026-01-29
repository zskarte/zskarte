import { inject, Injectable } from '@angular/core';
import { WMSMapLayer, ZsMapStateSource, zsMapStateSourceToDownloadUrl } from '@zskarte/types';
import OlTileXYZ from 'ol/source/XYZ';
import { PMTilesVectorSource } from 'ol-pmtiles';
import OlTileLayer from '../map-renderer/utils';
import VectorTile from 'ol/layer/VectorTile';
import { Layer } from 'ol/layer';
import { stylefunction } from 'ol-mapbox-style';
import { db } from '../db/db';
import { BlobService } from '../db/blob.service';
import { LOCAL_MAP_STYLE_PATH, LOCAL_MAP_STYLE_SOURCE } from '../session/default-map-values';
import { WmsService } from '../map-layer/wms/wms.service';

@Injectable({
  providedIn: 'root',
})
export class MapSourcesService {
  private wmsService = inject(WmsService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOlTileLayer(source: any) {
    return new OlTileLayer({
      zIndex: 0,
      source,
    });
  }
  async get(source: ZsMapStateSource): Promise<Layer> {
    switch (source) {
      case ZsMapStateSource.GEO_ADMIN_SWISS_IMAGE:
        return this.getOlTileLayer(
          new OlTileXYZ({
            attributions: ['<a target="_blank" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'],
            url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
            maxZoom: 20,
            crossOrigin: 'anonymous',
          }),
        );
      case ZsMapStateSource.GEO_ADMIN_PIXEL:
        return this.getOlTileLayer(
          new OlTileXYZ({
            attributions: ['<a target="_blank" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'],
            url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
            maxZoom: 19,
            crossOrigin: 'anonymous',
          }),
        );
      case ZsMapStateSource.GEO_ADMIN_PIXEL_BW:
        return this.getOlTileLayer(
          new OlTileXYZ({
            attributions: ['<a target="_blank" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'],
            url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
            maxZoom: 19,
            crossOrigin: 'anonymous',
          }),
        );
      case ZsMapStateSource.GEODIENSTE_AV:
        return (
          await this.wmsService.createWMSCustomLayer({
            label: 'geodienste Amtliche Vermessung farbig',
            opacity: 1,
            serverLayerName: 'daten',
            type: 'wms',
            tileSize: 512,
            source: {
              url: 'https://geodienste.ch/db/avc_0/deu',
              label: 'geodienste AV farbig',
              type: 'wms',
              attribution: [['geodienste', 'https://geodienste.ch/terms-of-use']],
            },
            fullId: 'https://geodienste.ch/db/avc_0/deu|daten',
          } as WMSMapLayer)
        )[0];
      case ZsMapStateSource.GEODIENSTE_AV_SITUATION:
        return (
          await this.wmsService.createWMSCustomLayer({
            label: 'geodienste Amtliche Vermessung Situationsplan',
            opacity: 1,
            serverLayerName: 'daten',
            type: 'wms',
            tileSize: 512,
            source: {
              url: 'https://geodienste.ch/db/av_situationsplan_0/deu',
              label: 'geodienste AV grau',
              type: 'wms',
              attribution: [['geodienste', 'https://geodienste.ch/terms-of-use']],
            },
            fullId: 'https://geodienste.ch/db/av_situationsplan_0/deu|daten',
          } as WMSMapLayer)
        )[0];
      case ZsMapStateSource.LOCAL: {
        const downloadUrl = zsMapStateSourceToDownloadUrl[source];
        const mapMeta = await db.localMapInfo.get(source);
        const mapUrl = await BlobService.getBlobOrRealUrl(downloadUrl, mapMeta?.mapBlobId);
        const styleUrl = await BlobService.getBlobOrRealUrl(LOCAL_MAP_STYLE_PATH, mapMeta?.styleBlobId);
        const mapStyle = await fetch(styleUrl).then((res) => res.text());
        const layer = new VectorTile({
          declutter: true,
          source: new PMTilesVectorSource({
            url: mapUrl,
            // crossOrigin: 'anonymous',
            attributions: ['<a target="_blank" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'],
          }),
          style: null,
        });

        layer.setStyle(stylefunction(layer, mapStyle, mapMeta?.styleSourceName ?? LOCAL_MAP_STYLE_SOURCE));

        return layer;
      }
      case ZsMapStateSource.NONE:
        return new OlTileLayer({
          zIndex: 0,
        });
      case ZsMapStateSource.OPEN_STREET_MAP:
      case undefined:
        return this.getOlTileLayer(
          new OlTileXYZ({
            attributions: [
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            ],
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
            crossOrigin: 'anonymous',
          }),
        );
      default:
        console.error(`Map source ${source} is not implemented`);
        return this.getOlTileLayer(
          new OlTileXYZ({
            attributions: [
              '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            ],
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
            crossOrigin: 'anonymous',
          }),
        );
    }
  }
}
