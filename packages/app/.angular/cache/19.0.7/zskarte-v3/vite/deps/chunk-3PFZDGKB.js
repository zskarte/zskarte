import {
  Interaction_default,
  MapBrowserEventType_default,
  Pointer_default,
  all,
  altShiftKeysOnly,
  always,
  centroid,
  focusWithTabindex,
  mouseActionButton,
  mouseOnly,
  noModifierKeys,
  pan,
  platformModifierKey,
  primaryAction,
  shiftKeyOnly,
  targetNotEditable,
  zoomByDelta
} from "./chunk-UA3ZW3R6.js";
import {
  Collection_default
} from "./chunk-6L3PZKOC.js";
import {
  DEVICE_PIXEL_RATIO,
  FIREFOX
} from "./chunk-AIKGHEYG.js";
import {
  disable
} from "./chunk-PTY4IMKO.js";
import {
  easeOut
} from "./chunk-GA2V7BR7.js";
import {
  Polygon_default
} from "./chunk-CPUVTREV.js";
import {
  rotate,
  scale
} from "./chunk-QPOUXWMH.js";
import {
  Disposable_default,
  EventType_default,
  Event_default,
  FALSE
} from "./chunk-X7DDFSZC.js";
import {
  clamp
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/Kinetic.js
var Kinetic = class {
  /**
   * @param {number} decay Rate of decay (must be negative).
   * @param {number} minVelocity Minimum velocity (pixels/millisecond).
   * @param {number} delay Delay to consider to calculate the kinetic
   *     initial values (milliseconds).
   */
  constructor(decay, minVelocity, delay) {
    this.decay_ = decay;
    this.minVelocity_ = minVelocity;
    this.delay_ = delay;
    this.points_ = [];
    this.angle_ = 0;
    this.initialVelocity_ = 0;
  }
  /**
   * FIXME empty description for jsdoc
   */
  begin() {
    this.points_.length = 0;
    this.angle_ = 0;
    this.initialVelocity_ = 0;
  }
  /**
   * @param {number} x X.
   * @param {number} y Y.
   */
  update(x, y) {
    this.points_.push(x, y, Date.now());
  }
  /**
   * @return {boolean} Whether we should do kinetic animation.
   */
  end() {
    if (this.points_.length < 6) {
      return false;
    }
    const delay = Date.now() - this.delay_;
    const lastIndex = this.points_.length - 3;
    if (this.points_[lastIndex + 2] < delay) {
      return false;
    }
    let firstIndex = lastIndex - 3;
    while (firstIndex > 0 && this.points_[firstIndex + 2] > delay) {
      firstIndex -= 3;
    }
    const duration = this.points_[lastIndex + 2] - this.points_[firstIndex + 2];
    if (duration < 1e3 / 60) {
      return false;
    }
    const dx = this.points_[lastIndex] - this.points_[firstIndex];
    const dy = this.points_[lastIndex + 1] - this.points_[firstIndex + 1];
    this.angle_ = Math.atan2(dy, dx);
    this.initialVelocity_ = Math.sqrt(dx * dx + dy * dy) / duration;
    return this.initialVelocity_ > this.minVelocity_;
  }
  /**
   * @return {number} Total distance travelled (pixels).
   */
  getDistance() {
    return (this.minVelocity_ - this.initialVelocity_) / this.decay_;
  }
  /**
   * @return {number} Angle of the kinetic panning animation (radians).
   */
  getAngle() {
    return this.angle_;
  }
};
var Kinetic_default = Kinetic;

// ../../node_modules/ol/MapEventType.js
var MapEventType_default = {
  /**
   * Triggered after a map frame is rendered.
   * @event module:ol/MapEvent~MapEvent#postrender
   * @api
   */
  POSTRENDER: "postrender",
  /**
   * Triggered when the map starts moving.
   * @event module:ol/MapEvent~MapEvent#movestart
   * @api
   */
  MOVESTART: "movestart",
  /**
   * Triggered after the map is moved.
   * @event module:ol/MapEvent~MapEvent#moveend
   * @api
   */
  MOVEEND: "moveend",
  /**
   * Triggered when loading of additional map data (tiles, images, features) starts.
   * @event module:ol/MapEvent~MapEvent#loadstart
   * @api
   */
  LOADSTART: "loadstart",
  /**
   * Triggered when loading of additional map data has completed.
   * @event module:ol/MapEvent~MapEvent#loadend
   * @api
   */
  LOADEND: "loadend"
};

// ../../node_modules/ol/interaction/DoubleClickZoom.js
var DoubleClickZoom = class extends Interaction_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    options = options ? options : {};
    this.delta_ = options.delta ? options.delta : 1;
    this.duration_ = options.duration !== void 0 ? options.duration : 250;
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} (if it was a
   * doubleclick) and eventually zooms the map.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @override
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (mapBrowserEvent.type == MapBrowserEventType_default.DBLCLICK) {
      const browserEvent = (
        /** @type {MouseEvent} */
        mapBrowserEvent.originalEvent
      );
      const map = mapBrowserEvent.map;
      const anchor = mapBrowserEvent.coordinate;
      const delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
      const view = map.getView();
      zoomByDelta(view, delta, anchor, this.duration_);
      browserEvent.preventDefault();
      stopEvent = true;
    }
    return !stopEvent;
  }
};
var DoubleClickZoom_default = DoubleClickZoom;

