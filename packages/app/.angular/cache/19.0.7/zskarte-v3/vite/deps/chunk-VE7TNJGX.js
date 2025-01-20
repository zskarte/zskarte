import {
  toDegrees,
  toRadians
} from "./chunk-3IATBWUD.js";

// ../../node_modules/ol/sphere.js
var DEFAULT_RADIUS = 63710088e-1;
function getDistance(c1, c2, radius) {
  radius = radius || DEFAULT_RADIUS;
  const lat1 = toRadians(c1[1]);
  const lat2 = toRadians(c2[1]);
  const deltaLatBy2 = (lat2 - lat1) / 2;
  const deltaLonBy2 = toRadians(c2[0] - c1[0]) / 2;
  const a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) + Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getLengthInternal(coordinates, radius) {
  let length = 0;
  for (let i = 0, ii = coordinates.length; i < ii - 1; ++i) {
    length += getDistance(coordinates[i], coordinates[i + 1], radius);
  }
  return length;
}
function getLength(geometry, options) {
  options = options || {};
  const radius = options.radius || DEFAULT_RADIUS;
  const projection = options.projection || "EPSG:3857";
  const type = geometry.getType();
  if (type !== "GeometryCollection") {
    geometry = geometry.clone().transform(projection, "EPSG:4326");
  }
  let length = 0;
  let coordinates, coords, i, ii, j, jj;
  switch (type) {
    case "Point":
    case "MultiPoint": {
      break;
    }
    case "LineString":
    case "LinearRing": {
      coordinates = /** @type {import("./geom/SimpleGeometry.js").default} */
      geometry.getCoordinates();
      length = getLengthInternal(coordinates, radius);
      break;
    }
    case "MultiLineString":
    case "Polygon": {
      coordinates = /** @type {import("./geom/SimpleGeometry.js").default} */
      geometry.getCoordinates();
      for (i = 0, ii = coordinates.length; i < ii; ++i) {
        length += getLengthInternal(coordinates[i], radius);
      }
      break;
    }
    case "MultiPolygon": {
      coordinates = /** @type {import("./geom/SimpleGeometry.js").default} */
      geometry.getCoordinates();
      for (i = 0, ii = coordinates.length; i < ii; ++i) {
        coords = coordinates[i];
        for (j = 0, jj = coords.length; j < jj; ++j) {
          length += getLengthInternal(coords[j], radius);
        }
      }
      break;
    }
    case "GeometryCollection": {
      const geometries = (
        /** @type {import("./geom/GeometryCollection.js").default} */
        geometry.getGeometries()
      );
      for (i = 0, ii = geometries.length; i < ii; ++i) {
        length += getLength(geometries[i], options);
      }
      break;
    }
    default: {
      throw new Error("Unsupported geometry type: " + type);
    }
  }
  return length;
}
function getAreaInternal(coordinates, radius) {
  let area = 0;
  const len = coordinates.length;
  let x1 = coordinates[len - 1][0];
  let y1 = coordinates[len - 1][1];
  for (let i = 0; i < len; i++) {
    const x2 = coordinates[i][0];
    const y2 = coordinates[i][1];
    area += toRadians(x2 - x1) * (2 + Math.sin(toRadians(y1)) + Math.sin(toRadians(y2)));
    x1 = x2;
    y1 = y2;
  }
  return area * radius * radius / 2;
}
function getArea(geometry, options) {
  options = options || {};
  const radius = options.radius || DEFAULT_RADIUS;
  const projection = options.projection || "EPSG:3857";
  const type = geometry.getType();
  if (type !== "GeometryCollection") {
    geometry = geometry.clone().transform(projection, "EPSG:4326");
  }
  let area = 0;
  let coordinates, coords, i, ii, j, jj;
  switch (type) {
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
    case "LinearRing": {
      break;
    }
    case "Polygon": {
      coordinates = /** @type {import("./geom/Polygon.js").default} */
      geometry.getCoordinates();
      area = Math.abs(getAreaInternal(coordinates[0], radius));
      for (i = 1, ii = coordinates.length; i < ii; ++i) {
        area -= Math.abs(getAreaInternal(coordinates[i], radius));
      }
      break;
    }
    case "MultiPolygon": {
      coordinates = /** @type {import("./geom/SimpleGeometry.js").default} */
      geometry.getCoordinates();
      for (i = 0, ii = coordinates.length; i < ii; ++i) {
        coords = coordinates[i];
        area += Math.abs(getAreaInternal(coords[0], radius));
        for (j = 1, jj = coords.length; j < jj; ++j) {
          area -= Math.abs(getAreaInternal(coords[j], radius));
        }
      }
      break;
    }
    case "GeometryCollection": {
      const geometries = (
        /** @type {import("./geom/GeometryCollection.js").default} */
        geometry.getGeometries()
      );
      for (i = 0, ii = geometries.length; i < ii; ++i) {
        area += getArea(geometries[i], options);
      }
      break;
    }
    default: {
      throw new Error("Unsupported geometry type: " + type);
    }
  }
  return area;
}
function offset(c1, distance, bearing, radius) {
  radius = radius || DEFAULT_RADIUS;
  const lat1 = toRadians(c1[1]);
  const lon1 = toRadians(c1[0]);
  const dByR = distance / radius;
  const lat = Math.asin(Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
  const lon = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1), Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat));
  return [toDegrees(lon), toDegrees(lat)];
}

export {
  DEFAULT_RADIUS,
  getDistance,
  getLength,
  getArea,
  offset
};
//# sourceMappingURL=chunk-VE7TNJGX.js.map
