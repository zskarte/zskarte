import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import produce from 'immer';
import {
  IZsMapDisplayState,
  IZsMapState,
  ZsMapDisplayMode,
  ZsMapLayerState,
  ZsMapLayerStateType,
  ZsMapStateSource,
} from './interfaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ZsMapBaseLayer } from './base-layer';
import { v4 as uuidv4 } from 'uuid';
import { ZsMapDrawLayer } from './draw-layer';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private _map = new BehaviorSubject<IZsMapState>(
    produce<IZsMapState>(null, (draft) => {
      return {} as any;
    })
  );

  private _display = new BehaviorSubject<IZsMapDisplayState>(
    produce<IZsMapDisplayState>(null, (draft) => {
      draft = {
        displayMode: ZsMapDisplayMode.DRAW,
        currentLayer: null,
        visibleLayers: [],
      };
    })
  );

  constructor() {}

  public loadMap(map: IZsMapState) {
    console.log('load map', map);
    this.updateMapState((draft) => {
      return map;
    });
  }

  public observeMapState(): Observable<IZsMapState> {
    return this._map.asObservable();
  }

  public observeDisplayState(): Observable<IZsMapDisplayState> {
    return this._display.asObservable();
  }

  // source
  public observeMapSource(): Observable<ZsMapStateSource> {
    return this._map.pipe(
      map((o) => {
        return o?.source;
      })
    );
  }

  public setMapSource(source: ZsMapStateSource) {
    this.updateMapState((draft) => {
      draft.source = source;
    });
  }

  // name
  public observeMapName(): Observable<string> {
    return this._map.pipe(
      map((o) => {
        return o?.name;
      })
    );
  }

  public setMapName(name: string) {
    this.updateMapState((draft) => {
      draft.name = name;
    });
  }

  // layers
  public observeLayers(): Observable<ZsMapDrawLayer[]> {
    return this._map.pipe(
      map((o) => {
        if (o?.layers) {
          const layers: ZsMapDrawLayer[] = [];
          for (const i of o.layers) {
            layers.push(new ZsMapDrawLayer(i.id, this));
          }
          return layers;
        }
        return [];
      })
    );
  }

  public addDrawLayer(): void {
    this._addLayer({ type: ZsMapLayerStateType.DRAW, elements: [] });
  }

  private _addLayer(layer: ZsMapLayerState): void {
    layer.id = uuidv4();
    if (!layer.name) {
      layer.name = 'Layer ' + layer.id; // TODO count
    }
    this.updateMapState((draft) => {
      if (!draft.layers) {
        draft.layers = [];
      }
      draft.layers.push(layer);
    });
    this.updateDisplayState((draft) => {
      if (!draft.visibleLayers) {
        draft.visibleLayers = [];
      }
      draft.visibleLayers.push(layer.id);
      draft.currentLayer = layer.id;
    });
  }

  public updateMapState(fn: (draft: IZsMapState) => void) {
    const newState = produce<IZsMapState>(this._map.value || ({} as any), fn);
    console.log('updated map state', newState);
    this._map.next(newState);
  }

  public updateDisplayState(fn: (draft: IZsMapDisplayState) => void): void {
    const newState = produce<IZsMapDisplayState>(
      this._display.value || ({} as any),
      fn
    );
    console.log('updated display state', newState);
    this._display.next(newState);
  }
}