// ../../node_modules/ol/interaction/DragPan.js
var DragPan = class extends Pointer_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super({
      stopDown: FALSE
    });
    options = options ? options : {};
    this.kinetic_ = options.kinetic;
    this.lastCentroid = null;
    this.lastPointersCount_;
    this.panning_ = false;
    const condition = options.condition ? options.condition : all(noModifierKeys, primaryAction);
    this.condition_ = options.onFocusOnly ? all(focusWithTabindex, condition) : condition;
    this.noKinetic_ = false;
  }
  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @override
   */
  handleDragEvent(mapBrowserEvent) {
    const map = mapBrowserEvent.map;
    if (!this.panning_) {
      this.panning_ = true;
      map.getView().beginInteraction();
    }
    const targetPointers = this.targetPointers;
    const centroid2 = map.getEventPixel(centroid(targetPointers));
    if (targetPointers.length == this.lastPointersCount_) {
      if (this.kinetic_) {
        this.kinetic_.update(centroid2[0], centroid2[1]);
      }
      if (this.lastCentroid) {
        const delta = [this.lastCentroid[0] - centroid2[0], centroid2[1] - this.lastCentroid[1]];
        const map2 = mapBrowserEvent.map;
        const view = map2.getView();
        scale(delta, view.getResolution());
        rotate(delta, view.getRotation());
        view.adjustCenterInternal(delta);
      }
    } else if (this.kinetic_) {
      this.kinetic_.begin();
    }
    this.lastCentroid = centroid2;
    this.lastPointersCount_ = targetPointers.length;
    mapBrowserEvent.originalEvent.preventDefault();
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(mapBrowserEvent) {
    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (this.targetPointers.length === 0) {
      if (!this.noKinetic_ && this.kinetic_ && this.kinetic_.end()) {
        const distance = this.kinetic_.getDistance();
        const angle = this.kinetic_.getAngle();
        const center = view.getCenterInternal();
        const centerpx = map.getPixelFromCoordinateInternal(center);
        const dest = map.getCoordinateFromPixelInternal([centerpx[0] - distance * Math.cos(angle), centerpx[1] - distance * Math.sin(angle)]);
        view.animateInternal({
          center: view.getConstrainedCenter(dest),
          duration: 500,
          easing: easeOut
        });
      }
      if (this.panning_) {
        this.panning_ = false;
        view.endInteraction();
      }
      return false;
    }
    if (this.kinetic_) {
      this.kinetic_.begin();
    }
    this.lastCentroid = null;
    return true;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length > 0 && this.condition_(mapBrowserEvent)) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      this.lastCentroid = null;
      if (view.getAnimating()) {
        view.cancelAnimations();
      }
      if (this.kinetic_) {
        this.kinetic_.begin();
      }
      this.noKinetic_ = this.targetPointers.length > 1;
      return true;
    }
    return false;
  }
};
var DragPan_default = DragPan;

