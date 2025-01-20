import {
  Feature_default,
  Feature_default2
} from "./chunk-3XNX3BQI.js";
import {
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
  Polygon_default,
  linearRingsAreOriented,
  linearRingssAreOriented,
  orientLinearRings,
  orientLinearRingsArray
} from "./chunk-CPUVTREV.js";
import {
  Point_default
} from "./chunk-BYB6RSDC.js";
import {
  deflateCoordinatesArray,
  deflateMultiCoordinatesArray,
  getLayoutForStride
} from "./chunk-S6ZHCVSZ.js";
import {
  equivalent,
  get3 as get,
  getTransform,
  transformExtent
} from "./chunk-QPOUXWMH.js";
import {
  isEmpty
} from "./chunk-MEYD4SA6.js";
import {
  abstract
} from "./chunk-JL7CNLN5.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/format/Feature.js
var FeatureFormat = class {
  constructor() {
    this.dataProjection = void 0;
    this.defaultFeatureProjection = void 0;
    this.featureClass = /** @type {FeatureToFeatureClass<FeatureType>} */
    Feature_default;
    this.supportedMediaTypes = null;
  }
  /**
   * Adds the data projection to the read options.
   * @param {Document|Element|Object|string} source Source.
   * @param {ReadOptions} [options] Options.
   * @return {ReadOptions|undefined} Options.
   * @protected
   */
  getReadOptions(source, options) {
    if (options) {
      let dataProjection = options.dataProjection ? get(options.dataProjection) : this.readProjection(source);
      if (options.extent && dataProjection && dataProjection.getUnits() === "tile-pixels") {
        dataProjection = get(dataProjection);
        dataProjection.setWorldExtent(options.extent);
      }
      options = {
        dataProjection,
        featureProjection: options.featureProjection
      };
    }
    return this.adaptOptions(options);
  }
  /**
   * Sets the `dataProjection` on the options, if no `dataProjection`
   * is set.
   * @param {WriteOptions|ReadOptions|undefined} options
   *     Options.
   * @protected
   * @return {WriteOptions|ReadOptions|undefined}
   *     Updated options.
   */
  adaptOptions(options) {
    return Object.assign({
      dataProjection: this.dataProjection,
      featureProjection: this.defaultFeatureProjection,
      featureClass: this.featureClass
    }, options);
  }
  /**
   * @abstract
   * @return {Type} The format type.
   */
  getType() {
    return abstract();
  }
  /**
   * Read a single feature from a source.
   *
   * @abstract
   * @param {Document|Element|Object|string} source Source.
   * @param {ReadOptions} [options] Read options.
   * @return {FeatureType|Array<FeatureType>} Feature.
   */
  readFeature(source, options) {
    return abstract();
  }
  /**
   * Read all features from a source.
   *
   * @abstract
   * @param {Document|Element|ArrayBuffer|Object|string} source Source.
   * @param {ReadOptions} [options] Read options.
   * @return {Array<FeatureType>} Features.
   */
  readFeatures(source, options) {
    return abstract();
  }
  /**
   * Read a single geometry from a source.
   *
   * @abstract
   * @param {Document|Element|Object|string} source Source.
   * @param {ReadOptions} [options] Read options.
   * @return {import("../geom/Geometry.js").default} Geometry.
   */
  readGeometry(source, options) {
    return abstract();
  }
  /**
   * Read the projection from a source.
   *
   * @abstract
   * @param {Document|Element|Object|string} source Source.
   * @return {import("../proj/Projection.js").default|undefined} Projection.
   */
  readProjection(source) {
    return abstract();
  }
  /**
   * Encode a feature in this format.
   *
   * @abstract
   * @param {Feature} feature Feature.
   * @param {WriteOptions} [options] Write options.
   * @return {string|ArrayBuffer} Result.
   */
  writeFeature(feature, options) {
    return abstract();
  }
  /**
   * Encode an array of features in this format.
   *
   * @abstract
   * @param {Array<Feature>} features Features.
   * @param {WriteOptions} [options] Write options.
   * @return {string|ArrayBuffer} Result.
   */
  writeFeatures(features, options) {
    return abstract();
  }
  /**
   * Write a single geometry in this format.
   *
   * @abstract
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {WriteOptions} [options] Write options.
   * @return {string|ArrayBuffer} Result.
   */
  writeGeometry(geometry, options) {
    return abstract();
  }
};
var Feature_default3 = FeatureFormat;
function transformGeometryWithOptions(geometry, write, options) {
  const featureProjection = options ? get(options.featureProjection) : null;
  const dataProjection = options ? get(options.dataProjection) : null;
  let transformed = geometry;
  if (featureProjection && dataProjection && !equivalent(featureProjection, dataProjection)) {
    if (write) {
      transformed = /** @type {T} */
      geometry.clone();
    }
    const fromProjection = write ? featureProjection : dataProjection;
    const toProjection = write ? dataProjection : featureProjection;
    if (fromProjection.getUnits() === "tile-pixels") {
      transformed.transform(fromProjection, toProjection);
    } else {
      transformed.applyTransform(getTransform(fromProjection, toProjection));
    }
  }
  if (write && options && /** @type {WriteOptions} */
  options.decimals !== void 0) {
    const power = Math.pow(
      10,
      /** @type {WriteOptions} */
      options.decimals
    );
    const transform = function(coordinates) {
      for (let i = 0, ii = coordinates.length; i < ii; ++i) {
        coordinates[i] = Math.round(coordinates[i] * power) / power;
      }
      return coordinates;
    };
    if (transformed === geometry) {
      transformed = /** @type {T} */
      geometry.clone();
    }
    transformed.applyTransform(transform);
  }
  return transformed;
}
function transformExtentWithOptions(extent, options) {
  const featureProjection = options ? get(options.featureProjection) : null;
  const dataProjection = options ? get(options.dataProjection) : null;
  if (featureProjection && dataProjection && !equivalent(featureProjection, dataProjection)) {
    return transformExtent(extent, dataProjection, featureProjection);
  }
  return extent;
}
var GeometryConstructor = {
  Point: Point_default,
  LineString: LineString_default,
  Polygon: Polygon_default,
  MultiPoint: MultiPoint_default,
  MultiLineString: MultiLineString_default,
  MultiPolygon: MultiPolygon_default
};
function orientFlatCoordinates(flatCoordinates, ends, stride) {
  if (Array.isArray(ends[0])) {
    if (!linearRingssAreOriented(flatCoordinates, 0, ends, stride)) {
      flatCoordinates = flatCoordinates.slice();
      orientLinearRingsArray(flatCoordinates, 0, ends, stride);
    }
    return flatCoordinates;
  }
  if (!linearRingsAreOriented(flatCoordinates, 0, ends, stride)) {
    flatCoordinates = flatCoordinates.slice();
    orientLinearRings(flatCoordinates, 0, ends, stride);
  }
  return flatCoordinates;
}
function createRenderFeature(object, options) {
  const geometry = object.geometry;
  if (!geometry) {
    return [];
  }
  if (Array.isArray(geometry)) {
    return geometry.map((geometry2) => createRenderFeature(__spreadProps(__spreadValues({}, object), {
      geometry: geometry2
    }))).flat();
  }
  const geometryType = geometry.type === "MultiPolygon" ? "Polygon" : geometry.type;
  if (geometryType === "GeometryCollection" || geometryType === "Circle") {
    throw new Error("Unsupported geometry type: " + geometryType);
  }
  const stride = geometry.layout.length;
  return transformGeometryWithOptions(new Feature_default2(geometryType, geometryType === "Polygon" ? orientFlatCoordinates(geometry.flatCoordinates, geometry.ends, stride) : geometry.flatCoordinates, geometry.ends?.flat(), stride, object.properties || {}, object.id).enableSimplifyTransformed(), false, options);
}
function createGeometry(object, options) {
  if (!object) {
    return null;
  }
  if (Array.isArray(object)) {
    const geometries = object.map((geometry) => createGeometry(geometry, options));
    return new GeometryCollection_default(geometries);
  }
  const Geometry = GeometryConstructor[object.type];
  return transformGeometryWithOptions(new Geometry(object.flatCoordinates, object.layout, object.ends), false, options);
}

