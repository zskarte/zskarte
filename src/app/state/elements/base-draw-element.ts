import { Feature } from 'ol';
import { Observable } from 'rxjs';
import { IZsMapBaseDrawElementState } from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseElement } from './base-element';
import { Draw } from 'ol/interaction';
import GeometryType from 'ol/geom/GeometryType';
import VectorSource from 'ol/source/Vector';
import { Options } from 'ol/interaction/Draw';
import { Geometry } from 'ol/geom';
import { distinctUntilChanged, map } from 'rxjs/operators';

export abstract class ZsMapBaseDrawElement<
  T = IZsMapBaseDrawElementState
> extends ZsMapBaseElement<T> {
  protected _element: Observable<T>;
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);
    this._element = this._state.observeMapState().pipe(
      map(
        (o) => {
          return o.drawElements?.[this._id];
        },
        distinctUntilChanged((x, y) => x === y)
      )
    );
  }

  // public observeCoordinates(): Observable<number[] | number[][]> {
  //   return this._element.pipe(map((o) => {
  //     return o;
  //   }))
  // }

  // static handlers for drawing
  public static getOlDrawHandler(state: StateService, layer: string): Draw {
    const draw = new Draw(
      this._enhanceOlDrawOptions({
        source: new VectorSource({ wrapX: false }),
        type: this._getOlDrawType(),
      })
    );
    draw.on('drawend', (event) => {
      this._parseFeature(event.feature, state, layer);
    });
    return draw;
  }
  protected static _getOlDrawType(): GeometryType {
    throw new Error('static fn _getOlDrawType is not implemented');
  }
  protected static _enhanceOlDrawOptions(options: Options) {
    return options;
  }
  protected static _parseFeature(
    event: Feature<Geometry>,
    state: StateService,
    layer: string
  ): void {
    throw new Error('static fn _parseFeature is not implemented');
  }
}
