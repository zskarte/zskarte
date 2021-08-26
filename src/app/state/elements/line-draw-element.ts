import { Feature } from 'ol';
import {
  ZsMapTextDrawElementState,
} from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseDrawElement } from './base-draw-element';
import GeometryType from 'ol/geom/GeometryType';
import { LineString } from 'ol/geom';

export class ZsMapLineDrawElement extends ZsMapBaseDrawElement<ZsMapTextDrawElementState> {
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);
  }
  protected static _getOlDrawType(): GeometryType {
    return GeometryType.LINE_STRING;
  }
  protected static _parseFeature(
    feature: Feature<LineString>,
    state: StateService,
    layer: string
  ): void {
    console.log('line drawn', feature, feature.getGeometry());
  }
}
