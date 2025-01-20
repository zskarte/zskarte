import {
  Vector_default
} from "./chunk-5TEGD4TJ.js";
import {
  Vector_default as Vector_default2
} from "./chunk-Y6NY3J2U.js";
import {
  Feature_default
} from "./chunk-3XNX3BQI.js";
import {
  Circle_default,
  GeometryCollection_default,
  MultiLineString_default,
  MultiPolygon_default
} from "./chunk-NRWZHYJK.js";
import {
  MultiPoint_default
} from "./chunk-4POCNJOL.js";
import {
  LineString_default
} from "./chunk-GK7HTIGR.js";
import {
  MapBrowserEventType_default,
  MapBrowserEvent_default,
  Pointer_default,
  Property_default,
  always,
  never,
  noModifierKeys,
  shiftKeyOnly
} from "./chunk-UA3ZW3R6.js";
import {
  createEditingStyle
} from "./chunk-QX64YE7P.js";
import {
  Polygon_default,
  fromCircle,
  makeRegular
} from "./chunk-CPUVTREV.js";
import {
  Point_default
} from "./chunk-BYB6RSDC.js";
import {
  getStrideForLayout
} from "./chunk-S6ZHCVSZ.js";
import {
  distance,
  fromUserCoordinate,
  getUserProjection,
  squaredDistance as squaredDistance2
} from "./chunk-QPOUXWMH.js";
import {
  boundingExtent,
  getBottomLeft,
  getBottomRight,
  getTopLeft,
  getTopRight
} from "./chunk-IHYRLUFT.js";
import {
  EventType_default,
  Event_default,
  FALSE,
  TRUE
} from "./chunk-X7DDFSZC.js";
import {
  clamp,
  squaredDistance,
  toFixed
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/interaction/Draw.js
var DrawEventType = {
  /**
   * Triggered upon feature draw start
   * @event DrawEvent#drawstart
   * @api
   */
  DRAWSTART: "drawstart",
  /**
   * Triggered upon feature draw end
   * @event DrawEvent#drawend
   * @api
   */
  DRAWEND: "drawend",
  /**
   * Triggered upon feature draw abortion
   * @event DrawEvent#drawabort
   * @api
   */
  DRAWABORT: "drawabort"
};
var DrawEvent = class extends Event_default {
  /**
   * @param {DrawEventType} type Type.
   * @param {Feature} feature The feature drawn.
   */
  constructor(type, feature) {
    super(type);
    this.feature = feature;
  }
};
function getTraceTargets(coordinate, features) {
  const targets = [];
  for (let i = 0; i < features.length; ++i) {
    const feature = features[i];
    const geometry = feature.getGeometry();
    appendGeometryTraceTargets(coordinate, geometry, targets);
  }
  return targets;
}
function getSquaredDistance(a, b) {
  return squaredDistance(a[0], a[1], b[0], b[1]);
}
function getCoordinate(coordinates, index) {
  const count = coordinates.length;
  if (index < 0) {
    return coordinates[index + count];
  }
  if (index >= count) {
    return coordinates[index - count];
  }
  return coordinates[index];
}
function getCumulativeSquaredDistance(coordinates, startIndex, endIndex) {
  let lowIndex, highIndex;
  if (startIndex < endIndex) {
    lowIndex = startIndex;
    highIndex = endIndex;
  } else {
    lowIndex = endIndex;
    highIndex = startIndex;
  }
  const lowWholeIndex = Math.ceil(lowIndex);
  const highWholeIndex = Math.floor(highIndex);
  if (lowWholeIndex > highWholeIndex) {
    const start = interpolateCoordinate(coordinates, lowIndex);
    const end = interpolateCoordinate(coordinates, highIndex);
    return getSquaredDistance(start, end);
  }
  let sd = 0;
  if (lowIndex < lowWholeIndex) {
    const start = interpolateCoordinate(coordinates, lowIndex);
    const end = getCoordinate(coordinates, lowWholeIndex);
    sd += getSquaredDistance(start, end);
  }
  if (highWholeIndex < highIndex) {
    const start = getCoordinate(coordinates, highWholeIndex);
    const end = interpolateCoordinate(coordinates, highIndex);
    sd += getSquaredDistance(start, end);
  }
  for (let i = lowWholeIndex; i < highWholeIndex - 1; ++i) {
    const start = getCoordinate(coordinates, i);
    const end = getCoordinate(coordinates, i + 1);
    sd += getSquaredDistance(start, end);
  }
  return sd;
}
function appendGeometryTraceTargets(coordinate, geometry, targets) {
  if (geometry instanceof LineString_default) {
    appendTraceTarget(coordinate, geometry.getCoordinates(), false, targets);
    return;
  }
  if (geometry instanceof MultiLineString_default) {
    const coordinates = geometry.getCoordinates();
    for (let i = 0, ii = coordinates.length; i < ii; ++i) {
      appendTraceTarget(coordinate, coordinates[i], false, targets);
    }
    return;
  }
  if (geometry instanceof Polygon_default) {
    const coordinates = geometry.getCoordinates();
    for (let i = 0, ii = coordinates.length; i < ii; ++i) {
      appendTraceTarget(coordinate, coordinates[i], true, targets);
    }
    return;
  }
  if (geometry instanceof MultiPolygon_default) {
    const polys = geometry.getCoordinates();
    for (let i = 0, ii = polys.length; i < ii; ++i) {
      const coordinates = polys[i];
      for (let j = 0, jj = coordinates.length; j < jj; ++j) {
        appendTraceTarget(coordinate, coordinates[j], true, targets);
      }
    }
    return;
  }
  if (geometry instanceof GeometryCollection_default) {
    const geometries = geometry.getGeometries();
    for (let i = 0; i < geometries.length; ++i) {
      appendGeometryTraceTargets(coordinate, geometries[i], targets);
    }
    return;
  }
}
var sharedUpdateInfo = {
  index: -1,
  endIndex: NaN
};
function getTraceTargetUpdate(coordinate, traceState, map, snapTolerance) {
  const x = coordinate[0];
  const y = coordinate[1];
  let closestTargetDistance = Infinity;
  let newTargetIndex = -1;
  let newEndIndex = NaN;
  for (let targetIndex = 0; targetIndex < traceState.targets.length; ++targetIndex) {
    const target = traceState.targets[targetIndex];
    const coordinates = target.coordinates;
    let minSegmentDistance = Infinity;
    let endIndex;
    for (let coordinateIndex = 0; coordinateIndex < coordinates.length - 1; ++coordinateIndex) {
      const start = coordinates[coordinateIndex];
      const end = coordinates[coordinateIndex + 1];
      const rel = getPointSegmentRelationship(x, y, start, end);
      if (rel.squaredDistance < minSegmentDistance) {
        minSegmentDistance = rel.squaredDistance;
        endIndex = coordinateIndex + rel.along;
      }
    }
    if (minSegmentDistance < closestTargetDistance) {
      closestTargetDistance = minSegmentDistance;
      if (target.ring && traceState.targetIndex === targetIndex) {
        if (target.endIndex > target.startIndex) {
          if (endIndex < target.startIndex) {
            endIndex += coordinates.length;
          }
        } else if (target.endIndex < target.startIndex) {
          if (endIndex > target.startIndex) {
            endIndex -= coordinates.length;
          }
        }
      }
      newEndIndex = endIndex;
      newTargetIndex = targetIndex;
    }
  }
  const newTarget = traceState.targets[newTargetIndex];
  let considerBothDirections = newTarget.ring;
  if (traceState.targetIndex === newTargetIndex && considerBothDirections) {
    const newCoordinate = interpolateCoordinate(newTarget.coordinates, newEndIndex);
    const pixel = map.getPixelFromCoordinate(newCoordinate);
    if (distance(pixel, traceState.startPx) > snapTolerance) {
      considerBothDirections = false;
    }
  }
  if (considerBothDirections) {
    const coordinates = newTarget.coordinates;
    const count = coordinates.length;
    const startIndex = newTarget.startIndex;
    const endIndex = newEndIndex;
    if (startIndex < endIndex) {
      const forwardDistance = getCumulativeSquaredDistance(coordinates, startIndex, endIndex);
      const reverseDistance = getCumulativeSquaredDistance(coordinates, startIndex, endIndex - count);
      if (reverseDistance < forwardDistance) {
        newEndIndex -= count;
      }
    } else {
      const reverseDistance = getCumulativeSquaredDistance(coordinates, startIndex, endIndex);
      const forwardDistance = getCumulativeSquaredDistance(coordinates, startIndex, endIndex + count);
      if (forwardDistance < reverseDistance) {
        newEndIndex += count;
      }
    }
  }
  sharedUpdateInfo.index = newTargetIndex;
  sharedUpdateInfo.endIndex = newEndIndex;
  return sharedUpdateInfo;
}
function appendTraceTarget(coordinate, coordinates, ring, targets) {
  const x = coordinate[0];
  const y = coordinate[1];
  for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    const rel = getPointSegmentRelationship(x, y, start, end);
    if (rel.squaredDistance === 0) {
      const index = i + rel.along;
      targets.push({
        coordinates,
        ring,
        startIndex: index,
        endIndex: index
      });
      return;
    }
  }
}
var sharedRel = {
  along: 0,
  squaredDistance: 0
};
function getPointSegmentRelationship(x, y, start, end) {
  const x1 = start[0];
  const y1 = start[1];
  const x2 = end[0];
  const y2 = end[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  let along = 0;
  let px = x1;
  let py = y1;
  if (dx !== 0 || dy !== 0) {
    along = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy), 0, 1);
    px += dx * along;
    py += dy * along;
  }
  sharedRel.along = along;
  sharedRel.squaredDistance = toFixed(squaredDistance(x, y, px, py), 10);
  return sharedRel;
}
function interpolateCoordinate(coordinates, index) {
  const count = coordinates.length;
  let startIndex = Math.floor(index);
  const along = index - startIndex;
  if (startIndex >= count) {
    startIndex -= count;
  } else if (startIndex < 0) {
    startIndex += count;
  }
  let endIndex = startIndex + 1;
  if (endIndex >= count) {
    endIndex -= count;
  }
  const start = coordinates[startIndex];
  const x0 = start[0];
  const y0 = start[1];
  const end = coordinates[endIndex];
  const dx = end[0] - x0;
  const dy = end[1] - y0;
  return [x0 + dx * along, y0 + dy * along];
}
var Draw = class extends Pointer_default {
  /**
   * @param {Options} options Options.
   */
  constructor(options) {
    const pointerOptions = (
      /** @type {import("./Pointer.js").Options} */
      options
    );
    if (!pointerOptions.stopDown) {
      pointerOptions.stopDown = FALSE;
    }
    super(pointerOptions);
    this.on;
    this.once;
    this.un;
    this.shouldHandle_ = false;
    this.downPx_ = null;
    this.downTimeout_;
    this.lastDragTime_;
    this.pointerType_;
    this.freehand_ = false;
    this.source_ = options.source ? options.source : null;
    this.features_ = options.features ? options.features : null;
    this.snapTolerance_ = options.snapTolerance ? options.snapTolerance : 12;
    this.type_ = /** @type {import("../geom/Geometry.js").Type} */
    options.type;
    this.mode_ = getMode(this.type_);
    this.stopClick_ = !!options.stopClick;
    this.minPoints_ = options.minPoints ? options.minPoints : this.mode_ === "Polygon" ? 3 : 2;
    this.maxPoints_ = this.mode_ === "Circle" ? 2 : options.maxPoints ? options.maxPoints : Infinity;
    this.finishCondition_ = options.finishCondition ? options.finishCondition : TRUE;
    this.geometryLayout_ = options.geometryLayout ? options.geometryLayout : "XY";
    let geometryFunction = options.geometryFunction;
    if (!geometryFunction) {
      const mode = this.mode_;
      if (mode === "Circle") {
        geometryFunction = (coordinates, geometry, projection) => {
          const circle = geometry ? (
            /** @type {Circle} */
            geometry
          ) : new Circle_default([NaN, NaN]);
          const center = fromUserCoordinate(coordinates[0], projection);
          const squaredLength = squaredDistance2(center, fromUserCoordinate(coordinates[coordinates.length - 1], projection));
          circle.setCenterAndRadius(center, Math.sqrt(squaredLength), this.geometryLayout_);
          const userProjection = getUserProjection();
          if (userProjection) {
            circle.transform(projection, userProjection);
          }
          return circle;
        };
      } else {
        let Constructor;
        if (mode === "Point") {
          Constructor = Point_default;
        } else if (mode === "LineString") {
          Constructor = LineString_default;
        } else if (mode === "Polygon") {
          Constructor = Polygon_default;
        }
        geometryFunction = (coordinates, geometry, projection) => {
          if (geometry) {
            if (mode === "Polygon") {
              if (coordinates[0].length) {
                geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])], this.geometryLayout_);
              } else {
                geometry.setCoordinates([], this.geometryLayout_);
              }
            } else {
              geometry.setCoordinates(coordinates, this.geometryLayout_);
            }
          } else {
            geometry = new Constructor(coordinates, this.geometryLayout_);
          }
          return geometry;
        };
      }
    }
    this.geometryFunction_ = geometryFunction;
    this.dragVertexDelay_ = options.dragVertexDelay !== void 0 ? options.dragVertexDelay : 500;
    this.finishCoordinate_ = null;
    this.sketchFeature_ = null;
    this.sketchPoint_ = null;
    this.sketchCoords_ = null;
    this.sketchLine_ = null;
    this.sketchLineCoords_ = null;
    this.squaredClickTolerance_ = options.clickTolerance ? options.clickTolerance * options.clickTolerance : 36;
    this.overlay_ = new Vector_default({
      source: new Vector_default2({
        useSpatialIndex: false,
        wrapX: options.wrapX ? options.wrapX : false
      }),
      style: options.style ? options.style : getDefaultStyleFunction(),
      updateWhileInteracting: true
    });
    this.geometryName_ = options.geometryName;
    this.condition_ = options.condition ? options.condition : noModifierKeys;
    this.freehandCondition_;
    if (options.freehand) {
      this.freehandCondition_ = always;
    } else {
      this.freehandCondition_ = options.freehandCondition ? options.freehandCondition : shiftKeyOnly;
    }
    this.traceCondition_;
    this.setTrace(options.trace || false);
    this.traceState_ = {
      active: false
    };
    this.traceSource_ = options.traceSource || options.source || null;
    this.addChangeListener(Property_default.ACTIVE, this.updateState_);
  }
  /**
   * Toggle tracing mode or set a tracing condition.
   *
   * @param {boolean|import("../events/condition.js").Condition} trace A boolean to toggle tracing mode or an event
   *     condition that will be checked when a feature is clicked to determine if tracing should be active.
   */
  setTrace(trace) {
    let condition;
    if (!trace) {
      condition = never;
    } else if (trace === true) {
      condition = always;
    } else {
      condition = trace;
    }
    this.traceCondition_ = condition;
  }
  /**
   * Remove the interaction from its current map and attach it to the new map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {import("../Map.js").default} map Map.
   * @override
   */
  setMap(map) {
    super.setMap(map);
    this.updateState_();
  }
  /**
   * Get the overlay layer that this interaction renders sketch features to.
   * @return {VectorLayer} Overlay layer.
   * @api
   */
  getOverlay() {
    return this.overlay_;
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} and may actually draw or finish the drawing.
   * @param {import("../MapBrowserEvent.js").default} event Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @api
   * @override
   */
  handleEvent(event) {
    if (event.originalEvent.type === EventType_default.CONTEXTMENU) {
      event.originalEvent.preventDefault();
    }
    this.freehand_ = this.mode_ !== "Point" && this.freehandCondition_(event);
    let move = event.type === MapBrowserEventType_default.POINTERMOVE;
    let pass = true;
    if (!this.freehand_ && this.lastDragTime_ && event.type === MapBrowserEventType_default.POINTERDRAG) {
      const now = Date.now();
      if (now - this.lastDragTime_ >= this.dragVertexDelay_) {
        this.downPx_ = event.pixel;
        this.shouldHandle_ = !this.freehand_;
        move = true;
      } else {
        this.lastDragTime_ = void 0;
      }
      if (this.shouldHandle_ && this.downTimeout_ !== void 0) {
        clearTimeout(this.downTimeout_);
        this.downTimeout_ = void 0;
      }
    }
    if (this.freehand_ && event.type === MapBrowserEventType_default.POINTERDRAG && this.sketchFeature_ !== null) {
      this.addToDrawing_(event.coordinate);
      pass = false;
    } else if (this.freehand_ && event.type === MapBrowserEventType_default.POINTERDOWN) {
      pass = false;
    } else if (move && this.getPointerCount() < 2) {
      pass = event.type === MapBrowserEventType_default.POINTERMOVE;
      if (pass && this.freehand_) {
        this.handlePointerMove_(event);
        if (this.shouldHandle_) {
          event.originalEvent.preventDefault();
        }
      } else if (event.originalEvent.pointerType === "mouse" || event.type === MapBrowserEventType_default.POINTERDRAG && this.downTimeout_ === void 0) {
        this.handlePointerMove_(event);
      }
    } else if (event.type === MapBrowserEventType_default.DBLCLICK) {
      pass = false;
    }
    return super.handleEvent(event) && pass;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(event) {
    this.shouldHandle_ = !this.freehand_;
    if (this.freehand_) {
      this.downPx_ = event.pixel;
      if (!this.finishCoordinate_) {
        this.startDrawing_(event.coordinate);
      }
      return true;
    }
    if (!this.condition_(event)) {
      this.lastDragTime_ = void 0;
      return false;
    }
    this.lastDragTime_ = Date.now();
    this.downTimeout_ = setTimeout(() => {
      this.handlePointerMove_(new MapBrowserEvent_default(MapBrowserEventType_default.POINTERMOVE, event.map, event.originalEvent, false, event.frameState));
    }, this.dragVertexDelay_);
    this.downPx_ = event.pixel;
    return true;
  }
  /**
   * @private
   */
  deactivateTrace_() {
    this.traceState_ = {
      active: false
    };
  }
  /**
   * Activate or deactivate trace state based on a browser event.
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @private
   */
  toggleTraceState_(event) {
    if (!this.traceSource_ || !this.traceCondition_(event)) {
      return;
    }
    if (this.traceState_.active) {
      this.deactivateTrace_();
      return;
    }
    const map = this.getMap();
    const lowerLeft = map.getCoordinateFromPixel([event.pixel[0] - this.snapTolerance_, event.pixel[1] + this.snapTolerance_]);
    const upperRight = map.getCoordinateFromPixel([event.pixel[0] + this.snapTolerance_, event.pixel[1] - this.snapTolerance_]);
    const extent = boundingExtent([lowerLeft, upperRight]);
    const features = this.traceSource_.getFeaturesInExtent(extent);
    if (features.length === 0) {
      return;
    }
    const targets = getTraceTargets(event.coordinate, features);
    if (targets.length) {
      this.traceState_ = {
        active: true,
        startPx: event.pixel.slice(),
        targets,
        targetIndex: -1
      };
    }
  }
  /**
   * @param {TraceTarget} target The trace target.
   * @param {number} endIndex The new end index of the trace.
   * @private
   */
  addOrRemoveTracedCoordinates_(target, endIndex) {
    const previouslyForward = target.startIndex <= target.endIndex;
    const currentlyForward = target.startIndex <= endIndex;
    if (previouslyForward === currentlyForward) {
      if (previouslyForward && endIndex > target.endIndex || !previouslyForward && endIndex < target.endIndex) {
        this.addTracedCoordinates_(target, target.endIndex, endIndex);
      } else if (previouslyForward && endIndex < target.endIndex || !previouslyForward && endIndex > target.endIndex) {
        this.removeTracedCoordinates_(endIndex, target.endIndex);
      }
    } else {
      this.removeTracedCoordinates_(target.startIndex, target.endIndex);
      this.addTracedCoordinates_(target, target.startIndex, endIndex);
    }
  }
  /**
   * @param {number} fromIndex The start index.
   * @param {number} toIndex The end index.
   * @private
   */
  removeTracedCoordinates_(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return;
    }
    let remove = 0;
    if (fromIndex < toIndex) {
      const start = Math.ceil(fromIndex);
      let end = Math.floor(toIndex);
      if (end === toIndex) {
        end -= 1;
      }
      remove = end - start + 1;
    } else {
      const start = Math.floor(fromIndex);
      let end = Math.ceil(toIndex);
      if (end === toIndex) {
        end += 1;
      }
      remove = start - end + 1;
    }
    if (remove > 0) {
      this.removeLastPoints_(remove);
    }
  }
  /**
   * @param {TraceTarget} target The trace target.
   * @param {number} fromIndex The start index.
   * @param {number} toIndex The end index.
   * @private
   */
  addTracedCoordinates_(target, fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return;
    }
    const coordinates = [];
    if (fromIndex < toIndex) {
      const start = Math.ceil(fromIndex);
      let end = Math.floor(toIndex);
      if (end === toIndex) {
        end -= 1;
      }
      for (let i = start; i <= end; ++i) {
        coordinates.push(getCoordinate(target.coordinates, i));
      }
    } else {
      const start = Math.floor(fromIndex);
      let end = Math.ceil(toIndex);
      if (end === toIndex) {
        end += 1;
      }
      for (let i = start; i >= end; --i) {
        coordinates.push(getCoordinate(target.coordinates, i));
      }
    }
    if (coordinates.length) {
      this.appendCoordinates(coordinates);
    }
  }
  /**
   * Update the trace.
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @private
   */
  updateTrace_(event) {
    const traceState = this.traceState_;
    if (!traceState.active) {
      return;
    }
    if (traceState.targetIndex === -1) {
      if (distance(traceState.startPx, event.pixel) < this.snapTolerance_) {
        return;
      }
    }
    const updatedTraceTarget = getTraceTargetUpdate(event.coordinate, traceState, this.getMap(), this.snapTolerance_);
    if (traceState.targetIndex !== updatedTraceTarget.index) {
      if (traceState.targetIndex !== -1) {
        const oldTarget = traceState.targets[traceState.targetIndex];
        this.removeTracedCoordinates_(oldTarget.startIndex, oldTarget.endIndex);
      }
      const newTarget = traceState.targets[updatedTraceTarget.index];
      this.addTracedCoordinates_(newTarget, newTarget.startIndex, updatedTraceTarget.endIndex);
    } else {
      const target2 = traceState.targets[traceState.targetIndex];
      this.addOrRemoveTracedCoordinates_(target2, updatedTraceTarget.endIndex);
    }
    traceState.targetIndex = updatedTraceTarget.index;
    const target = traceState.targets[traceState.targetIndex];
    target.endIndex = updatedTraceTarget.endIndex;
    const coordinate = interpolateCoordinate(target.coordinates, target.endIndex);
    const pixel = this.getMap().getPixelFromCoordinate(coordinate);
    event.coordinate = coordinate;
    event.pixel = [Math.round(pixel[0]), Math.round(pixel[1])];
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(event) {
    let pass = true;
    if (this.getPointerCount() === 0) {
      if (this.downTimeout_) {
        clearTimeout(this.downTimeout_);
        this.downTimeout_ = void 0;
      }
      this.handlePointerMove_(event);
      const tracing = this.traceState_.active;
      this.toggleTraceState_(event);
      if (this.shouldHandle_) {
        const startingToDraw = !this.finishCoordinate_;
        if (startingToDraw) {
          this.startDrawing_(event.coordinate);
        }
        if (!startingToDraw && this.freehand_) {
          this.finishDrawing();
        } else if (!this.freehand_ && (!startingToDraw || this.mode_ === "Point")) {
          if (this.atFinish_(event.pixel, tracing)) {
            if (this.finishCondition_(event)) {
              this.finishDrawing();
            }
          } else {
            this.addToDrawing_(event.coordinate);
          }
        }
        pass = false;
      } else if (this.freehand_) {
        this.abortDrawing();
      }
    }
    if (!pass && this.stopClick_) {
      event.preventDefault();
    }
    return pass;
  }
  /**
   * Handle move events.
   * @param {import("../MapBrowserEvent.js").default} event A move event.
   * @private
   */
  handlePointerMove_(event) {
    this.pointerType_ = event.originalEvent.pointerType;
    if (this.downPx_ && (!this.freehand_ && this.shouldHandle_ || this.freehand_ && !this.shouldHandle_)) {
      const downPx = this.downPx_;
      const clickPx = event.pixel;
      const dx = downPx[0] - clickPx[0];
      const dy = downPx[1] - clickPx[1];
      const squaredDistance3 = dx * dx + dy * dy;
      this.shouldHandle_ = this.freehand_ ? squaredDistance3 > this.squaredClickTolerance_ : squaredDistance3 <= this.squaredClickTolerance_;
      if (!this.shouldHandle_) {
        return;
      }
    }
    if (!this.finishCoordinate_) {
      this.createOrUpdateSketchPoint_(event.coordinate.slice());
      return;
    }
    this.updateTrace_(event);
    this.modifyDrawing_(event.coordinate);
  }
  /**
   * Determine if an event is within the snapping tolerance of the start coord.
   * @param {import("../pixel.js").Pixel} pixel Pixel.
   * @param {boolean} [tracing] Drawing in trace mode (only stop if at the starting point).
   * @return {boolean} The event is within the snapping tolerance of the start.
   * @private
   */
  atFinish_(pixel, tracing) {
    let at = false;
    if (this.sketchFeature_) {
      let potentiallyDone = false;
      let potentiallyFinishCoordinates = [this.finishCoordinate_];
      const mode = this.mode_;
      if (mode === "Point") {
        at = true;
      } else if (mode === "Circle") {
        at = this.sketchCoords_.length === 2;
      } else if (mode === "LineString") {
        potentiallyDone = !tracing && this.sketchCoords_.length > this.minPoints_;
      } else if (mode === "Polygon") {
        const sketchCoords = (
          /** @type {PolyCoordType} */
          this.sketchCoords_
        );
        potentiallyDone = sketchCoords[0].length > this.minPoints_;
        potentiallyFinishCoordinates = [sketchCoords[0][0], sketchCoords[0][sketchCoords[0].length - 2]];
        if (tracing) {
          potentiallyFinishCoordinates = [sketchCoords[0][0]];
        } else {
          potentiallyFinishCoordinates = [sketchCoords[0][0], sketchCoords[0][sketchCoords[0].length - 2]];
        }
      }
      if (potentiallyDone) {
        const map = this.getMap();
        for (let i = 0, ii = potentiallyFinishCoordinates.length; i < ii; i++) {
          const finishCoordinate = potentiallyFinishCoordinates[i];
          const finishPixel = map.getPixelFromCoordinate(finishCoordinate);
          const dx = pixel[0] - finishPixel[0];
          const dy = pixel[1] - finishPixel[1];
          const snapTolerance = this.freehand_ ? 1 : this.snapTolerance_;
          at = Math.sqrt(dx * dx + dy * dy) <= snapTolerance;
          if (at) {
            this.finishCoordinate_ = finishCoordinate;
            break;
          }
        }
      }
    }
    return at;
  }
  /**
   * @param {import("../coordinate").Coordinate} coordinates Coordinate.
   * @private
   */
  createOrUpdateSketchPoint_(coordinates) {
    if (!this.sketchPoint_) {
      this.sketchPoint_ = new Feature_default(new Point_default(coordinates));
      this.updateSketchFeatures_();
    } else {
      const sketchPointGeom = this.sketchPoint_.getGeometry();
      sketchPointGeom.setCoordinates(coordinates);
    }
  }
  /**
   * @param {import("../geom/Polygon.js").default} geometry Polygon geometry.
   * @private
   */
  createOrUpdateCustomSketchLine_(geometry) {
    if (!this.sketchLine_) {
      this.sketchLine_ = new Feature_default();
    }
    const ring = geometry.getLinearRing(0);
    let sketchLineGeom = this.sketchLine_.getGeometry();
    if (!sketchLineGeom) {
      sketchLineGeom = new LineString_default(ring.getFlatCoordinates(), ring.getLayout());
      this.sketchLine_.setGeometry(sketchLineGeom);
    } else {
      sketchLineGeom.setFlatCoordinates(ring.getLayout(), ring.getFlatCoordinates());
      sketchLineGeom.changed();
    }
  }
  /**
   * Start the drawing.
   * @param {import("../coordinate.js").Coordinate} start Start coordinate.
   * @private
   */
  startDrawing_(start) {
    const projection = this.getMap().getView().getProjection();
    const stride = getStrideForLayout(this.geometryLayout_);
    while (start.length < stride) {
      start.push(0);
    }
    this.finishCoordinate_ = start;
    if (this.mode_ === "Point") {
      this.sketchCoords_ = start.slice();
    } else if (this.mode_ === "Polygon") {
      this.sketchCoords_ = [[start.slice(), start.slice()]];
      this.sketchLineCoords_ = this.sketchCoords_[0];
    } else {
      this.sketchCoords_ = [start.slice(), start.slice()];
    }
    if (this.sketchLineCoords_) {
      this.sketchLine_ = new Feature_default(new LineString_default(this.sketchLineCoords_));
    }
    const geometry = this.geometryFunction_(this.sketchCoords_, void 0, projection);
    this.sketchFeature_ = new Feature_default();
    if (this.geometryName_) {
      this.sketchFeature_.setGeometryName(this.geometryName_);
    }
    this.sketchFeature_.setGeometry(geometry);
    this.updateSketchFeatures_();
    this.dispatchEvent(new DrawEvent(DrawEventType.DRAWSTART, this.sketchFeature_));
  }
  /**
   * Modify the drawing.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @private
   */
  modifyDrawing_(coordinate) {
    const map = this.getMap();
    const geometry = this.sketchFeature_.getGeometry();
    const projection = map.getView().getProjection();
    const stride = getStrideForLayout(this.geometryLayout_);
    let coordinates, last;
    while (coordinate.length < stride) {
      coordinate.push(0);
    }
    if (this.mode_ === "Point") {
      last = this.sketchCoords_;
    } else if (this.mode_ === "Polygon") {
      coordinates = /** @type {PolyCoordType} */
      this.sketchCoords_[0];
      last = coordinates[coordinates.length - 1];
      if (this.atFinish_(map.getPixelFromCoordinate(coordinate))) {
        coordinate = this.finishCoordinate_.slice();
      }
    } else {
      coordinates = this.sketchCoords_;
      last = coordinates[coordinates.length - 1];
    }
    last[0] = coordinate[0];
    last[1] = coordinate[1];
    this.geometryFunction_(
      /** @type {!LineCoordType} */
      this.sketchCoords_,
      geometry,
      projection
    );
    if (this.sketchPoint_) {
      const sketchPointGeom = this.sketchPoint_.getGeometry();
      sketchPointGeom.setCoordinates(coordinate);
    }
    if (geometry.getType() === "Polygon" && this.mode_ !== "Polygon") {
      this.createOrUpdateCustomSketchLine_(
        /** @type {Polygon} */
        geometry
      );
    } else if (this.sketchLineCoords_) {
      const sketchLineGeom = this.sketchLine_.getGeometry();
      sketchLineGeom.setCoordinates(this.sketchLineCoords_);
    }
    this.updateSketchFeatures_();
  }
  /**
   * Add a new coordinate to the drawing.
   * @param {!PointCoordType} coordinate Coordinate
   * @return {Feature<import("../geom/SimpleGeometry.js").default>} The sketch feature.
   * @private
   */
  addToDrawing_(coordinate) {
    const geometry = this.sketchFeature_.getGeometry();
    const projection = this.getMap().getView().getProjection();
    let done;
    let coordinates;
    const mode = this.mode_;
    if (mode === "LineString" || mode === "Circle") {
      this.finishCoordinate_ = coordinate.slice();
      coordinates = /** @type {LineCoordType} */
      this.sketchCoords_;
      if (coordinates.length >= this.maxPoints_) {
        if (this.freehand_) {
          coordinates.pop();
        } else {
          done = true;
        }
      }
      coordinates.push(coordinate.slice());
      this.geometryFunction_(coordinates, geometry, projection);
    } else if (mode === "Polygon") {
      coordinates = /** @type {PolyCoordType} */
      this.sketchCoords_[0];
      if (coordinates.length >= this.maxPoints_) {
        if (this.freehand_) {
          coordinates.pop();
        } else {
          done = true;
        }
      }
      coordinates.push(coordinate.slice());
      if (done) {
        this.finishCoordinate_ = coordinates[0];
      }
      this.geometryFunction_(this.sketchCoords_, geometry, projection);
    }
    this.createOrUpdateSketchPoint_(coordinate.slice());
    this.updateSketchFeatures_();
    if (done) {
      return this.finishDrawing();
    }
    return this.sketchFeature_;
  }
  /**
   * @param {number} n The number of points to remove.
   */
  removeLastPoints_(n) {
    if (!this.sketchFeature_) {
      return;
    }
    const geometry = this.sketchFeature_.getGeometry();
    const projection = this.getMap().getView().getProjection();
    const mode = this.mode_;
    for (let i = 0; i < n; ++i) {
      let coordinates;
      if (mode === "LineString" || mode === "Circle") {
        coordinates = /** @type {LineCoordType} */
        this.sketchCoords_;
        coordinates.splice(-2, 1);
        if (coordinates.length >= 2) {
          this.finishCoordinate_ = coordinates[coordinates.length - 2].slice();
          const finishCoordinate = this.finishCoordinate_.slice();
          coordinates[coordinates.length - 1] = finishCoordinate;
          this.createOrUpdateSketchPoint_(finishCoordinate);
        }
        this.geometryFunction_(coordinates, geometry, projection);
        if (geometry.getType() === "Polygon" && this.sketchLine_) {
          this.createOrUpdateCustomSketchLine_(
            /** @type {Polygon} */
            geometry
          );
        }
      } else if (mode === "Polygon") {
        coordinates = /** @type {PolyCoordType} */
        this.sketchCoords_[0];
        coordinates.splice(-2, 1);
        const sketchLineGeom = this.sketchLine_.getGeometry();
        if (coordinates.length >= 2) {
          const finishCoordinate = coordinates[coordinates.length - 2].slice();
          coordinates[coordinates.length - 1] = finishCoordinate;
          this.createOrUpdateSketchPoint_(finishCoordinate);
        }
        sketchLineGeom.setCoordinates(coordinates);
        this.geometryFunction_(this.sketchCoords_, geometry, projection);
      }
      if (coordinates.length === 1) {
        this.abortDrawing();
        break;
      }
    }
    this.updateSketchFeatures_();
  }
  /**
   * Remove last point of the feature currently being drawn. Does not do anything when
   * drawing POINT or MULTI_POINT geometries.
   * @api
   */
  removeLastPoint() {
    this.removeLastPoints_(1);
  }
  /**
   * Stop drawing and add the sketch feature to the target layer.
   * The {@link module:ol/interaction/Draw~DrawEventType.DRAWEND} event is
   * dispatched before inserting the feature.
   * @return {Feature<import("../geom/SimpleGeometry.js").default>|null} The drawn feature.
   * @api
   */
  finishDrawing() {
    const sketchFeature = this.abortDrawing_();
    if (!sketchFeature) {
      return null;
    }
    let coordinates = this.sketchCoords_;
    const geometry = sketchFeature.getGeometry();
    const projection = this.getMap().getView().getProjection();
    if (this.mode_ === "LineString") {
      coordinates.pop();
      this.geometryFunction_(coordinates, geometry, projection);
    } else if (this.mode_ === "Polygon") {
      coordinates[0].pop();
      this.geometryFunction_(coordinates, geometry, projection);
      coordinates = geometry.getCoordinates();
    }
    if (this.type_ === "MultiPoint") {
      sketchFeature.setGeometry(new MultiPoint_default([
        /** @type {PointCoordType} */
        coordinates
      ]));
    } else if (this.type_ === "MultiLineString") {
      sketchFeature.setGeometry(new MultiLineString_default([
        /** @type {LineCoordType} */
        coordinates
      ]));
    } else if (this.type_ === "MultiPolygon") {
      sketchFeature.setGeometry(new MultiPolygon_default([
        /** @type {PolyCoordType} */
        coordinates
      ]));
    }
    this.dispatchEvent(new DrawEvent(DrawEventType.DRAWEND, sketchFeature));
    if (this.features_) {
      this.features_.push(sketchFeature);
    }
    if (this.source_) {
      this.source_.addFeature(sketchFeature);
    }
    return sketchFeature;
  }
  /**
   * Stop drawing without adding the sketch feature to the target layer.
   * @return {Feature<import("../geom/SimpleGeometry.js").default>|null} The sketch feature (or null if none).
   * @private
   */
  abortDrawing_() {
    this.finishCoordinate_ = null;
    const sketchFeature = this.sketchFeature_;
    this.sketchFeature_ = null;
    this.sketchPoint_ = null;
    this.sketchLine_ = null;
    this.overlay_.getSource().clear(true);
    this.deactivateTrace_();
    return sketchFeature;
  }
  /**
   * Stop drawing without adding the sketch feature to the target layer.
   * @api
   */
  abortDrawing() {
    const sketchFeature = this.abortDrawing_();
    if (sketchFeature) {
      this.dispatchEvent(new DrawEvent(DrawEventType.DRAWABORT, sketchFeature));
    }
  }
  /**
   * Append coordinates to the end of the geometry that is currently being drawn.
   * This can be used when drawing LineStrings or Polygons. Coordinates will
   * either be appended to the current LineString or the outer ring of the current
   * Polygon. If no geometry is being drawn, a new one will be created.
   * @param {!LineCoordType} coordinates Linear coordinates to be appended to
   * the coordinate array.
   * @api
   */
  appendCoordinates(coordinates) {
    const mode = this.mode_;
    const newDrawing = !this.sketchFeature_;
    if (newDrawing) {
      this.startDrawing_(coordinates[0]);
    }
    let sketchCoords;
    if (mode === "LineString" || mode === "Circle") {
      sketchCoords = /** @type {LineCoordType} */
      this.sketchCoords_;
    } else if (mode === "Polygon") {
      sketchCoords = this.sketchCoords_ && this.sketchCoords_.length ? (
        /** @type {PolyCoordType} */
        this.sketchCoords_[0]
      ) : [];
    } else {
      return;
    }
    if (newDrawing) {
      sketchCoords.shift();
    }
    sketchCoords.pop();
    for (let i = 0; i < coordinates.length; i++) {
      this.addToDrawing_(coordinates[i]);
    }
    const ending = coordinates[coordinates.length - 1];
    this.sketchFeature_ = this.addToDrawing_(ending);
    this.modifyDrawing_(ending);
  }
  /**
   * Initiate draw mode by starting from an existing geometry which will
   * receive new additional points. This only works on features with
   * `LineString` geometries, where the interaction will extend lines by adding
   * points to the end of the coordinates array.
   * This will change the original feature, instead of drawing a copy.
   *
   * The function will dispatch a `drawstart` event.
   *
   * @param {!Feature<LineString>} feature Feature to be extended.
   * @api
   */
  extend(feature) {
    const geometry = feature.getGeometry();
    const lineString = geometry;
    this.sketchFeature_ = feature;
    this.sketchCoords_ = lineString.getCoordinates();
    const last = this.sketchCoords_[this.sketchCoords_.length - 1];
    this.finishCoordinate_ = last.slice();
    this.sketchCoords_.push(last.slice());
    this.sketchPoint_ = new Feature_default(new Point_default(last));
    this.updateSketchFeatures_();
    this.dispatchEvent(new DrawEvent(DrawEventType.DRAWSTART, this.sketchFeature_));
  }
  /**
   * Redraw the sketch features.
   * @private
   */
  updateSketchFeatures_() {
    const sketchFeatures = [];
    if (this.sketchFeature_) {
      sketchFeatures.push(this.sketchFeature_);
    }
    if (this.sketchLine_) {
      sketchFeatures.push(this.sketchLine_);
    }
    if (this.sketchPoint_) {
      sketchFeatures.push(this.sketchPoint_);
    }
    const overlaySource = this.overlay_.getSource();
    overlaySource.clear(true);
    overlaySource.addFeatures(sketchFeatures);
  }
  /**
   * @private
   */
  updateState_() {
    const map = this.getMap();
    const active = this.getActive();
    if (!map || !active) {
      this.abortDrawing();
    }
    this.overlay_.setMap(active ? map : null);
  }
};
function getDefaultStyleFunction() {
  const styles = createEditingStyle();
  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()];
  };
}
function createRegularPolygon(sides, angle) {
  return function(coordinates, geometry, projection) {
    const center = fromUserCoordinate(
      /** @type {LineCoordType} */
      coordinates[0],
      projection
    );
    const end = fromUserCoordinate(
      /** @type {LineCoordType} */
      coordinates[coordinates.length - 1],
      projection
    );
    const radius = Math.sqrt(squaredDistance2(center, end));
    geometry = geometry || fromCircle(new Circle_default(center), sides);
    let internalAngle = angle;
    if (!angle && angle !== 0) {
      const x = end[0] - center[0];
      const y = end[1] - center[1];
      internalAngle = Math.atan2(y, x);
    }
    makeRegular(
      /** @type {Polygon} */
      geometry,
      center,
      radius,
      internalAngle
    );
    const userProjection = getUserProjection();
    if (userProjection) {
      geometry.transform(projection, userProjection);
    }
    return geometry;
  };
}
function createBox() {
  return function(coordinates, geometry, projection) {
    const extent = boundingExtent(
      /** @type {LineCoordType} */
      [coordinates[0], coordinates[coordinates.length - 1]].map(function(coordinate) {
        return fromUserCoordinate(coordinate, projection);
      })
    );
    const boxCoordinates = [[getBottomLeft(extent), getBottomRight(extent), getTopRight(extent), getTopLeft(extent), getBottomLeft(extent)]];
    if (geometry) {
      geometry.setCoordinates(boxCoordinates);
    } else {
      geometry = new Polygon_default(boxCoordinates);
    }
    const userProjection = getUserProjection();
    if (userProjection) {
      geometry.transform(projection, userProjection);
    }
    return geometry;
  };
}
function getMode(type) {
  switch (type) {
    case "Point":
    case "MultiPoint":
      return "Point";
    case "LineString":
    case "MultiLineString":
      return "LineString";
    case "Polygon":
    case "MultiPolygon":
      return "Polygon";
    case "Circle":
      return "Circle";
    default:
      throw new Error("Invalid type: " + type);
  }
}
var Draw_default = Draw;

export {
  DrawEvent,
  createRegularPolygon,
  createBox,
  Draw_default
};
//# sourceMappingURL=chunk-LW6TLTIF.js.map
