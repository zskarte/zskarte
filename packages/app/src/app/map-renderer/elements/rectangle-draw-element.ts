import { Feature } from 'ol';
import { ZsMapDrawElementStateType, ZsMapElementToDraw, ZsMapRectangleDrawElementState } from '@zskarte/types';
import { ZsMapStateService } from '../../state/state.service';
import { ZsMapBaseDrawElement } from './base/base-draw-element';
import { Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import { ZsMapOLFeatureProps } from './base/ol-feature-props';
import { takeUntil } from 'rxjs';
import { Draw } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import { KeyboardHelper } from '../../helper/keyboard';

export class ZsMapRectangleDrawElement extends ZsMapBaseDrawElement<ZsMapRectangleDrawElementState> {
  protected _olPolygon!: Polygon;
  constructor(
    protected override _id: string,
    protected override _state: ZsMapStateService,
  ) {
    super(_id, _state);
    this._olFeature.set(ZsMapOLFeatureProps.DRAW_ELEMENT_TYPE, ZsMapDrawElementStateType.POLYGON);
    this.observeCoordinates()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((coordinates) => {
        this._olPolygon?.setCoordinates(coordinates as any);
      });
  }

  protected _initialize(element: ZsMapRectangleDrawElementState): void {
    this._olPolygon = new Polygon(element.coordinates as any);
    this._olFeature.setGeometry(this._olPolygon);
  }

  protected static override _getOlDrawType(): Type {
    return 'Circle';
  }

  protected static override _parseFeature(
    feature: Feature<Polygon>,
    state: ZsMapStateService,
    element: ZsMapElementToDraw,
  ): void {
    const drawElement = state.addDrawElement({
      type: ZsMapDrawElementStateType.RECTANGLE,
      coordinates: (feature.getGeometry()?.getCoordinates() as any) || [],
      layer: element.layer,
    });
    state.setSelectedFeature(drawElement?.id);
  }

  public static override getOlDrawHandler(state: ZsMapStateService, element: ZsMapElementToDraw): Draw {
    const draw = new Draw({
      source: new VectorSource({ wrapX: false }),
      type: 'Circle',
      geometryFunction: (coords, geom) => {
        if (!geom) {
          geom = new Polygon([]);
        }
        const start = coords[0] as number[];
        let end = coords[1] as number[];
        if (KeyboardHelper.isShiftPressed()) {
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          const side = Math.max(absDx, absDy);
          end = [start[0] + (dx >= 0 ? side : -side), start[1] + (dy >= 0 ? side : -side)];
        }
        const boxCoords = [start, [start[0], end[1]], end, [end[0], start[1]], start];
        (geom as Polygon).setCoordinates([boxCoords]);
        return geom;
      },
    });
    draw.on('drawend', (event) => {
      this._parseFeature(event.feature as Feature<Polygon>, state, element);
    });
    return draw;
  }
}