// ../../node_modules/ol/interaction/DragRotate.js
var DragRotate = class extends Pointer_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    super({
      stopDown: FALSE
    });
    this.condition_ = options.condition ? options.condition : altShiftKeysOnly;
    this.lastAngle_ = void 0;
    this.duration_ = options.duration !== void 0 ? options.duration : 250;
  }
  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @override
   */
  handleDragEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return;
    }
    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (view.getConstraints().rotation === disable) {
      return;
    }
    const size = map.getSize();
    const offset = mapBrowserEvent.pixel;
    const theta = Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2);
    if (this.lastAngle_ !== void 0) {
      const delta = theta - this.lastAngle_;
      view.adjustRotationInternal(-delta);
    }
    this.lastAngle_ = theta;
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return true;
    }
    const map = mapBrowserEvent.map;
    const view = map.getView();
    view.endInteraction(this.duration_);
    return false;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return false;
    }
    if (mouseActionButton(mapBrowserEvent) && this.condition_(mapBrowserEvent)) {
      const map = mapBrowserEvent.map;
      map.getView().beginInteraction();
      this.lastAngle_ = void 0;
      return true;
    }
    return false;
  }
};
var DragRotate_default = DragRotate;

// ../../node_modules/ol/render/Box.js
var RenderBox = class extends Disposable_default {
  /**
   * @param {string} className CSS class name.
   */
  constructor(className) {
    super();
    this.geometry_ = null;
    this.element_ = document.createElement("div");
    this.element_.style.position = "absolute";
    this.element_.style.pointerEvents = "auto";
    this.element_.className = "ol-box " + className;
    this.map_ = null;
    this.startPixel_ = null;
    this.endPixel_ = null;
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.setMap(null);
  }
  /**
   * @private
   */
  render_() {
    const startPixel = this.startPixel_;
    const endPixel = this.endPixel_;
    const px = "px";
    const style = this.element_.style;
    style.left = Math.min(startPixel[0], endPixel[0]) + px;
    style.top = Math.min(startPixel[1], endPixel[1]) + px;
    style.width = Math.abs(endPixel[0] - startPixel[0]) + px;
    style.height = Math.abs(endPixel[1] - startPixel[1]) + px;
  }
  /**
   * @param {import("../Map.js").default|null} map Map.
   */
  setMap(map) {
    if (this.map_) {
      this.map_.getOverlayContainer().removeChild(this.element_);
      const style = this.element_.style;
      style.left = "inherit";
      style.top = "inherit";
      style.width = "inherit";
      style.height = "inherit";
    }
    this.map_ = map;
    if (this.map_) {
      this.map_.getOverlayContainer().appendChild(this.element_);
    }
  }
  /**
   * @param {import("../pixel.js").Pixel} startPixel Start pixel.
   * @param {import("../pixel.js").Pixel} endPixel End pixel.
   */
  setPixels(startPixel, endPixel) {
    this.startPixel_ = startPixel;
    this.endPixel_ = endPixel;
    this.createOrUpdateGeometry();
    this.render_();
  }
  /**
   * Creates or updates the cached geometry.
   */
  createOrUpdateGeometry() {
    if (!this.map_) {
      return;
    }
    const startPixel = this.startPixel_;
    const endPixel = this.endPixel_;
    const pixels = [startPixel, [startPixel[0], endPixel[1]], endPixel, [endPixel[0], startPixel[1]]];
    const coordinates = pixels.map(this.map_.getCoordinateFromPixelInternal, this.map_);
    coordinates[4] = coordinates[0].slice();
    if (!this.geometry_) {
      this.geometry_ = new Polygon_default([coordinates]);
    } else {
      this.geometry_.setCoordinates([coordinates]);
    }
  }
  /**
   * @return {import("../geom/Polygon.js").default} Geometry.
   */
  getGeometry() {
    return this.geometry_;
  }
};
var Box_default = RenderBox;

