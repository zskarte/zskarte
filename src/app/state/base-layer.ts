import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZsMapLayerState } from './interfaces';
import { StateService } from './state.service';

export class ZsMapBaseLayer {
  protected _layer: Observable<ZsMapLayerState>;

  constructor(protected _id: string, protected _state: StateService) {
    this._layer = this._state.observeMapState().pipe(
      map((o) => {
        if (o?.layers && o.layers.length > 0) {
          return o.layers.find((i) => i.id === this._id);
        }
      })
    );
  }

  public observeName(): Observable<string> {
    return this._layer.pipe(
      map((o) => {
        return o?.name;
      })
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

  observeIsVisible(): Observable<boolean> {
    return this._state.observeDisplayState().pipe(
      map((o) => {
        if (o?.visibleLayers?.length > 0) {
          return !!o.visibleLayers.find((id) => id === this._id);
        }
        return false;
      })
    );
  }

  public show(): void {
    this._state.updateDisplayState((draft) => {
      if (!draft.visibleLayers) {
        draft.visibleLayers = [];
      }
      if (!draft.visibleLayers.find((o) => o === this._id)) {
        draft.visibleLayers.push(this._id);
      }
    });
  }

  public hide(): void {
    this._state.updateDisplayState((draft) => {
      if (!draft.visibleLayers) {
        draft.visibleLayers = [];
      }
      const index = draft.visibleLayers.findIndex((o) => o === this._id);
      if (index >= 0) {
        draft.visibleLayers.splice(index, 1);
      }
    });
  }
}
