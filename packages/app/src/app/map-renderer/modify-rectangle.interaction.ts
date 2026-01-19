import type { Collection, Feature, MapBrowserEvent } from 'ol';
import { Polygon } from 'ol/geom';
import type { Coordinate } from 'ol/coordinate';
import type { CombinedOnSignature, EventTypes, OnSignature } from 'ol/Observable';
import type { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import type { ModifyEvent, ModifyOnSignature } from 'ol/interaction/Modify';
import Modify from 'ol/interaction/Modify';
import type { StyleLike } from 'ol/style/Style';
import type { FlatStyleLike } from 'ol/style/flat';
import type VectorSource from 'ol/source/Vector';
import { boundingExtent } from 'ol/extent';
import { fromExtent } from 'ol/geom/Polygon';

export type Options = {
  pixelTolerance?: number;
  style?: StyleLike | FlatStyleLike;
  source?: VectorSource;
  features?: Collection<Feature>;
};

export type MovePointConf = {
  modifyX: number[];
  modifyY: number[];
  edgeMove: boolean;
  selectedVertexIndex: number;
  polyIndex: number;
};

export class ModifyRectangleEvent extends BaseEvent {
  modifyFeature: Feature<Polygon>;
  movePointConf: MovePointConf;
  mapBrowserEvent: MapBrowserEvent<any>;
  constructor(
    type: string,
    modifyFeature: Feature<Polygon>,
    movePointConf: MovePointConf,
    mapBrowserEvent: MapBrowserEvent<any>,
  ) {
    super(type);

    this.modifyFeature = modifyFeature;
    this.movePointConf = movePointConf;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

export type ModifyRectangleEventTypes = 'modifyrectanglestart' | 'modifyrectangleend';

export type ModifyRectangleOnSignature<Return> = ModifyOnSignature<Return> &
  OnSignature<ModifyRectangleEventTypes, ModifyRectangleEvent, Return> &
  CombinedOnSignature<
    'propertychange' | 'change:active' | EventTypes | 'modifyend' | 'modifystart' | ModifyRectangleEventTypes,
    Return
  >;

export class ModifyRectangle extends Modify {
  private pixelTolerance: number;
  private movePointConf: MovePointConf | null = null;
  private modifyFeature: Feature<Polygon> | null = null;
  private modifyGeometry: Polygon | null = null;
  private updatePointsBinding: any = null;

  declare on: ModifyRectangleOnSignature<EventsKey>;
  declare once: ModifyRectangleOnSignature<EventsKey>;
  declare un: ModifyRectangleOnSignature<EventsKey>;

  constructor(options: Options) {
    super({ ...options, deleteCondition: () => false, pixelTolerance: options.pixelTolerance ?? 10 });
    this.pixelTolerance = options.pixelTolerance ?? 10;
    this.updatePointsBinding = this.updatePoints.bind(this);

    this.on('modifystart', this.startChange);
  }

  private startChange(event: ModifyEvent) {
    const features = event.features.getArray();
    if (features.length === 1) {
      const geometry = features[0].getGeometry();
      if (geometry instanceof Polygon) {
        this.modifyFeature = features[0] as Feature<Polygon>;
        this.modifyGeometry = geometry;
        this.findModifiedPoint(event.mapBrowserEvent);
        if (this.movePointConf === null) {
          this.getMap()!.once('pointermove', this.findModifiedPoint.bind(this));
        }
        this.getMap()!.on('pointermove', this.updatePointsBinding);
      }
    }
  }

  private endChange(event: ModifyEvent) {
    this.getMap()!.un('pointermove', this.updatePointsBinding);
    if (this.modifyGeometry && this.movePointConf) {
      this.adjustPoints(event.mapBrowserEvent.coordinate, this.modifyGeometry, true, this.movePointConf);
    }
    this.dispatchEvent({
      type: 'modifyrectangleend',
      modifyFeature: this.modifyFeature,
      movePointConf: this.movePointConf,
      mapBrowserEvent: event.mapBrowserEvent,
    } as any);
    this.movePointConf = null;
    this.modifyGeometry = null;
    this.modifyFeature = null;
  }

  private findModifiedPoint(event: MapBrowserEvent<any>) {
    if (this.modifyGeometry) {
      this.movePointConf = this.findIndexToModify(event.coordinate, this.modifyGeometry);

      if (this.movePointConf !== null) {
        this.dispatchEvent({
          type: 'modifyrectanglestart',
          modifyFeature: this.modifyFeature,
          movePointConf: this.movePointConf,
          mapBrowserEvent: event,
        } as ModifyRectangleEvent);
        this.once('modifyend', this.endChange.bind(this));
      }
    }
  }

  updatePoints(event: MapBrowserEvent<any>) {
    if (this.modifyGeometry && this.movePointConf) {
      this.adjustPoints(event.coordinate, this.modifyGeometry, false, this.movePointConf);
    }
  }

  findIndexToModify(mapCoord: Coordinate, rectangle: Polygon) {
    const coordinateTolerance = this.pixelTolerance * this.getMap()?.getView().getResolution()!;
    const coordinates = rectangle.getCoordinates();
    let selectedVertexIndex: number | null = null;
    let polyIndex = 0;
    for (; polyIndex < coordinates.length; polyIndex++) {
      for (let index = 0; index < coordinates[polyIndex].length; index++) {
        const vertex = coordinates[polyIndex][index];
        if (
          Math.abs(vertex[0] - mapCoord[0]) < coordinateTolerance &&
          Math.abs(vertex[1] - mapCoord[1]) < coordinateTolerance
        ) {
          selectedVertexIndex = index;
          break;
        }
      }
      if (selectedVertexIndex !== null) {
        break;
      }
    }
    if (selectedVertexIndex === null) {
      //try again next movement:
      this.getMap()!.once('pointermove', this.findModifiedPoint.bind(this));
      return null;
    }

    if (coordinates[polyIndex].length > 6 || coordinates[polyIndex].length < 5) {
      //something get wrong, cleanup polygon
      const extent = boundingExtent(coordinates[polyIndex]);
      const extentPoly = fromExtent(extent);
      coordinates[polyIndex] = extentPoly.getCoordinates()[0];
      rectangle.setCoordinates(coordinates);
      return null;
    }

    const modifyX: number[] = [selectedVertexIndex];
    const modifyY: number[] = [selectedVertexIndex];
    const prevIndex = selectedVertexIndex === 0 ? coordinates[polyIndex].length - 2 : selectedVertexIndex - 1;
    const nextIndex = selectedVertexIndex === coordinates[polyIndex].length - 2 ? 0 : selectedVertexIndex + 1;

    const lastIndex = coordinates[polyIndex].length - 1;

    let edgeMove = false;
    if (coordinates[polyIndex].length === 6) {
      //new point added => draw edge not corner
      edgeMove = true;
      //x or y edge
      if (Math.abs(coordinates[polyIndex][prevIndex][0] - coordinates[polyIndex][nextIndex][0]) < Number.EPSILON) {
        modifyX.push(prevIndex);
        modifyX.push(nextIndex);
      } else {
        modifyY.push(prevIndex);
        modifyY.push(nextIndex);
      }
    } else {
      //check which axis is "same", compare to unchanged oposite side vertice
      const opositeSideIndex = selectedVertexIndex >= 2 ? selectedVertexIndex - 2 : selectedVertexIndex + 2;
      if (
        Math.abs(coordinates[polyIndex][prevIndex][0] - coordinates[polyIndex][opositeSideIndex][0]) >
          Math.abs(coordinates[polyIndex][prevIndex][1] - coordinates[polyIndex][opositeSideIndex][1]) ||
        Math.abs(coordinates[polyIndex][nextIndex][0] - coordinates[polyIndex][opositeSideIndex][0]) <
          Math.abs(coordinates[polyIndex][nextIndex][1] - coordinates[polyIndex][opositeSideIndex][1])
      ) {
        //change the axis that are not "same"
        modifyX.push(prevIndex);
        modifyY.push(nextIndex);
      } else {
        modifyY.push(prevIndex);
        modifyX.push(nextIndex);
      }
    }
    if (modifyX.includes(0)) {
      modifyX.push(lastIndex);
    }
    if (modifyY.includes(0)) {
      modifyY.push(lastIndex);
    }
    return { modifyX, modifyY, edgeMove, selectedVertexIndex, polyIndex };
  }

  adjustPoints(mapCoord: Coordinate, rectangle: Polygon, end: boolean, conf: MovePointConf) {
    const { modifyX, modifyY, edgeMove, selectedVertexIndex, polyIndex } = conf;
    const coordinates = rectangle.getCoordinates();

    for (const index of modifyX) {
      coordinates[polyIndex][index][0] = mapCoord[0];
    }
    for (const index of modifyY) {
      coordinates[polyIndex][index][1] = mapCoord[1];
    }

    if (edgeMove && end) {
      coordinates[polyIndex].splice(selectedVertexIndex, 1);
    }

    rectangle.setCoordinates(coordinates);
  }

  public cancel() {
    this.getMap()!.un('pointermove', this.updatePointsBinding);
  }
}