// ../../node_modules/ol/format/JSONFeature.js
var JSONFeature = class extends Feature_default3 {
  constructor() {
    super();
  }
  /**
   * @return {import("./Feature.js").Type} Format.
   * @override
   */
  getType() {
    return "json";
  }
  /**
   * Read a feature.  Only works for a single feature. Use `readFeatures` to
   * read a feature collection.
   *
   * @param {ArrayBuffer|Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {FeatureType|Array<FeatureType>} Feature.
   * @api
   * @override
   */
  readFeature(source, options) {
    return this.readFeatureFromObject(getObject(source), this.getReadOptions(source, options));
  }
  /**
   * Read all features.  Works with both a single feature and a feature
   * collection.
   *
   * @param {ArrayBuffer|Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {Array<FeatureType>} Features.
   * @api
   * @override
   */
  readFeatures(source, options) {
    return this.readFeaturesFromObject(getObject(source), this.getReadOptions(source, options));
  }
  /**
   * @abstract
   * @param {Object} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {FeatureType|Array<FeatureType>} Feature.
   */
  readFeatureFromObject(object, options) {
    return abstract();
  }
  /**
   * @abstract
   * @param {Object} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {Array<FeatureType>} Features.
   */
  readFeaturesFromObject(object, options) {
    return abstract();
  }
  /**
   * Read a geometry.
   *
   * @param {ArrayBuffer|Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {import("../geom/Geometry.js").default} Geometry.
   * @api
   * @override
   */
  readGeometry(source, options) {
    return this.readGeometryFromObject(getObject(source), this.getReadOptions(source, options));
  }
  /**
   * @abstract
   * @param {Object} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {import("../geom/Geometry.js").default} Geometry.
   */
  readGeometryFromObject(object, options) {
    return abstract();
  }
  /**
   * Read the projection.
   *
   * @param {ArrayBuffer|Document|Element|Object|string} source Source.
   * @return {import("../proj/Projection.js").default} Projection.
   * @api
   * @override
   */
  readProjection(source) {
    return this.readProjectionFromObject(getObject(source));
  }
  /**
   * @abstract
   * @param {Object} object Object.
   * @protected
   * @return {import("../proj/Projection.js").default} Projection.
   */
  readProjectionFromObject(object) {
    return abstract();
  }
  /**
   * Encode a feature as string.
   *
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Encoded feature.
   * @api
   * @override
   */
  writeFeature(feature, options) {
    return JSON.stringify(this.writeFeatureObject(feature, options));
  }
  /**
   * @abstract
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {Object} Object.
   */
  writeFeatureObject(feature, options) {
    return abstract();
  }
  /**
   * Encode an array of features as string.
   *
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Encoded features.
   * @api
   * @override
   */
  writeFeatures(features, options) {
    return JSON.stringify(this.writeFeaturesObject(features, options));
  }
  /**
   * @abstract
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {Object} Object.
   */
  writeFeaturesObject(features, options) {
    return abstract();
  }
  /**
   * Encode a geometry as string.
   *
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Encoded geometry.
   * @api
   * @override
   */
  writeGeometry(geometry, options) {
    return JSON.stringify(this.writeGeometryObject(geometry, options));
  }
  /**
   * @abstract
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {Object} Object.
   */
  writeGeometryObject(geometry, options) {
    return abstract();
  }
};
function getObject(source) {
  if (typeof source === "string") {
    const object = JSON.parse(source);
    return object ? (
      /** @type {Object} */
      object
    ) : null;
  }
  if (source !== null) {
    return source;
  }
  return null;
}
var JSONFeature_default = JSONFeature;

