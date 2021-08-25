/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/index';
import { Sign } from './entity/sign';
import { Coordinate } from './entity/coordinate';
import { Session } from './entity/session';
import { Layer } from './layers/layer';
import { DisplayMode } from './entity/displayMode';
import {GeoadminService} from "./geoadmin.service";

import OlTileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import OlTileGridWMTS from 'ol/tilegrid/WMTS';
import OlTileWMTS from 'ol/source/WMTS';
import OlTileXYZ from 'ol/source/XYZ';
import {swissProjection} from "./projections";
import findOfflineHost from "./lib/findOfflineHost";

const favoriteFeaturesList = [
  'auengebiete',
  'gemeindegrenzen',
  'gewässer swisstlm3d',
  'hangneigung ab 30°',
  'strassen und wege swisstlm3d'
];


const layers: Layer[] = [
  {
    name: 'Open Street Map',
    olLayer: new OlTileLayer({
      source: new OSM(),
    }),
    opacity: 1,
  },
  {
    name: 'SwissImage (GeoAdmin)',
    olLayer: new OlTileLayer({
      source: new OlTileXYZ({
        attributions: [
          '<a target="new" href="https://www.swisstopo.admin.ch/' +
          'internet/swisstopo/en/home.html">swisstopo</a>',
        ],
        url: 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
      }),
    }),
    opacity: 1,
  },
  {
    name: 'Pixelkarte farbig (GeoAdmin)',
    olLayer: new OlTileLayer({
      source: new OlTileXYZ({
        attributions: [
          '<a target="new" href="https://www.swisstopo.admin.ch/' +
          'internet/swisstopo/en/home.html">swisstopo</a>',
        ],
        url: 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
      }),
    }),
    opacity: 1,
  },
  {
    name: 'Pixelkarte grau (GeoAdmin)',
    olLayer: new OlTileLayer({
      source: new OlTileXYZ({
        attributions: [
          '<a target="new" href="https://www.swisstopo.admin.ch/' +
          'internet/swisstopo/en/home.html">swisstopo</a>',
        ],
        url: 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
      }),
    }),
    opacity: 1,
  },
  {
    name: 'Offline',
    olLayer: new OlTileLayer({
      source: new OSM({
        name: 'Offline',
        url: findOfflineHost() + '/styles/osm-bright/{z}/{x}/{y}.png',
      }),
    }),
    opacity: 1,
  },
];

export function createGeoAdminLayer(
  layerId: string,
  timestamp: string,
  extension: string,
  zIndex: number,
) {
  return new OlTileLayer({
    source: new OlTileWMTS({
      projection: swissProjection,
      url:
        'https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/' +
        timestamp +
        '/2056/{TileMatrix}/{TileCol}/{TileRow}.' +
        extension,
      tileGrid: new OlTileGridWMTS({
        origin: [
          swissProjection.getExtent()[0],
          swissProjection.getExtent()[3],
        ],
        resolutions: swissProjection.resolutions,
        matrixIds: swissProjection.matrixIds,
        projection: swissProjection,
        resolution: 250,
      }),
      layer: layerId,
      requestEncoding: 'REST',
    }),
    opacity: 0.6,
    zIndex: zIndex,
  });
}

@Injectable({
  providedIn: 'root',
})
export class SharedStateService {
  public constructor(
    private geoAdminService: GeoadminService,
  ) {
  }

  public displayMode = new BehaviorSubject<DisplayMode>(
    SharedStateService.getFromQueryParam(
      'mode',
      { draw: DisplayMode.DRAW, history: DisplayMode.HISTORY },
      DisplayMode.DRAW
    )
  );

  private layerSource = new BehaviorSubject<Layer>(layers[0]);
  currentLayer = this.layerSource.asObservable();

  private layerFilterSource = new BehaviorSubject<string>('');
  layerFilter = this.layerSource.asObservable();

  private addAdditionalLayerSource = new BehaviorSubject<Layer>(null);
  addAdditionalLayer = this.addAdditionalLayerSource.asObservable();

  private removeAdditionalLayerSource = new BehaviorSubject<Layer>(null);
  removeAdditionalLayer = this.removeAdditionalLayerSource.asObservable();

