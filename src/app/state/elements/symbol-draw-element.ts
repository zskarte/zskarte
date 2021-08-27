import { Feature } from 'ol';
import {
  ZsMapDrawElementStateType,
  ZsMapTextDrawElementState,
} from '../interfaces';
import { StateService } from '../state.service';
import { ZsMapBaseDrawElement } from './base-draw-element';
import GeometryType from 'ol/geom/GeometryType';
import { Point } from 'ol/geom';
import { Fill, RegularShape, Style } from 'ol/style';

export class ZsMapSymbolDrawElement extends ZsMapBaseDrawElement<ZsMapTextDrawElementState> {
  protected _olPoint: Point;
  protected _olStyles: Style;
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);

    this.observeCoordinates().subscribe((coordinates) => {
      if (
        !this._olPoint &&
        coordinates &&
        coordinates !== this._olPoint.getCoordinates()
      ) {
        this._olPoint.setCoordinates(coordinates);
      }
    });
  }

  protected _initialize(coordinates: number[] | number[][]): void {
    this._olPoint = new Point(coordinates as number[]);
    this._olStyles = new Style({
      image: new RegularShape({
        fill: new Fill({ color: 'red' }),
        points: 4,
        radius: 10,
        angle: Math.PI / 4,
      }),
    });
    this._olFeature.setGeometry(this._olPoint);
    this._olFeature.setStyle(this._olStyles);

    // handle changes on the map, eg. translate
    this._olFeature.on('change', (event) => {
      console.log('TODO update coordinates', this._olPoint.getCoordinates());
      this.setCoordinates(this._olPoint.getCoordinates());
    });
    this._isInitialized = true;
    return;
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
