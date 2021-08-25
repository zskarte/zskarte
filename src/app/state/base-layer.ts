import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ZsMapLayerState, ZsMapLayerStateType } from './interfaces';
import { StateService } from './state.service';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, RegularShape } from 'ol/style';
import Fill from 'ol/style/Fill';
import Feature from 'ol/Feature';
import { LineString, Point } from 'ol/geom';

export class ZsMapBaseLayer {
  protected _layer: Observable<ZsMapLayerState>;
  private _olSource = new VectorSource();
  public olLayer: VectorLayer = new VectorLayer({ source: this._olSource });

  constructor(protected _id: string, protected _state: StateService) {
    this._layer = this._state.observeMapState().pipe(
      map((o) => {
        if (o?.layers && o.layers.length > 0) {
          return o.layers.find((i) => i.id === this._id);
        }
      }),
      distinctUntilChanged((x, y) => x === y)
    );

    this.observePosition().subscribe((position) => {
      this.olLayer.setZIndex(position ? position * 100 : 100);
    });

    this.observeIsVisible().subscribe((isVisible) => {
      this.olLayer.setVisible(isVisible);
    });

    this.observeOpacity().subscribe((opacity) => {
      this.olLayer.setOpacity(opacity);
    });
  }

  public testAddPoint(coordinates: number[]): void {
    const feature = new Feature({
      geometry: new Point(coordinates),
    });
    feature.setStyle(
      new Style({
        image: new RegularShape({
          fill: new Fill({ color: 'red' }),
          // stroke: stroke,
          points: 4,
          radius: 10,
          angle: Math.PI / 4,
        }),
      })
    );
    this._olSource.addFeature(feature);
  }

  public getId(): string {
    return this._id;
  }

  public observeType(): Observable<ZsMapLayerStateType> {
    return this._layer.pipe(
      map(
        (o) => {
          return o?.type;
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public observeOpacity(): Observable<number> {
    return this._state.observeDisplayState().pipe(
      map(
        (o) => {
          return o?.layerOpacity?.[this._id] === undefined
            ? 1
            : o?.layerOpacity?.[this._id];
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public setOpacity(opacity: number): void {
    this._state.updateDisplayState((draft) => {
      draft.layerOpacity[this._id] = opacity;
    });
  }

  public observeName(): Observable<string> {
    return this._layer.pipe(
      map(
        (o) => {
          return o?.name;
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public setName(name: string): void {
    this._state.updateMapState((draft) => {
      const found = draft?.layers?.find((o) => o.id === this._id);
      if (found) {
        found.name = name;
      }
    });
  }

  public observeIsVisible(): Observable<boolean> {
    return this._state.observeDisplayState().pipe(
      map(
        (o) => {
          return o?.layerVisibility?.[this._id];
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public observeIsActive(): Observable<boolean> {
    return this._state.observeDisplayState().pipe(
      map(
        (o) => {
          return o?.activeLayer === this._id;
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public observePosition(): Observable<number> {
    return this._state.observeDisplayState().pipe(
      map(
        (o) => {
          return o?.layerOrder.findIndex((o) => o === this._id) + 1;
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  public show(): void {
    this._state.updateDisplayState((draft) => {
      draft.layerVisibility[this._id] = true;
    });
  }

  public hide(): void {
    this._state.updateDisplayState((draft) => {
      draft.layerVisibility[this._id] = false;
    });
  }

  public moveUp(): void {
    this._state.updateDisplayState((draft) => {
      const index = draft.layerOrder.findIndex((o) => o === this._id);
      draft.layerOrder.splice(index, 1);
      draft.layerOrder.splice(index + 1, 0, this._id);
    });
  }

  public moveDown(): void {
    this._state.updateDisplayState((draft) => {
      const index = draft.layerOrder.findIndex((o) => o === this._id);
      draft.layerOrder.splice(index, 1);
      draft.layerOrder.splice(index - 1, 0, this._id);
    });
  }

  public remove(): void {
    this._state.updateDisplayState((draft) => {
      delete draft.layerVisibility[this._id];
      delete draft.layerOpacity[this._id];
      const index = draft.layerOrder.findIndex((o) => o === this._id);
      if (index >= 0) {
        draft.layerOrder.splice(index, 1);
      }
    });
    this._state.updateMapState((draft) => {
      const index = draft.layers.findIndex((o) => o.id === this._id);
      draft.layers.splice(index, 1);
    });
    // this.olLayer = null;
  }

  public activate(): void {
    this._state.updateDisplayState((draft) => {
      draft.activeLayer = this._id;
    });
  }
}
