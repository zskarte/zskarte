import { Feature } from 'ol';
import { Observable } from 'rxjs';
import {
  ZsMapDrawElementStateType,
  ZsMapTextDrawElementState,
} from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseDrawElement } from './base-draw-element';
import GeometryType from 'ol/geom/GeometryType';
import { Point } from 'ol/geom';

export class ZsMapTextDrawElement extends ZsMapBaseDrawElement<ZsMapTextDrawElementState> {
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);
  }
  protected static _getOlDrawType(): GeometryType {
    return GeometryType.POINT;
  }
  protected static _parseFeature(
    feature: Feature<Point>,
    state: StateService,
    layer: string,
  ): void {
    state.addDrawElement({
      type: ZsMapDrawElementStateType.TEXT,
      layer,
      coordinates: feature.getGeometry().getCoordinates(),
    });
  }
}