  private layerChangedSource = new BehaviorSubject<boolean>(false);
  layerChanged = this.layerChangedSource.asObservable();

  private coordinateSource = new BehaviorSubject<Coordinate>(null);
  currentCoordinate = this.coordinateSource.asObservable();

  private historyDateSource = new BehaviorSubject<string>(null);
  historyDate = this.historyDateSource.asObservable();

  private downloadSource = new BehaviorSubject<string>(null);
  downloadData = this.downloadSource.asObservable();

  private signSource = new BehaviorSubject<Sign>(null);
  currentSign = this.signSource.asObservable();

  featureSource = new BehaviorSubject<any>(null);
  currentFeature = this.featureSource.asObservable();

  private deleteFeatureSource = new BehaviorSubject<any>(null);
  deletedFeature = this.deleteFeatureSource.asObservable();

  private drawHoleModeSource = new BehaviorSubject<boolean>(false);
  drawHoleMode = this.drawHoleModeSource.asObservable();

  private sessionSource = new BehaviorSubject<Session>(null);
  session = this.sessionSource.asObservable();

  private mergeModeSource = new BehaviorSubject<boolean>(false);
  mergeMode = this.mergeModeSource.asObservable();

  private splitSource = new BehaviorSubject<boolean>(false);
  splitMode = this.splitSource.asObservable();

  private reorderFeatureSource = new BehaviorSubject<boolean>(null);
  reorder = this.reorderFeatureSource.asObservable();

  private tagStateSource = new BehaviorSubject<string>(null);
  tagState = this.tagStateSource.asObservable();

  showMapLoader = new BehaviorSubject<boolean>(false);
  defineCoordinates = new BehaviorSubject<boolean>(null);
  drawingManipulated = new BehaviorSubject<boolean>(false);
  sessionOutdated = new BehaviorSubject<boolean>(false);
  zoom = new BehaviorSubject<number>(null);

  private featuresSource = new BehaviorSubject<any>(null);
  features = this.featuresSource.asObservable();

  availableFeatures = new BehaviorSubject<any>([]);
  favoriteFeatures = new BehaviorSubject<any>(null);
  private selectedFeaturesSource = new BehaviorSubject<any>([]);
  selectedFeatures = this.selectedFeaturesSource.asObservable();

  availableLayers = new BehaviorSubject<any>(null);

  private static getFromQueryParam(
    queryParam: string,
    map: object = null,
    nullValue
  ) {
    const fromUrlParam = new URLSearchParams(document.location.search).get(
      queryParam
    );
    if (fromUrlParam) {
      if (map) {
        return map[fromUrlParam] ? map[fromUrlParam] : nullValue;
      } else {
        return fromUrlParam;
      }
    }
    return nullValue;
  }

  fetchData() {
    this.geoAdminService.getFeatures().subscribe((data) => {
      const newFeatures = [];
      for (const featureName in data) {
        const feature = data[featureName];
        if (feature.timestamps !== undefined && feature.timestamps.length > 0) {
          newFeatures.push(feature);
        }
      }
      newFeatures.sort((a, b) => a.label.localeCompare(b.label));
      this.featuresSource.next(newFeatures);
      this.updateAvailableFeatures();
    });
  }

  updateAvailableFeatures() {
    const availableFeatures = this.featuresSource.value.filter(
      (f) =>
        !f.layer
    );
    this.availableFeatures.next(availableFeatures);

    const favoriteFeatures = availableFeatures.filter((f) => favoriteFeaturesList.includes(f.label.toLowerCase()));
    this.favoriteFeatures.next(favoriteFeatures);
  }

  doTagState(label: string) {
    this.tagStateSource.next(label);
  }

  reorderFeature(top: boolean) {
    this.reorderFeatureSource.next(top);
  }

  setSplitMode(splitMode: boolean) {
    this.splitSource.next(splitMode);
  }

  setMergeMode(mergeMode: boolean) {
    this.mergeModeSource.next(mergeMode);
  }

  getCurrentSession() {
    return this.sessionSource.getValue();
  }

