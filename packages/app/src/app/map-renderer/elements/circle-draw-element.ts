import { Feature } from 'ol';
import { ZsMapCircleDrawElementState, ZsMapDrawElementStateType, ZsMapElementToDraw } from '@zskarte/types';
import { ZsMapStateService } from '../../state/state.service';
import { ZsMapBaseDrawElement } from './base/base-draw-element';
import { Circle } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import { ZsMapOLFeatureProps } from './base/ol-feature-props';
import { distinctUntilChanged, map, takeUntil } from 'rxjs';
import { Draw } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import { KeyboardHelper } from '../../helper/keyboard';

export class ZsMapCircleDrawElement extends ZsMapBaseDrawElement<ZsMapCircleDrawElementState> {
  protected _olCircle!: Circle;
  constructor(
    protected override _id: string,
    protected override _state: ZsMapStateService,
  ) {
    super(_id, _state);
    this._olFeature.set(ZsMapOLFeatureProps.DRAW_ELEMENT_TYPE, ZsMapDrawElementStateType.CIRCLE);
    
    // Observe element changes to trigger initialization when center exists
    this._element.pipe(
      takeUntil(this._unsubscribe),
    ).subscribe((element) => {
      const circleElement = element as ZsMapCircleDrawElementState;
      if (circleElement?.center && !this._isInitialized) {
        this._initialize(circleElement);
        this._isInitialized = true;
      }
    });
    
    // Observe center changes
    this._element.pipe(
      map((o) => (o as ZsMapCircleDrawElementState)?.center),
      distinctUntilChanged((x, y) => x?.[0] === y?.[0] && x?.[1] === y?.[1]),
      takeUntil(this._unsubscribe),
    ).subscribe((center) => {
      if (center && this._olCircle) {
        this._olCircle.setCenter(center);
      }
    });
    
    // Observe radius changes
    this._element.pipe(
      map((o) => (o as ZsMapCircleDrawElementState)?.radius),
      distinctUntilChanged(),
      takeUntil(this._unsubscribe),
    ).subscribe((radius) => {
      if (radius !== undefined && this._olCircle) {
        this._olCircle.setRadius(radius);
      }
    });
  }

  protected _initialize(element: ZsMapCircleDrawElementState): void {
    const center = element.center || [0, 0];
    const radius = element.radius || 0;
    this._olCircle = new Circle(center, radius);
    this._olFeature.setGeometry(this._olCircle);
  }

  protected static override _getOlDrawType(): Type {
    return 'Circle';
  }

  protected static override _parseFeature(feature: Feature<Circle>, state: ZsMapStateService, element: ZsMapElementToDraw): void {
    const geometry = feature.getGeometry();
    const center = geometry?.getCenter() || [0, 0];
    const radius = geometry?.getRadius() || 0;
    
    const drawElement = state.addDrawElement({
      type: ZsMapDrawElementStateType.CIRCLE,
      center,
      radius,
      layer: element.layer,
    });
    state.setSelectedFeature(drawElement?.id);
  }

  public static override getOlDrawHandler(state: ZsMapStateService, element: ZsMapElementToDraw): Draw {
    const draw = new Draw({
      source: new VectorSource({ wrapX: false }),
      type: 'Circle',
      geometryFunction: (coords, geom) => {
        const start = coords[0] as number[];
        let end = coords[1] as number[];
        
        if (!end) {
          // No end point yet, create a zero-radius circle at start
          if (!geom) {
            geom = new Circle(start, 0);
          }
          return geom;
        }
        
        // Calculate center as midpoint between start and end
        let center: number[];
        let radius: number;
        
        if (KeyboardHelper.isShiftPressed()) {
          // Shift pressed: make a perfect circle (square bounding box)
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          const side = Math.max(absDx, absDy);
          end = [start[0] + (dx >= 0 ? side : -side), start[1] + (dy >= 0 ? side : -side)];
          center = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
          radius = side / 2;
        } else {
          // Normal oval/ellipse - but Circle geometry can only be a circle
          // Use the larger of the two radii for a circle that fits the bounding box
          center = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
          const radiusX = Math.abs(end[0] - start[0]) / 2;
          const radiusY = Math.abs(end[1] - start[1]) / 2;
          radius = Math.max(radiusX, radiusY);
        }
        
        if (!geom) {
          geom = new Circle(center, radius);
        } else {
          (geom as Circle).setCenter(center);
          (geom as Circle).setRadius(radius);
        }
        return geom;
      },
    });
    draw.on('drawend', (event) => {
      this._parseFeature(event.feature as Feature<Circle>, state, element);
    });
    return draw;
  }
  
  // Override setCoordinates to handle Circle geometry (center + radius)
  public setCircleGeometry(center: number[], radius: number): void {
    this._state.updateMapState((draft) => {
      const element = draft.drawElements?.[this._id] as ZsMapCircleDrawElementState;
      if (element) {
        element.center = center;
        element.radius = radius;
      }
    });
  }
}