// ../../node_modules/ol/interaction/DragBox.js
var DragBoxEventType = {
  /**
   * Triggered upon drag box start.
   * @event DragBoxEvent#boxstart
   * @api
   */
  BOXSTART: "boxstart",
  /**
   * Triggered on drag when box is active.
   * @event DragBoxEvent#boxdrag
   * @api
   */
  BOXDRAG: "boxdrag",
  /**
   * Triggered upon drag box end.
   * @event DragBoxEvent#boxend
   * @api
   */
  BOXEND: "boxend",
  /**
   * Triggered upon drag box canceled.
   * @event DragBoxEvent#boxcancel
   * @api
   */
  BOXCANCEL: "boxcancel"
};
var DragBoxEvent = class extends Event_default {
  /**
   * @param {string} type The event type.
   * @param {import("../coordinate.js").Coordinate} coordinate The event coordinate.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Originating event.
   */
  constructor(type, coordinate, mapBrowserEvent) {
    super(type);
    this.coordinate = coordinate;
    this.mapBrowserEvent = mapBrowserEvent;
  }
};
var DragBox = class extends Pointer_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    this.on;
    this.once;
    this.un;
    options = options ?? {};
    this.box_ = new Box_default(options.className || "ol-dragbox");
    this.minArea_ = options.minArea ?? 64;
    if (options.onBoxEnd) {
      this.onBoxEnd = options.onBoxEnd;
    }
    this.startPixel_ = null;
    this.condition_ = options.condition ?? mouseActionButton;
    this.boxEndCondition_ = options.boxEndCondition ?? this.defaultBoxEndCondition;
  }
  /**
   * The default condition for determining whether the boxend event
   * should fire.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent The originating MapBrowserEvent
   *     leading to the box end.
   * @param {import("../pixel.js").Pixel} startPixel The starting pixel of the box.
   * @param {import("../pixel.js").Pixel} endPixel The end pixel of the box.
   * @return {boolean} Whether or not the boxend condition should be fired.
   */
  defaultBoxEndCondition(mapBrowserEvent, startPixel, endPixel) {
    const width = endPixel[0] - startPixel[0];
    const height = endPixel[1] - startPixel[1];
    return width * width + height * height >= this.minArea_;
  }
  /**
   * Returns geometry of last drawn box.
   * @return {import("../geom/Polygon.js").default} Geometry.
   * @api
   */
  getGeometry() {
    return this.box_.getGeometry();
  }
  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @override
   */
  handleDragEvent(mapBrowserEvent) {
    if (!this.startPixel_) {
      return;
    }
    this.box_.setPixels(this.startPixel_, mapBrowserEvent.pixel);
    this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXDRAG, mapBrowserEvent.coordinate, mapBrowserEvent));
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(mapBrowserEvent) {
    if (!this.startPixel_) {
      return false;
    }
    const completeBox = this.boxEndCondition_(mapBrowserEvent, this.startPixel_, mapBrowserEvent.pixel);
    if (completeBox) {
      this.onBoxEnd(mapBrowserEvent);
    }
    this.dispatchEvent(new DragBoxEvent(completeBox ? DragBoxEventType.BOXEND : DragBoxEventType.BOXCANCEL, mapBrowserEvent.coordinate, mapBrowserEvent));
    this.box_.setMap(null);
    this.startPixel_ = null;
    return false;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.condition_(mapBrowserEvent)) {
      this.startPixel_ = mapBrowserEvent.pixel;
      this.box_.setMap(mapBrowserEvent.map);
      this.box_.setPixels(this.startPixel_, this.startPixel_);
      this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXSTART, mapBrowserEvent.coordinate, mapBrowserEvent));
      return true;
    }
    return false;
  }
  /**
   * Function to execute just before `onboxend` is fired
   * @param {import("../MapBrowserEvent.js").default} event Event.
   */
  onBoxEnd(event) {
  }
  /**
   * Activate or deactivate the interaction.
   * @param {boolean} active Active.
   * @observable
   * @api
   * @override
   */
  setActive(active) {
    if (!active) {
      this.box_.setMap(null);
      if (this.startPixel_) {
        this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXCANCEL, this.startPixel_, null));
        this.startPixel_ = null;
      }
    }
    super.setActive(active);
  }
  /**
   * @param {import("../Map.js").default|null} map Map.
   * @override
   */
  setMap(map) {
    const oldMap = this.getMap();
    if (oldMap) {
      this.box_.setMap(null);
      if (this.startPixel_) {
        this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXCANCEL, this.startPixel_, null));
        this.startPixel_ = null;
      }
    }
    super.setMap(map);
  }
};
var DragBox_default = DragBox;