  loadSession(session: Session) {
    this.sessionSource.next(session);
  }

  updateDrawHoleMode(drawHole: boolean) {
    this.drawHoleModeSource.next(drawHole);
  }

  updateDownloadData(data: string) {
    this.downloadSource.next(data);
  }

  selectSign(sign: Sign) {
    this.signSource.next(sign);
  }

  selectFeature(feature: any) {
    this.featureSource.next(feature);
  }

  deleteFeature(feature: any) {
    if (feature != null) {
      this.deleteFeatureSource.next(feature);
      this.featureSource.next(null);
    }
  }

  gotoHistory(key: string) {
    this.displayMode.next(DisplayMode.HISTORY);
    this.historyDateSource.next(key);
  }

  gotoCoordinate(coordinate: Coordinate) {
    this.coordinateSource.next(coordinate);
  }

  switchToLayer(layer: Layer) {
    this.layerSource.next(layer);
  }

  addFeatureLayer(layer: Layer) {
    this.addAdditionalLayerSource.next(layer);
  }

  removeFeatureLayer(layer: Layer) {
    this.removeAdditionalLayerSource.next(layer);
  }

  didChangeLayer() {
    this.layerChangedSource.next(true);
  }

  updateMapLayer(layer: Layer) {
    if (this.layerSource) {
      this.layerSource.next(layer);
    }
  }

  updateLayer(item: any) {
    item.layer.setOpacity(item.opacity);
  }

  setLayerOpacity(opacity) {
    this.layerSource.value.opacity = opacity;
    this.layerSource.value.olLayer.setOpacity(opacity);
    this.layerSource.next(this.layerSource.value);
    this.updateMapLayer(this.layerSource.value);
  }

  addRemoveFeature(feature: any) {
    if (feature.layer === undefined) {
      feature.opacity = 0.75;
      let maxIndex = Math.max(...this.selectedFeaturesSource.value.map(f => f.layer.getZIndex()));
      maxIndex = Number.isInteger(maxIndex) ? maxIndex + 1 : 0;
      feature.layer = createGeoAdminLayer(
        feature.serverLayerName,
        feature.timestamps[0],
        feature.format,
        maxIndex
      );

      this.selectedFeaturesSource.value.unshift(feature);
      this.selectedFeaturesSource.next(this.selectedFeaturesSource.value);
    } else {
      this.removeFeatureLayer(feature.layer);
      feature.layer = undefined;
      this.selectedFeaturesSource.next(this.selectedFeaturesSource.value.filter(
        (f) => f !== feature
      ));
    }
    this.updateAvailableFeatures();
  }

  getAvailableLayers() {
    if (this.currentLayer) {
      return layers.filter((l) => l !== this.layerSource.value);
    }
    return layers;
  }

  toggleFeature(feature: any) {
    if (feature.opacity === 0) {
      feature.opacity = 0.75;
      this.updateLayer(feature);
    } else {
      feature.opacity = 0;
      this.updateLayer(feature);
    }
  }

  sortFeatureUp(index: any) {
    const previousZIndex = this.selectedFeaturesSource.value[index].layer.getZIndex();
    this.selectedFeaturesSource.value[index - 1].layer.setZIndex(previousZIndex);
    this.selectedFeaturesSource.value[index].layer.setZIndex(previousZIndex + 1);
    const newSelectedFeatures = this.selectedFeaturesSource.value.slice().sort((a, b) => b.layer.getZIndex() - a.layer.getZIndex());
    this.selectedFeaturesSource.next(newSelectedFeatures);
    this.didChangeLayer();
  }

  sortFeatureDown(index: any) {
    const previousZIndex = this.selectedFeaturesSource.value[index].layer.getZIndex();
    this.selectedFeaturesSource.value[index + 1].layer.setZIndex(previousZIndex);
    this.selectedFeaturesSource.value[index].layer.setZIndex(previousZIndex - 1);
    const newSelectedFeatures = this.selectedFeaturesSource.value.slice().sort((a, b) => b.layer.getZIndex() - a.layer.getZIndex());
    this.selectedFeaturesSource.next(newSelectedFeatures);
    this.didChangeLayer();
  }
}
