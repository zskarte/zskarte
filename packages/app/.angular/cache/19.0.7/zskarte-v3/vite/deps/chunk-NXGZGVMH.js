import {
  LRUCache_default
} from "./chunk-ZFJPLISK.js";
import {
  fromKey,
  getKey
} from "./chunk-ABQOD32P.js";
import {
  circular
} from "./chunk-CPUVTREV.js";
import {
  Object_default
} from "./chunk-MCYH4ZL5.js";
import {
  get3 as get,
  getTransformFromProjections,
  identityTransform
} from "./chunk-QPOUXWMH.js";
import {
  Event_default
} from "./chunk-X7DDFSZC.js";
import {
  toRadians
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/Geolocation.js
var Property = {
  ACCURACY: "accuracy",
  ACCURACY_GEOMETRY: "accuracyGeometry",
  ALTITUDE: "altitude",
  ALTITUDE_ACCURACY: "altitudeAccuracy",
  HEADING: "heading",
  POSITION: "position",
  PROJECTION: "projection",
  SPEED: "speed",
  TRACKING: "tracking",
  TRACKING_OPTIONS: "trackingOptions"
};
var GeolocationErrorType = {
  /**
   * Triggered when a `GeolocationPositionError` occurs.
   * @event module:ol/Geolocation.GeolocationError#error
   * @api
   */
  ERROR: "error"
};
var GeolocationError = class extends Event_default {
  /**
   * @param {GeolocationPositionError} error error object.
   */
  constructor(error) {
    super(GeolocationErrorType.ERROR);
    this.code = error.code;
    this.message = error.message;
  }
};
var Geolocation = class extends Object_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    this.on;
    this.once;
    this.un;
    options = options || {};
    this.position_ = null;
    this.transform_ = identityTransform;
    this.watchId_ = void 0;
    this.addChangeListener(Property.PROJECTION, this.handleProjectionChanged_);
    this.addChangeListener(Property.TRACKING, this.handleTrackingChanged_);
    if (options.projection !== void 0) {
      this.setProjection(options.projection);
    }
    if (options.trackingOptions !== void 0) {
      this.setTrackingOptions(options.trackingOptions);
    }
    this.setTracking(options.tracking !== void 0 ? options.tracking : false);
  }
  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    this.setTracking(false);
    super.disposeInternal();
  }
  /**
   * @private
   */
  handleProjectionChanged_() {
    const projection = this.getProjection();
    if (projection) {
      this.transform_ = getTransformFromProjections(get("EPSG:4326"), projection);
      if (this.position_) {
        this.set(Property.POSITION, this.transform_(this.position_));
      }
    }
  }
  /**
   * @private
   */
  handleTrackingChanged_() {
    if ("geolocation" in navigator) {
      const tracking = this.getTracking();
      if (tracking && this.watchId_ === void 0) {
        this.watchId_ = navigator.geolocation.watchPosition(this.positionChange_.bind(this), this.positionError_.bind(this), this.getTrackingOptions());
      } else if (!tracking && this.watchId_ !== void 0) {
        navigator.geolocation.clearWatch(this.watchId_);
        this.watchId_ = void 0;
      }
    }
  }
  /**
   * @private
   * @param {GeolocationPosition} position position event.
   */
  positionChange_(position) {
    const coords = position.coords;
    this.set(Property.ACCURACY, coords.accuracy);
    this.set(Property.ALTITUDE, coords.altitude === null ? void 0 : coords.altitude);
    this.set(Property.ALTITUDE_ACCURACY, coords.altitudeAccuracy === null ? void 0 : coords.altitudeAccuracy);
    this.set(Property.HEADING, coords.heading === null ? void 0 : toRadians(coords.heading));
    if (!this.position_) {
      this.position_ = [coords.longitude, coords.latitude];
    } else {
      this.position_[0] = coords.longitude;
      this.position_[1] = coords.latitude;
    }
    const projectedPosition = this.transform_(this.position_);
    this.set(Property.POSITION, projectedPosition.slice());
    this.set(Property.SPEED, coords.speed === null ? void 0 : coords.speed);
    const geometry = circular(this.position_, coords.accuracy);
    geometry.applyTransform(this.transform_);
    this.set(Property.ACCURACY_GEOMETRY, geometry);
    this.changed();
  }
  /**
   * @private
   * @param {GeolocationPositionError} error error object.
   */
  positionError_(error) {
    this.dispatchEvent(new GeolocationError(error));
  }
  /**
   * Get the accuracy of the position in meters.
   * @return {number|undefined} The accuracy of the position measurement in
   *     meters.
   * @observable
   * @api
   */
  getAccuracy() {
    return (
      /** @type {number|undefined} */
      this.get(Property.ACCURACY)
    );
  }
  /**
   * Get a geometry of the position accuracy.
   * @return {?import("./geom/Polygon.js").default} A geometry of the position accuracy.
   * @observable
   * @api
   */
  getAccuracyGeometry() {
    return (
      /** @type {?import("./geom/Polygon.js").default} */
      this.get(Property.ACCURACY_GEOMETRY) || null
    );
  }
  /**
   * Get the altitude associated with the position.
   * @return {number|undefined} The altitude of the position in meters above mean
   *     sea level.
   * @observable
   * @api
   */
  getAltitude() {
    return (
      /** @type {number|undefined} */
      this.get(Property.ALTITUDE)
    );
  }
  /**
   * Get the altitude accuracy of the position.
   * @return {number|undefined} The accuracy of the altitude measurement in
   *     meters.
   * @observable
   * @api
   */
  getAltitudeAccuracy() {
    return (
      /** @type {number|undefined} */
      this.get(Property.ALTITUDE_ACCURACY)
    );
  }
  /**
   * Get the heading as radians clockwise from North.
   * Note: depending on the browser, the heading is only defined if the `enableHighAccuracy`
   * is set to `true` in the tracking options.
   * @return {number|undefined} The heading of the device in radians from north.
   * @observable
   * @api
   */
  getHeading() {
    return (
      /** @type {number|undefined} */
      this.get(Property.HEADING)
    );
  }
  /**
   * Get the position of the device.
   * @return {import("./coordinate.js").Coordinate|undefined} The current position of the device reported
   *     in the current projection.
   * @observable
   * @api
   */
  getPosition() {
    return (
      /** @type {import("./coordinate.js").Coordinate|undefined} */
      this.get(Property.POSITION)
    );
  }
  /**
   * Get the projection associated with the position.
   * @return {import("./proj/Projection.js").default|undefined} The projection the position is
   *     reported in.
   * @observable
   * @api
   */
  getProjection() {
    return (
      /** @type {import("./proj/Projection.js").default|undefined} */
      this.get(Property.PROJECTION)
    );
  }
  /**
   * Get the speed in meters per second.
   * @return {number|undefined} The instantaneous speed of the device in meters
   *     per second.
   * @observable
   * @api
   */
  getSpeed() {
    return (
      /** @type {number|undefined} */
      this.get(Property.SPEED)
    );
  }
  /**
   * Determine if the device location is being tracked.
   * @return {boolean} The device location is being tracked.
   * @observable
   * @api
   */
  getTracking() {
    return (
      /** @type {boolean} */
      this.get(Property.TRACKING)
    );
  }
  /**
   * Get the tracking options.
   * See https://www.w3.org/TR/geolocation-API/#position-options.
   * @return {PositionOptions|undefined} PositionOptions as defined by
   *     the [HTML5 Geolocation spec
   *     ](https://www.w3.org/TR/geolocation-API/#position_options_interface).
   * @observable
   * @api
   */
  getTrackingOptions() {
    return (
      /** @type {PositionOptions|undefined} */
      this.get(Property.TRACKING_OPTIONS)
    );
  }
  /**
   * Set the projection to use for transforming the coordinates.
   * @param {import("./proj.js").ProjectionLike} projection The projection the position is
   *     reported in.
   * @observable
   * @api
   */
  setProjection(projection) {
    this.set(Property.PROJECTION, get(projection));
  }
  /**
   * Enable or disable tracking.
   * @param {boolean} tracking Enable tracking.
   * @observable
   * @api
   */
  setTracking(tracking) {
    this.set(Property.TRACKING, tracking);
  }
  /**
   * Set the tracking options.
   * See http://www.w3.org/TR/geolocation-API/#position-options.
   * @param {PositionOptions} options PositionOptions as defined by the
   *     [HTML5 Geolocation spec
   *     ](http://www.w3.org/TR/geolocation-API/#position_options_interface).
   * @observable
   * @api
   */
  setTrackingOptions(options) {
    this.set(Property.TRACKING_OPTIONS, options);
  }
};
var Geolocation_default = Geolocation;

// ../../node_modules/ol/TileCache.js
var TileCache = class extends LRUCache_default {
  /**
   * @override
   */
  clear() {
    while (this.getCount() > 0) {
      this.pop().release();
    }
    super.clear();
  }
  /**
   * @param {!Object<string, boolean>} usedTiles Used tiles.
   * @override
   */
  expireCache(usedTiles) {
    while (this.canExpireCache()) {
      const tile = this.peekLast();
      if (tile.getKey() in usedTiles) {
        break;
      } else {
        this.pop().release();
      }
    }
  }
  /**
   * Prune all tiles from the cache that don't have the same z as the newest tile.
   */
  pruneExceptNewestZ() {
    if (this.getCount() === 0) {
      return;
    }
    const key = this.peekFirstKey();
    const tileCoord = fromKey(key);
    const z = tileCoord[0];
    this.forEach((tile) => {
      if (tile.tileCoord[0] !== z) {
        this.remove(getKey(tile.tileCoord));
        tile.release();
      }
    });
  }
};
var TileCache_default = TileCache;

export {
  Geolocation_default,
  TileCache_default
};
//# sourceMappingURL=chunk-NXGZGVMH.js.map
