import { Feature } from 'ol';
import {
  ZsMapDrawElementStateType,
  ZsMapTextDrawElementState,
} from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseDrawElement } from './base-draw-element';
import GeometryType from 'ol/geom/GeometryType';
import { Point } from 'ol/geom';

export class ZsMapSymbolDrawElement extends ZsMapBaseDrawElement<ZsMapTextDrawElementState> {
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);

    // this._element.
  }
  protected static _getOlDrawType(): GeometryType {
    return GeometryType.POINT;
  }
  protected static _parseFeature(
    feature: Feature<Point>,
    state: StateService,
    layer: string
  ): void {
    state.addDrawElement({
      type: ZsMapDrawElementStateType.SYMBOL,
      coordinates: feature.getGeometry().getCoordinates(),
      layer,
      symbol: null,
    });
  }
}
