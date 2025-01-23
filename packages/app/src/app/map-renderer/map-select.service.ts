import { Injectable } from '@angular/core';
import Feature, { FeatureLike } from 'ol/Feature';
import { SimpleGeometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { ZsMapDrawElementStateType } from '../../../../types';
import { ZsMapStateService } from '../state/state.service';
import { DrawStyle } from './draw-style';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { MapModifyService } from './map-modify.service';
import { MapOverlayService } from './map-overlay.service';
import { MapRendererService } from './map-renderer.service';

@Injectable({
  providedIn: 'root',
})
export class MapSelectService {
  private _vertexPoint = new BehaviorSubject<number[] | null>(null);
  private _select!: Select;
  private _state!: ZsMapStateService;
  private _modify!: MapModifyService;
  private _overlay!: MapOverlayService;
  private _renderer!: MapRendererService;
  public selectedFeature = new BehaviorSubject<Feature<SimpleGeometry> | undefined>(undefined);

  initialize({
    _state,
    _modify,
    _overlay,
    _renderer,
  }: {
    _state: ZsMapStateService;
    _modify: MapModifyService;
    _overlay: MapOverlayService;
    _renderer: MapRendererService;
  }): Select {
    this._state = _state;
    this._modify = _modify;
    this._overlay = _overlay;
    this._renderer = _renderer;

    this._state.observeSelectedElement$().subscribe((element) => {
      if (element) {
        this.selectedFeature.next(element.getOlFeature() as Feature<SimpleGeometry>);
      } else {
        this.selectedFeature.next(undefined);
        this._overlay.toggleEditButtons(false);
      }
    });

    this._select = new Select({
      hitTolerance: 10,
      style: (feature: FeatureLike, resolution: number) => {
        return DrawStyle.styleFunctionSelect(feature, resolution, true);
      },
      layers: _renderer.getLayers(),
    });

    this._state.observeSelectedFeature$().subscribe((element) => {
      if (!element) {
        this._select.getFeatures().clear();
      }
    });
    this._select.on('select', (event) => {
      this._modify.clearCache();
      this._overlay.toggleEditButtons(false);
      for (const cluster of event.selected) {
        const feature = this._renderer.getFeatureInsideCluster(cluster);
        const nextElement = this._renderer.getCachedDrawElement(feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));

        if (this._state.isMergeMode()) {
          const selectedElement = this._renderer.getCachedDrawElement(
            this.selectedFeature.getValue()?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID),
          );
          this._state.mergePolygons(selectedElement.element, nextElement.element);
        } else {
          if (feature && !feature.get('sig')?.protected) {
            this._modify.addToCache(feature);

            // Only add the cluster to the modify cache if we are in clustering mode
            if (feature !== cluster) {
              this._modify.addToCache(cluster);
            }
          }
          this._state.setSelectedFeature(feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
          // reset selectedVertexPoint, since we selected a whole feature.
          this._vertexPoint.next(DrawStyle.getIconCoordinates(feature, _renderer.getView().getResolution() ?? 1)[1]);

          // only show buttons on select for Symbols
          if (
            !this._state.isReadOnly() &&
            nextElement?.element?.elementState?.type === ZsMapDrawElementStateType.SYMBOL
          ) {
            this._overlay.toggleEditButtons(true, true);
          }
        }
      }

      if (event.selected.length === 0) {
        this._state.resetSelectedFeature();
      }
    });

    return this._select;
  }

  updateVertexPoint(point: number[] | null) {
    this._vertexPoint.next(point);
  }

  observeVertexPoint(): Observable<number[] | null> {
    return this._vertexPoint.asObservable();
  }

  getVertexPoint(): number[] | null {
    return this._vertexPoint.value;
  }

  getFeature(): Feature<SimpleGeometry> | undefined {
    return this.selectedFeature.value;
  }
}
