import { Feature } from 'ol';
import {
  ZsMapTextDrawElementState,
} from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseDrawElement } from './base-draw-element';
import GeometryType from 'ol/geom/GeometryType';
import { Polygon } from 'ol/geom';

export class ZsMapPolygonDrawElement extends ZsMapBaseDrawElement<ZsMapTextDrawElementState> {
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);
  }
  protected static _getOlDrawType(): GeometryType {
    return GeometryType.POLYGON;
  }
  protected static _parseFeature(
    feature: Feature<Polygon>,
    state: StateService,
    layer: string
  ): void {
    console.log('polygon drawn', feature.getGeometry().getCoordinates());
  }
}
