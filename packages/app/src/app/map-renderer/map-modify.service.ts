import { Injectable, inject } from '@angular/core';
import { Collection, Feature } from 'ol';
import { FeatureLike } from 'ol/Feature';
import OlView from 'ol/View';
import { SimpleGeometry } from 'ol/geom';
import { Modify } from 'ol/interaction';
import { ZsMapDrawElementStateType } from '../../../../types';
import { areCoordinatesEqual } from '../helper/coordinates';
import { ZsMapStateService } from '../state/state.service';
import { DrawStyle } from './draw-style';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { MapOverlayService } from './map-overlay.service';
import { MapRendererService } from './map-renderer.service';
import { MapSelectService } from './map-select.service';

@Injectable({
  providedIn: 'root',
})
export class MapModifyService {
  private _modifyCache = new Collection<Feature>([]);
  private _modify!: Modify;
  private _currentSketch: FeatureLike | undefined;
  private _select!: MapSelectService;
  private _overlay!: MapOverlayService;
  private _renderer!: MapRendererService;
  private _state!: ZsMapStateService;
  private _view!: OlView;

  initialize({
    view,
    _state,
    _overlay,
    _renderer,
    _select,
  }: {
    view: OlView;
    _state: ZsMapStateService;
    _overlay: MapOverlayService;
    _renderer: MapRendererService;
    _select: MapSelectService;
  }): Modify {
    this._state = _state;
    this._overlay = _overlay;
    this._select = _select;
    this._renderer = _renderer;
    this._view = view;
    this._modify = new Modify({
      features: this._modifyCache,
      condition: () => {
        if (!this.areFeaturesModifiable() || this._state.isReadOnly()) {
          this._overlay.toggleEditButtons(false);
          return false;
        }

        if (this._modify['vertexFeature_'] && this._modify['lastPointerEvent_']) {
          this._select.updateVertexPoint(this._modify['vertexFeature_'].getGeometry().getCoordinates());
          this._overlay.toggleEditButtons(true);
        }
        return true;
      },
    });

    this._modify.on('modifystart', (event) => {
      this._currentSketch = this._renderer.getFeatureInsideCluster(event.features.getArray()[0]);
      this._overlay.toggleEditButtons(false);
      this._state.setHideSelectedFeature(true);
    });

    this._modify.on('modifyend', (e) => {
      this._state.setHideSelectedFeature(false);

      if (e.features.getLength() <= 0) {
        return;
      }

      this._currentSketch = undefined;
      // only first feature is relevant
      const feature = this._renderer.getFeatureInsideCluster(e.features.getArray()[0] as Feature<SimpleGeometry>);
      const element = this._renderer.getCachedDrawElement(feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
      element?.element?.setCoordinates(feature.getGeometry()?.getCoordinates() ?? []);
      if (this._modify['vertexFeature_']) {
        this._select.updateVertexPoint(this._modify['vertexFeature_'].getGeometry().getCoordinates());
        const type = element.element.elementState?.type;
        const symbolCoordinates = DrawStyle.getIconCoordinates(feature, this._view.getResolution() ?? 1)[0];
        const modifyCoordinates = e.mapBrowserEvent.coordinate;
        const toggleRotate =
          type === ZsMapDrawElementStateType.SYMBOL && areCoordinatesEqual(symbolCoordinates, modifyCoordinates);
        this._overlay.toggleEditButtons(true, toggleRotate);
      }
    });

    return this._modify;
  }

  public areFeaturesModifiable() {
    return (
      !this._state.isReadOnly() &&
      this._modifyCache.getArray().every((clusterOrFeature) => {
        const feature = this._renderer.getFeatureInsideCluster(clusterOrFeature);

        // If the feature is a ZS DrawElement, ensure it's not protected
        // Else it's a cluster, ensure it's a cluster with a single feature
        if (clusterOrFeature.get(ZsMapOLFeatureProps.IS_DRAW_ELEMENT)) {
          return feature.get('sig') && !feature.get('sig').protected;
        } else {
          return (clusterOrFeature.get('features')?.length ?? 0) <= 1;
        }
      })
    );
  }

  public clearCache() {
    this._modifyCache.clear();
  }

  public addToCache(feature: Feature) {
    this._modifyCache.push(feature);
  }
}