// ../../node_modules/ol/format/GeoJSON.js
var GeoJSON = class extends JSONFeature_default {
  /**
   * @param {Options<FeatureType>} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};
    super();
    this.dataProjection = get(options.dataProjection ? options.dataProjection : "EPSG:4326");
    if (options.featureProjection) {
      this.defaultFeatureProjection = get(options.featureProjection);
    }
    if (options.featureClass) {
      this.featureClass = options.featureClass;
    }
    this.geometryName_ = options.geometryName;
    this.extractGeometryName_ = options.extractGeometryName;
    this.supportedMediaTypes = ["application/geo+json", "application/vnd.geo+json"];
  }
  /**
   * @param {Object} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {FeatureType|Array<FeatureType>} Feature.
   * @override
   */
  readFeatureFromObject(object, options) {
    let geoJSONFeature = null;
    if (object["type"] === "Feature") {
      geoJSONFeature = /** @type {GeoJSONFeature} */
      object;
    } else {
      geoJSONFeature = {
        "type": "Feature",
        "geometry": (
          /** @type {GeoJSONGeometry} */
          object
        ),
        "properties": null
      };
    }
    const geometry = readGeometryInternal(geoJSONFeature["geometry"], options);
    if (this.featureClass === Feature_default2) {
      return (
        /** @type {FeatureType|Array<FeatureType>} */
        createRenderFeature({
          geometry,
          id: geoJSONFeature["id"],
          properties: geoJSONFeature["properties"]
        }, options)
      );
    }
    const feature = new Feature_default();
    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_);
    } else if (this.extractGeometryName_ && geoJSONFeature["geometry_name"]) {
      feature.setGeometryName(geoJSONFeature["geometry_name"]);
    }
    feature.setGeometry(createGeometry(geometry, options));
    if ("id" in geoJSONFeature) {
      feature.setId(geoJSONFeature["id"]);
    }
    if (geoJSONFeature["properties"]) {
      feature.setProperties(geoJSONFeature["properties"], true);
    }
    return (
      /** @type {FeatureType|Array<FeatureType>} */
      feature
    );
  }
  /**
   * @param {Object} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {Array<FeatureType>} Features.
   * @override
   */
  readFeaturesFromObject(object, options) {
    const geoJSONObject = (
      /** @type {GeoJSONObject} */
      object
    );
    let features = null;
    if (geoJSONObject["type"] === "FeatureCollection") {
      const geoJSONFeatureCollection = (
        /** @type {GeoJSONFeatureCollection} */
        object
      );
      features = [];
      const geoJSONFeatures = geoJSONFeatureCollection["features"];
      for (let i = 0, ii = geoJSONFeatures.length; i < ii; ++i) {
        const featureObject = this.readFeatureFromObject(geoJSONFeatures[i], options);
        if (!featureObject) {
          continue;
        }
        features.push(featureObject);
      }
    } else {
      features = [this.readFeatureFromObject(object, options)];
    }
    return (
      /** @type {Array<FeatureType>} */
      features.flat()
    );
  }
  /**
   * @param {GeoJSONGeometry} object Object.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {import("../geom/Geometry.js").default} Geometry.
   * @override
   */
  readGeometryFromObject(object, options) {
    return readGeometry(object, options);
  }
  /**
   * @param {Object} object Object.
   * @protected
   * @return {import("../proj/Projection.js").default} Projection.
   * @override
   */
  readProjectionFromObject(object) {
    const crs = object["crs"];
    let projection;
    if (crs) {
      if (crs["type"] == "name") {
        projection = get(crs["properties"]["name"]);
      } else if (crs["type"] === "EPSG") {
        projection = get("EPSG:" + crs["properties"]["code"]);
      } else {
        throw new Error("Unknown SRS type");
      }
    } else {
      projection = this.dataProjection;
    }
    return (
      /** @type {import("../proj/Projection.js").default} */
      projection
    );
  }
  /**
   * Encode a feature as a GeoJSON Feature object.
   *
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {GeoJSONFeature} Object.
   * @api
   * @override
   */
  writeFeatureObject(feature, options) {
    options = this.adaptOptions(options);
    const object = {
      "type": "Feature",
      geometry: null,
      properties: null
    };
    const id = feature.getId();
    if (id !== void 0) {
      object.id = id;
    }
    if (!feature.hasProperties()) {
      return object;
    }
    const properties = feature.getProperties();
    const geometry = feature.getGeometry();
    if (geometry) {
      object.geometry = writeGeometry(geometry, options);
      delete properties[feature.getGeometryName()];
    }
    if (!isEmpty(properties)) {
      object.properties = properties;
    }
    return object;
  }
  /**
   * Encode an array of features as a GeoJSON object.
   *
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {GeoJSONFeatureCollection} GeoJSON Object.
   * @api
   * @override
   */
  writeFeaturesObject(features, options) {
    options = this.adaptOptions(options);
    const objects = [];
    for (let i = 0, ii = features.length; i < ii; ++i) {
      objects.push(this.writeFeatureObject(features[i], options));
    }
    return {
      type: "FeatureCollection",
      features: objects
    };
  }
  /**
   * Encode a geometry as a GeoJSON object.
   *
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {GeoJSONGeometry|GeoJSONGeometryCollection} Object.
   * @api
   * @override
   */
  writeGeometryObject(geometry, options) {
    return writeGeometry(geometry, this.adaptOptions(options));
  }
};
function readGeometryInternal(object, options) {
  if (!object) {
    return null;
  }
  let geometry;
  switch (object["type"]) {
    case "Point": {
      geometry = readPointGeometry(
        /** @type {GeoJSONPoint} */
        object
      );
      break;
    }
    case "LineString": {
      geometry = readLineStringGeometry(
        /** @type {GeoJSONLineString} */
        object
      );
      break;
    }
    case "Polygon": {
      geometry = readPolygonGeometry(
        /** @type {GeoJSONPolygon} */
        object
      );
      break;
    }
    case "MultiPoint": {
      geometry = readMultiPointGeometry(
        /** @type {GeoJSONMultiPoint} */
        object
      );
      break;
    }
    case "MultiLineString": {
      geometry = readMultiLineStringGeometry(
        /** @type {GeoJSONMultiLineString} */
        object
      );
      break;
    }
    case "MultiPolygon": {
      geometry = readMultiPolygonGeometry(
        /** @type {GeoJSONMultiPolygon} */
        object
      );
      break;
    }
    case "GeometryCollection": {
      geometry = readGeometryCollectionGeometry(
        /** @type {GeoJSONGeometryCollection} */
        object
      );
      break;
    }
    default: {
      throw new Error("Unsupported GeoJSON type: " + object["type"]);
    }
  }
  return geometry;
}
function readGeometry(object, options) {
  const geometryObject = readGeometryInternal(object, options);
  return createGeometry(geometryObject, options);
}
function readGeometryCollectionGeometry(object, options) {
  const geometries = object["geometries"].map(
    /**
     * @param {GeoJSONGeometry} geometry Geometry.
     * @return {import("./Feature.js").GeometryObject} geometry Geometry.
     */
    function(geometry) {
      return readGeometryInternal(geometry, options);
    }
  );
  return geometries;
}
function readPointGeometry(object) {
  const flatCoordinates = object["coordinates"];
  return {
    type: "Point",
    flatCoordinates,
    layout: getLayoutForStride(flatCoordinates.length)
  };
}
function readLineStringGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = coordinates.flat();
  return {
    type: "LineString",
    flatCoordinates,
    ends: [flatCoordinates.length],
    layout: getLayoutForStride(coordinates[0]?.length || 2)
  };
}
function readMultiLineStringGeometry(object) {
  const coordinates = object["coordinates"];
  const stride = coordinates[0]?.[0]?.length || 2;
  const flatCoordinates = [];
  const ends = deflateCoordinatesArray(flatCoordinates, 0, coordinates, stride);
  return {
    type: "MultiLineString",
    flatCoordinates,
    ends,
    layout: getLayoutForStride(stride)
  };
}
function readMultiPointGeometry(object) {
  const coordinates = object["coordinates"];
  return {
    type: "MultiPoint",
    flatCoordinates: coordinates.flat(),
    layout: getLayoutForStride(coordinates[0]?.length || 2)
  };
}
function readMultiPolygonGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = [];
  const stride = coordinates[0]?.[0]?.[0].length || 2;
  const endss = deflateMultiCoordinatesArray(flatCoordinates, 0, coordinates, stride);
  return {
    type: "MultiPolygon",
    flatCoordinates,
    ends: endss,
    layout: getLayoutForStride(stride)
  };
}
function readPolygonGeometry(object) {
  const coordinates = object["coordinates"];
  const flatCoordinates = [];
  const stride = coordinates[0]?.[0]?.length;
  const ends = deflateCoordinatesArray(flatCoordinates, 0, coordinates, stride);
  return {
    type: "Polygon",
    flatCoordinates,
    ends,
    layout: getLayoutForStride(stride)
  };
}
function writeGeometry(geometry, options) {
  geometry = transformGeometryWithOptions(geometry, true, options);
  const type = geometry.getType();
  let geoJSON;
  switch (type) {
    case "Point": {
      geoJSON = writePointGeometry(
        /** @type {import("../geom/Point.js").default} */
        geometry,
        options
      );
      break;
    }
    case "LineString": {
      geoJSON = writeLineStringGeometry(
        /** @type {import("../geom/LineString.js").default} */
        geometry,
        options
      );
      break;
    }
    case "Polygon": {
      geoJSON = writePolygonGeometry(
        /** @type {import("../geom/Polygon.js").default} */
        geometry,
        options
      );
      break;
    }
    case "MultiPoint": {
      geoJSON = writeMultiPointGeometry(
        /** @type {import("../geom/MultiPoint.js").default} */
        geometry,
        options
      );
      break;
    }
    case "MultiLineString": {
      geoJSON = writeMultiLineStringGeometry(
        /** @type {import("../geom/MultiLineString.js").default} */
        geometry,
        options
      );
      break;
    }
    case "MultiPolygon": {
      geoJSON = writeMultiPolygonGeometry(
        /** @type {import("../geom/MultiPolygon.js").default} */
        geometry,
        options
      );
      break;
    }
    case "GeometryCollection": {
      geoJSON = writeGeometryCollectionGeometry(
        /** @type {import("../geom/GeometryCollection.js").default} */
        geometry,
        options
      );
      break;
    }
    case "Circle": {
      geoJSON = {
        type: "GeometryCollection",
        geometries: []
      };
      break;
    }
    default: {
      throw new Error("Unsupported geometry type: " + type);
    }
  }
  return geoJSON;
}
function writeGeometryCollectionGeometry(geometry, options) {
  options = Object.assign({}, options);
  delete options.featureProjection;
  const geometries = geometry.getGeometriesArray().map(function(geometry2) {
    return writeGeometry(geometry2, options);
  });
  return {
    type: "GeometryCollection",
    geometries
  };
}
function writeLineStringGeometry(geometry, options) {
  return {
    type: "LineString",
    coordinates: geometry.getCoordinates()
  };
}
function writeMultiLineStringGeometry(geometry, options) {
  return {
    type: "MultiLineString",
    coordinates: geometry.getCoordinates()
  };
}
function writeMultiPointGeometry(geometry, options) {
  return {
    type: "MultiPoint",
    coordinates: geometry.getCoordinates()
  };
}
function writeMultiPolygonGeometry(geometry, options) {
  let right;
  if (options) {
    right = options.rightHanded;
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.getCoordinates(right)
  };
}
function writePointGeometry(geometry, options) {
  return {
    type: "Point",
    coordinates: geometry.getCoordinates()
  };
}
function writePolygonGeometry(geometry, options) {
  let right;
  if (options) {
    right = options.rightHanded;
  }
  return {
    type: "Polygon",
    coordinates: geometry.getCoordinates(right)
  };
}
var GeoJSON_default = GeoJSON;

export {
  Feature_default3 as Feature_default,
  transformGeometryWithOptions,
  transformExtentWithOptions,
  GeoJSON_default
};
//# sourceMappingURL=chunk-VWKLSPS7.js.map