// ../../node_modules/ol/interaction/DragZoom.js
var DragZoom = class extends DragBox_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const condition = options.condition ? options.condition : shiftKeyOnly;
    super({
      condition,
      className: options.className || "ol-dragzoom",
      minArea: options.minArea
    });
    this.duration_ = options.duration !== void 0 ? options.duration : 200;
    this.out_ = options.out !== void 0 ? options.out : false;
  }
  /**
   * Function to execute just before `onboxend` is fired
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @override
   */
  onBoxEnd(event) {
    const map = this.getMap();
    const view = (
      /** @type {!import("../View.js").default} */
      map.getView()
    );
    let geometry = this.getGeometry();
    if (this.out_) {
      const rotatedExtent = view.rotatedExtentForGeometry(geometry);
      const resolution = view.getResolutionForExtentInternal(rotatedExtent);
      const factor = view.getResolution() / resolution;
      geometry = geometry.clone();
      geometry.scale(factor * factor);
    }
    view.fitInternal(geometry, {
      duration: this.duration_,
      easing: easeOut
    });
  }
};
var DragZoom_default = DragZoom;

// ../../node_modules/ol/events/Key.js
var Key_default = {
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown"
};

// ../../node_modules/ol/interaction/KeyboardPan.js
var KeyboardPan = class extends Interaction_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    options = options || {};
    this.defaultCondition_ = function(mapBrowserEvent) {
      return noModifierKeys(mapBrowserEvent) && targetNotEditable(mapBrowserEvent);
    };
    this.condition_ = options.condition !== void 0 ? options.condition : this.defaultCondition_;
    this.duration_ = options.duration !== void 0 ? options.duration : 100;
    this.pixelDelta_ = options.pixelDelta !== void 0 ? options.pixelDelta : 128;
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides the direction to pan to (if an arrow key was
   * pressed).
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @override
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (mapBrowserEvent.type == EventType_default.KEYDOWN) {
      const keyEvent = (
        /** @type {KeyboardEvent} */
        mapBrowserEvent.originalEvent
      );
      const key = keyEvent.key;
      if (this.condition_(mapBrowserEvent) && (key == Key_default.DOWN || key == Key_default.LEFT || key == Key_default.RIGHT || key == Key_default.UP)) {
        const map = mapBrowserEvent.map;
        const view = map.getView();
        const mapUnitsDelta = view.getResolution() * this.pixelDelta_;
        let deltaX = 0, deltaY = 0;
        if (key == Key_default.DOWN) {
          deltaY = -mapUnitsDelta;
        } else if (key == Key_default.LEFT) {
          deltaX = -mapUnitsDelta;
        } else if (key == Key_default.RIGHT) {
          deltaX = mapUnitsDelta;
        } else {
          deltaY = mapUnitsDelta;
        }
        const delta = [deltaX, deltaY];
        rotate(delta, view.getRotation());
        pan(view, delta, this.duration_);
        keyEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }
};
var KeyboardPan_default = KeyboardPan;

// ../../node_modules/ol/interaction/KeyboardZoom.js
var KeyboardZoom = class extends Interaction_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    options = options ? options : {};
    this.condition_ = options.condition ? options.condition : function(mapBrowserEvent) {
      return !platformModifierKey(mapBrowserEvent) && targetNotEditable(mapBrowserEvent);
    };
    this.delta_ = options.delta ? options.delta : 1;
    this.duration_ = options.duration !== void 0 ? options.duration : 100;
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides whether to zoom in or out (depending on whether the
   * key pressed was '+' or '-').
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @override
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (mapBrowserEvent.type == EventType_default.KEYDOWN || mapBrowserEvent.type == EventType_default.KEYPRESS) {
      const keyEvent = (
        /** @type {KeyboardEvent} */
        mapBrowserEvent.originalEvent
      );
      const key = keyEvent.key;
      if (this.condition_(mapBrowserEvent) && (key === "+" || key === "-")) {
        const map = mapBrowserEvent.map;
        const delta = key === "+" ? this.delta_ : -this.delta_;
        const view = map.getView();
        zoomByDelta(view, delta, void 0, this.duration_);
        keyEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }
};
var KeyboardZoom_default = KeyboardZoom;

