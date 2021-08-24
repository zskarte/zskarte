import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/index';
import { Sign } from './entity/sign';
import { Coordinate } from './entity/coordinate';
import { Session } from './entity/session';
import { Layer } from './layers/layer';
import { DisplayMode } from './entity/displayMode';

@Injectable({
  providedIn: 'root',
})
export class SharedStateService {
  public displayMode = new BehaviorSubject<DisplayMode>(
    SharedStateService.getFromQueryParam(
      'mode',
      { draw: DisplayMode.DRAW, history: DisplayMode.HISTORY },
      DisplayMode.DRAW
    )
  );

  private layerSource = new BehaviorSubject<Layer>(null);
  currentLayer = this.layerSource.asObservable();

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
}