// ../../node_modules/ol/interaction/MouseWheelZoom.js
var MouseWheelZoom = class extends Interaction_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    super(
      /** @type {import("./Interaction.js").InteractionOptions} */
      options
    );
    this.totalDelta_ = 0;
    this.lastDelta_ = 0;
    this.maxDelta_ = options.maxDelta !== void 0 ? options.maxDelta : 1;
    this.duration_ = options.duration !== void 0 ? options.duration : 250;
    this.timeout_ = options.timeout !== void 0 ? options.timeout : 80;
    this.useAnchor_ = options.useAnchor !== void 0 ? options.useAnchor : true;
    this.constrainResolution_ = options.constrainResolution !== void 0 ? options.constrainResolution : false;
    const condition = options.condition ? options.condition : always;
    this.condition_ = options.onFocusOnly ? all(focusWithTabindex, condition) : condition;
    this.lastAnchor_ = null;
    this.startTime_ = void 0;
    this.timeoutId_;
    this.mode_ = void 0;
    this.trackpadEventGap_ = 400;
    this.trackpadTimeoutId_;
    this.deltaPerZoom_ = 300;
  }
  /**
   * @private
   */
  endInteraction_() {
    this.trackpadTimeoutId_ = void 0;
    const map = this.getMap();
    if (!map) {
      return;
    }
    const view = map.getView();
    view.endInteraction(void 0, this.lastDelta_ ? this.lastDelta_ > 0 ? 1 : -1 : 0, this.lastAnchor_ ? map.getCoordinateFromPixel(this.lastAnchor_) : null);
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} (if it was a mousewheel-event) and eventually
   * zooms the map.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @override
   */
  handleEvent(mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
      return true;
    }
    const type = mapBrowserEvent.type;
    if (type !== EventType_default.WHEEL) {
      return true;
    }
    const map = mapBrowserEvent.map;
    const wheelEvent = (
      /** @type {WheelEvent} */
      mapBrowserEvent.originalEvent
    );
    wheelEvent.preventDefault();
    if (this.useAnchor_) {
      this.lastAnchor_ = mapBrowserEvent.pixel;
    }
    let delta;
    if (mapBrowserEvent.type == EventType_default.WHEEL) {
      delta = wheelEvent.deltaY;
      if (FIREFOX && wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        delta /= DEVICE_PIXEL_RATIO;
      }
      if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= 40;
      }
    }
    if (delta === 0) {
      return false;
    }
    this.lastDelta_ = delta;
    const now = Date.now();
    if (this.startTime_ === void 0) {
      this.startTime_ = now;
    }
    if (!this.mode_ || now - this.startTime_ > this.trackpadEventGap_) {
      this.mode_ = Math.abs(delta) < 4 ? "trackpad" : "wheel";
    }
    const view = map.getView();
    if (this.mode_ === "trackpad" && !(view.getConstrainResolution() || this.constrainResolution_)) {
      if (this.trackpadTimeoutId_) {
        clearTimeout(this.trackpadTimeoutId_);
      } else {
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.beginInteraction();
      }
      this.trackpadTimeoutId_ = setTimeout(this.endInteraction_.bind(this), this.timeout_);
      view.adjustZoom(-delta / this.deltaPerZoom_, this.lastAnchor_ ? map.getCoordinateFromPixel(this.lastAnchor_) : null);
      this.startTime_ = now;
      return false;
    }
    this.totalDelta_ += delta;
    const timeLeft = Math.max(this.timeout_ - (now - this.startTime_), 0);
    clearTimeout(this.timeoutId_);
    this.timeoutId_ = setTimeout(this.handleWheelZoom_.bind(this, map), timeLeft);
    return false;
  }
  /**
   * @private
   * @param {import("../Map.js").default} map Map.
   */
  handleWheelZoom_(map) {
    const view = map.getView();
    if (view.getAnimating()) {
      view.cancelAnimations();
    }
    let delta = -clamp(this.totalDelta_, -this.maxDelta_ * this.deltaPerZoom_, this.maxDelta_ * this.deltaPerZoom_) / this.deltaPerZoom_;
    if (view.getConstrainResolution() || this.constrainResolution_) {
      delta = delta ? delta > 0 ? 1 : -1 : 0;
    }
    zoomByDelta(view, delta, this.lastAnchor_ ? map.getCoordinateFromPixel(this.lastAnchor_) : null, this.duration_);
    this.mode_ = void 0;
    this.totalDelta_ = 0;
    this.lastAnchor_ = null;
    this.startTime_ = void 0;
    this.timeoutId_ = void 0;
  }
  /**
   * Enable or disable using the mouse's location as an anchor when zooming
   * @param {boolean} useAnchor true to zoom to the mouse's location, false
   * to zoom to the center of the map
   * @api
   */
  setMouseAnchor(useAnchor) {
    this.useAnchor_ = useAnchor;
    if (!useAnchor) {
      this.lastAnchor_ = null;
    }
  }
};
var MouseWheelZoom_default = MouseWheelZoom;

// ../../node_modules/ol/interaction/PinchRotate.js
var PinchRotate = class extends Pointer_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const pointerOptions = (
      /** @type {import("./Pointer.js").Options} */
      options
    );
    if (!pointerOptions.stopDown) {
      pointerOptions.stopDown = FALSE;
    }
    super(pointerOptions);
    this.anchor_ = null;
    this.lastAngle_ = void 0;
    this.rotating_ = false;
    this.rotationDelta_ = 0;
    this.threshold_ = options.threshold !== void 0 ? options.threshold : 0.3;
    this.duration_ = options.duration !== void 0 ? options.duration : 250;
  }
  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @override
   */
  handleDragEvent(mapBrowserEvent) {
    let rotationDelta = 0;
    const touch0 = this.targetPointers[0];
    const touch1 = this.targetPointers[1];
    const angle = Math.atan2(touch1.clientY - touch0.clientY, touch1.clientX - touch0.clientX);
    if (this.lastAngle_ !== void 0) {
      const delta = angle - this.lastAngle_;
      this.rotationDelta_ += delta;
      if (!this.rotating_ && Math.abs(this.rotationDelta_) > this.threshold_) {
        this.rotating_ = true;
      }
      rotationDelta = delta;
    }
    this.lastAngle_ = angle;
    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (view.getConstraints().rotation === disable) {
      return;
    }
    this.anchor_ = map.getCoordinateFromPixelInternal(map.getEventPixel(centroid(this.targetPointers)));
    if (this.rotating_) {
      map.render();
      view.adjustRotationInternal(rotationDelta, this.anchor_);
    }
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(mapBrowserEvent) {
    if (this.targetPointers.length < 2) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      view.endInteraction(this.duration_);
      return false;
    }
    return true;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length >= 2) {
      const map = mapBrowserEvent.map;
      this.anchor_ = null;
      this.lastAngle_ = void 0;
      this.rotating_ = false;
      this.rotationDelta_ = 0;
      if (!this.handlingDownUpSequence) {
        map.getView().beginInteraction();
      }
      return true;
    }
    return false;
  }
};
var PinchRotate_default = PinchRotate;

// ../../node_modules/ol/interaction/PinchZoom.js
var PinchZoom = class extends Pointer_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    const pointerOptions = (
      /** @type {import("./Pointer.js").Options} */
      options
    );
    if (!pointerOptions.stopDown) {
      pointerOptions.stopDown = FALSE;
    }
    super(pointerOptions);
    this.anchor_ = null;
    this.duration_ = options.duration !== void 0 ? options.duration : 400;
    this.lastDistance_ = void 0;
    this.lastScaleDelta_ = 1;
  }
  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @override
   */
  handleDragEvent(mapBrowserEvent) {
    let scaleDelta = 1;
    const touch0 = this.targetPointers[0];
    const touch1 = this.targetPointers[1];
    const dx = touch0.clientX - touch1.clientX;
    const dy = touch0.clientY - touch1.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (this.lastDistance_ !== void 0) {
      scaleDelta = this.lastDistance_ / distance;
    }
    this.lastDistance_ = distance;
    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (scaleDelta != 1) {
      this.lastScaleDelta_ = scaleDelta;
    }
    this.anchor_ = map.getCoordinateFromPixelInternal(map.getEventPixel(centroid(this.targetPointers)));
    map.render();
    view.adjustResolutionInternal(scaleDelta, this.anchor_);
  }
  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleUpEvent(mapBrowserEvent) {
    if (this.targetPointers.length < 2) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      const direction = this.lastScaleDelta_ > 1 ? 1 : -1;
      view.endInteraction(this.duration_, direction);
      return false;
    }
    return true;
  }
  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @override
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length >= 2) {
      const map = mapBrowserEvent.map;
      this.anchor_ = null;
      this.lastDistance_ = void 0;
      this.lastScaleDelta_ = 1;
      if (!this.handlingDownUpSequence) {
        map.getView().beginInteraction();
      }
      return true;
    }
    return false;
  }
};
var PinchZoom_default = PinchZoom;

// ../../node_modules/ol/interaction/defaults.js
function defaults(options) {
  options = options ? options : {};
  const interactions = new Collection_default();
  const kinetic = new Kinetic_default(-5e-3, 0.05, 100);
  const altShiftDragRotate = options.altShiftDragRotate !== void 0 ? options.altShiftDragRotate : true;
  if (altShiftDragRotate) {
    interactions.push(new DragRotate_default());
  }
  const doubleClickZoom = options.doubleClickZoom !== void 0 ? options.doubleClickZoom : true;
  if (doubleClickZoom) {
    interactions.push(new DoubleClickZoom_default({
      delta: options.zoomDelta,
      duration: options.zoomDuration
    }));
  }
  const dragPan = options.dragPan !== void 0 ? options.dragPan : true;
  if (dragPan) {
    interactions.push(new DragPan_default({
      onFocusOnly: options.onFocusOnly,
      kinetic
    }));
  }
  const pinchRotate = options.pinchRotate !== void 0 ? options.pinchRotate : true;
  if (pinchRotate) {
    interactions.push(new PinchRotate_default());
  }
  const pinchZoom = options.pinchZoom !== void 0 ? options.pinchZoom : true;
  if (pinchZoom) {
    interactions.push(new PinchZoom_default({
      duration: options.zoomDuration
    }));
  }
  const keyboard = options.keyboard !== void 0 ? options.keyboard : true;
  if (keyboard) {
    interactions.push(new KeyboardPan_default());
    interactions.push(new KeyboardZoom_default({
      delta: options.zoomDelta,
      duration: options.zoomDuration
    }));
  }
  const mouseWheelZoom = options.mouseWheelZoom !== void 0 ? options.mouseWheelZoom : true;
  if (mouseWheelZoom) {
    interactions.push(new MouseWheelZoom_default({
      onFocusOnly: options.onFocusOnly,
      duration: options.zoomDuration
    }));
  }
  const shiftDragZoom = options.shiftDragZoom !== void 0 ? options.shiftDragZoom : true;
  if (shiftDragZoom) {
    interactions.push(new DragZoom_default({
      duration: options.zoomDuration
    }));
  }
  return interactions;
}

export {
  Kinetic_default,
  MapEventType_default,
  DoubleClickZoom_default,
  DragPan_default,
  DragRotate_default,
  DragBox_default,
  DragZoom_default,
  KeyboardPan_default,
  KeyboardZoom_default,
  MouseWheelZoom_default,
  PinchRotate_default,
  PinchZoom_default,
  defaults
};
//# sourceMappingURL=chunk-3PFZDGKB.js.map
