import {
  arrayMaxSquaredDelta,
  assignClosestArrayPoint,
  assignClosestPoint,
  douglasPeucker,
  maxSquaredDelta,
  quantizeArray
} from "./chunk-MXU547EQ.js";
import {
  intersectsLinearRingArray,
  linearRingsContainsXY
} from "./chunk-SUHIIPIP.js";
import {
  inflateCoordinates,
  inflateCoordinatesArray
} from "./chunk-V4YYR2FE.js";
import {
  Point_default
} from "./chunk-BYB6RSDC.js";
import {
  SimpleGeometry_default,
  deflateCoordinates,
  deflateCoordinatesArray
} from "./chunk-S6ZHCVSZ.js";
import {
  offset
} from "./chunk-VE7TNJGX.js";
import {
  closestSquaredDistanceXY,
  getCenter,
  isEmpty
} from "./chunk-IHYRLUFT.js";
import {
  modulo
} from "./chunk-3IATBWUD.js";
import {
  ascending,
  extend
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/geom/flat/area.js
function linearRing(flatCoordinates, offset2, end, stride) {
  let twiceArea = 0;
  const x0 = flatCoordinates[end - stride];
  const y0 = flatCoordinates[end - stride + 1];
  let dx1 = 0;
  let dy1 = 0;
  for (; offset2 < end; offset2 += stride) {
    const dx2 = flatCoordinates[offset2] - x0;
    const dy2 = flatCoordinates[offset2 + 1] - y0;
    twiceArea += dy1 * dx2 - dx1 * dy2;
    dx1 = dx2;
    dy1 = dy2;
  }
  return twiceArea / 2;
}
function linearRings(flatCoordinates, offset2, ends, stride) {
  let area = 0;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    area += linearRing(flatCoordinates, offset2, end, stride);
    offset2 = end;
  }
  return area;
}
function linearRingss(flatCoordinates, offset2, endss, stride) {
  let area = 0;
  for (let i = 0, ii = endss.length; i < ii; ++i) {
    const ends = endss[i];
    area += linearRings(flatCoordinates, offset2, ends, stride);
    offset2 = ends[ends.length - 1];
  }
  return area;
}

// ../../node_modules/ol/geom/LinearRing.js
var LinearRing = class _LinearRing extends SimpleGeometry_default {
  /**
   * @param {Array<import("../coordinate.js").Coordinate>|Array<number>} coordinates Coordinates.
   *     For internal use, flat coordinates in combination with `layout` are also accepted.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   */
  constructor(coordinates2, layout) {
    super();
    this.maxDelta_ = -1;
    this.maxDeltaRevision_ = -1;
    if (layout !== void 0 && !Array.isArray(coordinates2[0])) {
      this.setFlatCoordinates(
        layout,
        /** @type {Array<number>} */
        coordinates2
      );
    } else {
      this.setCoordinates(
        /** @type {Array<import("../coordinate.js").Coordinate>} */
        coordinates2,
        layout
      );
    }
  }
  /**
   * Make a complete copy of the geometry.
   * @return {!LinearRing} Clone.
   * @api
   * @override
   */
  clone() {
    return new _LinearRing(this.flatCoordinates.slice(), this.layout);
  }
  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   * @override
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
      return minSquaredDistance;
    }
    if (this.maxDeltaRevision_ != this.getRevision()) {
      this.maxDelta_ = Math.sqrt(maxSquaredDelta(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0));
      this.maxDeltaRevision_ = this.getRevision();
    }
    return assignClosestPoint(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
  }
  /**
   * Return the area of the linear ring on projected plane.
   * @return {number} Area (on projected plane).
   * @api
   */
  getArea() {
    return linearRing(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
  }
  /**
   * Return the coordinates of the linear ring.
   * @return {Array<import("../coordinate.js").Coordinate>} Coordinates.
   * @api
   * @override
   */
  getCoordinates() {
    return inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
  }
  /**
   * @param {number} squaredTolerance Squared tolerance.
   * @return {LinearRing} Simplified LinearRing.
   * @protected
   * @override
   */
  getSimplifiedGeometryInternal(squaredTolerance) {
    const simplifiedFlatCoordinates = [];
    simplifiedFlatCoordinates.length = douglasPeucker(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, squaredTolerance, simplifiedFlatCoordinates, 0);
    return new _LinearRing(simplifiedFlatCoordinates, "XY");
  }
  /**
   * Get the type of this geometry.
   * @return {import("./Geometry.js").Type} Geometry type.
   * @api
   * @override
   */
  getType() {
    return "LinearRing";
  }
  /**
   * Test if the geometry and the passed extent intersect.
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   * @api
   * @override
   */
  intersectsExtent(extent) {
    return false;
  }
  /**
   * Set the coordinates of the linear ring.
   * @param {!Array<import("../coordinate.js").Coordinate>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @api
   * @override
   */
  setCoordinates(coordinates2, layout) {
    this.setLayout(layout, coordinates2, 1);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    this.flatCoordinates.length = deflateCoordinates(this.flatCoordinates, 0, coordinates2, this.stride);
    this.changed();
  }
};
var LinearRing_default = LinearRing;

// ../../node_modules/ol/geom/flat/interiorpoint.js
function getInteriorPointOfArray(flatCoordinates, offset2, ends, stride, flatCenters, flatCentersOffset, dest) {
  let i, ii, x, x1, x2, y1, y2;
  const y = flatCenters[flatCentersOffset + 1];
  const intersections = [];
  for (let r = 0, rr = ends.length; r < rr; ++r) {
    const end = ends[r];
    x1 = flatCoordinates[end - stride];
    y1 = flatCoordinates[end - stride + 1];
    for (i = offset2; i < end; i += stride) {
      x2 = flatCoordinates[i];
      y2 = flatCoordinates[i + 1];
      if (y <= y1 && y2 <= y || y1 <= y && y <= y2) {
        x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
        intersections.push(x);
      }
      x1 = x2;
      y1 = y2;
    }
  }
  let pointX = NaN;
  let maxSegmentLength = -Infinity;
  intersections.sort(ascending);
  x1 = intersections[0];
  for (i = 1, ii = intersections.length; i < ii; ++i) {
    x2 = intersections[i];
    const segmentLength = Math.abs(x2 - x1);
    if (segmentLength > maxSegmentLength) {
      x = (x1 + x2) / 2;
      if (linearRingsContainsXY(flatCoordinates, offset2, ends, stride, x, y)) {
        pointX = x;
        maxSegmentLength = segmentLength;
      }
    }
    x1 = x2;
  }
  if (isNaN(pointX)) {
    pointX = flatCenters[flatCentersOffset];
  }
  if (dest) {
    dest.push(pointX, y, maxSegmentLength);
    return dest;
  }
  return [pointX, y, maxSegmentLength];
}
function getInteriorPointsOfMultiArray(flatCoordinates, offset2, endss, stride, flatCenters) {
  let interiorPoints = [];
  for (let i = 0, ii = endss.length; i < ii; ++i) {
    const ends = endss[i];
    interiorPoints = getInteriorPointOfArray(flatCoordinates, offset2, ends, stride, flatCenters, 2 * i, interiorPoints);
    offset2 = ends[ends.length - 1];
  }
  return interiorPoints;
}

// ../../node_modules/ol/geom/flat/reverse.js
function coordinates(flatCoordinates, offset2, end, stride) {
  while (offset2 < end - stride) {
    for (let i = 0; i < stride; ++i) {
      const tmp = flatCoordinates[offset2 + i];
      flatCoordinates[offset2 + i] = flatCoordinates[end - stride + i];
      flatCoordinates[end - stride + i] = tmp;
    }
    offset2 += stride;
    end -= stride;
  }
}

// ../../node_modules/ol/geom/flat/orient.js
function linearRingIsClockwise(flatCoordinates, offset2, end, stride) {
  let edge = 0;
  let x1 = flatCoordinates[end - stride];
  let y1 = flatCoordinates[end - stride + 1];
  for (; offset2 < end; offset2 += stride) {
    const x2 = flatCoordinates[offset2];
    const y2 = flatCoordinates[offset2 + 1];
    edge += (x2 - x1) * (y2 + y1);
    x1 = x2;
    y1 = y2;
  }
  return edge === 0 ? void 0 : edge > 0;
}
function linearRingsAreOriented(flatCoordinates, offset2, ends, stride, right) {
  right = right !== void 0 ? right : false;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    const isClockwise = linearRingIsClockwise(flatCoordinates, offset2, end, stride);
    if (i === 0) {
      if (right && isClockwise || !right && !isClockwise) {
        return false;
      }
    } else {
      if (right && !isClockwise || !right && isClockwise) {
        return false;
      }
    }
    offset2 = end;
  }
  return true;
}
function linearRingssAreOriented(flatCoordinates, offset2, endss, stride, right) {
  for (let i = 0, ii = endss.length; i < ii; ++i) {
    const ends = endss[i];
    if (!linearRingsAreOriented(flatCoordinates, offset2, ends, stride, right)) {
      return false;
    }
    if (ends.length) {
      offset2 = ends[ends.length - 1];
    }
  }
  return true;
}
function orientLinearRings(flatCoordinates, offset2, ends, stride, right) {
  right = right !== void 0 ? right : false;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    const isClockwise = linearRingIsClockwise(flatCoordinates, offset2, end, stride);
    const reverse = i === 0 ? right && isClockwise || !right && !isClockwise : right && !isClockwise || !right && isClockwise;
    if (reverse) {
      coordinates(flatCoordinates, offset2, end, stride);
    }
    offset2 = end;
  }
  return offset2;
}
function orientLinearRingsArray(flatCoordinates, offset2, endss, stride, right) {
  for (let i = 0, ii = endss.length; i < ii; ++i) {
    offset2 = orientLinearRings(flatCoordinates, offset2, endss[i], stride, right);
  }
  return offset2;
}
function inflateEnds(flatCoordinates, ends) {
  const endss = [];
  let offset2 = 0;
  let prevEndIndex = 0;
  let startOrientation;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    const orientation = linearRingIsClockwise(flatCoordinates, offset2, end, 2);
    if (startOrientation === void 0) {
      startOrientation = orientation;
    }
    if (orientation === startOrientation) {
      endss.push(ends.slice(prevEndIndex, i + 1));
    } else {
      if (endss.length === 0) {
        continue;
      }
      endss[endss.length - 1].push(ends[prevEndIndex]);
    }
    prevEndIndex = i + 1;
    offset2 = end;
  }
  return endss;
}

// ../../node_modules/ol/geom/Polygon.js
var Polygon = class _Polygon extends SimpleGeometry_default {
  /**
   * @param {!Array<Array<import("../coordinate.js").Coordinate>>|!Array<number>} coordinates
   *     Array of linear rings that define the polygon. The first linear ring of the
   *     array defines the outer-boundary or surface of the polygon. Each subsequent
   *     linear ring defines a hole in the surface of the polygon. A linear ring is
   *     an array of vertices' coordinates where the first coordinate and the last are
   *     equivalent. (For internal use, flat coordinates in combination with
   *     `layout` and `ends` are also accepted.)
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @param {Array<number>} [ends] Ends (for internal use with flat coordinates).
   */
  constructor(coordinates2, layout, ends) {
    super();
    this.ends_ = [];
    this.flatInteriorPointRevision_ = -1;
    this.flatInteriorPoint_ = null;
    this.maxDelta_ = -1;
    this.maxDeltaRevision_ = -1;
    this.orientedRevision_ = -1;
    this.orientedFlatCoordinates_ = null;
    if (layout !== void 0 && ends) {
      this.setFlatCoordinates(
        layout,
        /** @type {Array<number>} */
        coordinates2
      );
      this.ends_ = ends;
    } else {
      this.setCoordinates(
        /** @type {Array<Array<import("../coordinate.js").Coordinate>>} */
        coordinates2,
        layout
      );
    }
  }
  /**
   * Append the passed linear ring to this polygon.
   * @param {LinearRing} linearRing Linear ring.
   * @api
   */
  appendLinearRing(linearRing2) {
    if (!this.flatCoordinates) {
      this.flatCoordinates = linearRing2.getFlatCoordinates().slice();
    } else {
      extend(this.flatCoordinates, linearRing2.getFlatCoordinates());
    }
    this.ends_.push(this.flatCoordinates.length);
    this.changed();
  }
  /**
   * Make a complete copy of the geometry.
   * @return {!Polygon} Clone.
   * @api
   * @override
   */
  clone() {
    const polygon = new _Polygon(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
    polygon.applyProperties(this);
    return polygon;
  }
  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   * @override
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
      return minSquaredDistance;
    }
    if (this.maxDeltaRevision_ != this.getRevision()) {
      this.maxDelta_ = Math.sqrt(arrayMaxSquaredDelta(this.flatCoordinates, 0, this.ends_, this.stride, 0));
      this.maxDeltaRevision_ = this.getRevision();
    }
    return assignClosestArrayPoint(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
  }
  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @return {boolean} Contains (x, y).
   * @override
   */
  containsXY(x, y) {
    return linearRingsContainsXY(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, x, y);
  }
  /**
   * Return the area of the polygon on projected plane.
   * @return {number} Area (on projected plane).
   * @api
   */
  getArea() {
    return linearRings(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride);
  }
  /**
   * Get the coordinate array for this geometry.  This array has the structure
   * of a GeoJSON coordinate array for polygons.
   *
   * @param {boolean} [right] Orient coordinates according to the right-hand
   *     rule (counter-clockwise for exterior and clockwise for interior rings).
   *     If `false`, coordinates will be oriented according to the left-hand rule
   *     (clockwise for exterior and counter-clockwise for interior rings).
   *     By default, coordinate orientation will depend on how the geometry was
   *     constructed.
   * @return {Array<Array<import("../coordinate.js").Coordinate>>} Coordinates.
   * @api
   * @override
   */
  getCoordinates(right) {
    let flatCoordinates;
    if (right !== void 0) {
      flatCoordinates = this.getOrientedFlatCoordinates().slice();
      orientLinearRings(flatCoordinates, 0, this.ends_, this.stride, right);
    } else {
      flatCoordinates = this.flatCoordinates;
    }
    return inflateCoordinatesArray(flatCoordinates, 0, this.ends_, this.stride);
  }
  /**
   * @return {Array<number>} Ends.
   */
  getEnds() {
    return this.ends_;
  }
  /**
   * @return {Array<number>} Interior point.
   */
  getFlatInteriorPoint() {
    if (this.flatInteriorPointRevision_ != this.getRevision()) {
      const flatCenter = getCenter(this.getExtent());
      this.flatInteriorPoint_ = getInteriorPointOfArray(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, flatCenter, 0);
      this.flatInteriorPointRevision_ = this.getRevision();
    }
    return (
      /** @type {import("../coordinate.js").Coordinate} */
      this.flatInteriorPoint_
    );
  }
  /**
   * Return an interior point of the polygon.
   * @return {Point} Interior point as XYM coordinate, where M is the
   * length of the horizontal intersection that the point belongs to.
   * @api
   */
  getInteriorPoint() {
    return new Point_default(this.getFlatInteriorPoint(), "XYM");
  }
  /**
   * Return the number of rings of the polygon,  this includes the exterior
   * ring and any interior rings.
   *
   * @return {number} Number of rings.
   * @api
   */
  getLinearRingCount() {
    return this.ends_.length;
  }
  /**
   * Return the Nth linear ring of the polygon geometry. Return `null` if the
   * given index is out of range.
   * The exterior linear ring is available at index `0` and the interior rings
   * at index `1` and beyond.
   *
   * @param {number} index Index.
   * @return {LinearRing|null} Linear ring.
   * @api
   */
  getLinearRing(index) {
    if (index < 0 || this.ends_.length <= index) {
      return null;
    }
    return new LinearRing_default(this.flatCoordinates.slice(index === 0 ? 0 : this.ends_[index - 1], this.ends_[index]), this.layout);
  }
  /**
   * Return the linear rings of the polygon.
   * @return {Array<LinearRing>} Linear rings.
   * @api
   */
  getLinearRings() {
    const layout = this.layout;
    const flatCoordinates = this.flatCoordinates;
    const ends = this.ends_;
    const linearRings2 = [];
    let offset2 = 0;
    for (let i = 0, ii = ends.length; i < ii; ++i) {
      const end = ends[i];
      const linearRing2 = new LinearRing_default(flatCoordinates.slice(offset2, end), layout);
      linearRings2.push(linearRing2);
      offset2 = end;
    }
    return linearRings2;
  }
  /**
   * @return {Array<number>} Oriented flat coordinates.
   */
  getOrientedFlatCoordinates() {
    if (this.orientedRevision_ != this.getRevision()) {
      const flatCoordinates = this.flatCoordinates;
      if (linearRingsAreOriented(flatCoordinates, 0, this.ends_, this.stride)) {
        this.orientedFlatCoordinates_ = flatCoordinates;
      } else {
        this.orientedFlatCoordinates_ = flatCoordinates.slice();
        this.orientedFlatCoordinates_.length = orientLinearRings(this.orientedFlatCoordinates_, 0, this.ends_, this.stride);
      }
      this.orientedRevision_ = this.getRevision();
    }
    return (
      /** @type {Array<number>} */
      this.orientedFlatCoordinates_
    );
  }
  /**
   * @param {number} squaredTolerance Squared tolerance.
   * @return {Polygon} Simplified Polygon.
   * @protected
   * @override
   */
  getSimplifiedGeometryInternal(squaredTolerance) {
    const simplifiedFlatCoordinates = [];
    const simplifiedEnds = [];
    simplifiedFlatCoordinates.length = quantizeArray(this.flatCoordinates, 0, this.ends_, this.stride, Math.sqrt(squaredTolerance), simplifiedFlatCoordinates, 0, simplifiedEnds);
    return new _Polygon(simplifiedFlatCoordinates, "XY", simplifiedEnds);
  }
  /**
   * Get the type of this geometry.
   * @return {import("./Geometry.js").Type} Geometry type.
   * @api
   * @override
   */
  getType() {
    return "Polygon";
  }
  /**
   * Test if the geometry and the passed extent intersect.
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   * @api
   * @override
   */
  intersectsExtent(extent) {
    return intersectsLinearRingArray(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, extent);
  }
  /**
   * Set the coordinates of the polygon.
   * @param {!Array<Array<import("../coordinate.js").Coordinate>>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @api
   * @override
   */
  setCoordinates(coordinates2, layout) {
    this.setLayout(layout, coordinates2, 2);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    const ends = deflateCoordinatesArray(this.flatCoordinates, 0, coordinates2, this.stride, this.ends_);
    this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
    this.changed();
  }
};
var Polygon_default = Polygon;
function circular(center, radius, n, sphereRadius) {
  n = n ? n : 32;
  const flatCoordinates = [];
  for (let i = 0; i < n; ++i) {
    extend(flatCoordinates, offset(center, radius, 2 * Math.PI * i / n, sphereRadius));
  }
  flatCoordinates.push(flatCoordinates[0], flatCoordinates[1]);
  return new Polygon(flatCoordinates, "XY", [flatCoordinates.length]);
}
function fromExtent(extent) {
  if (isEmpty(extent)) {
    throw new Error("Cannot create polygon from empty extent");
  }
  const minX = extent[0];
  const minY = extent[1];
  const maxX = extent[2];
  const maxY = extent[3];
  const flatCoordinates = [minX, minY, minX, maxY, maxX, maxY, maxX, minY, minX, minY];
  return new Polygon(flatCoordinates, "XY", [flatCoordinates.length]);
}
function fromCircle(circle, sides, angle) {
  sides = sides ? sides : 32;
  const stride = circle.getStride();
  const layout = circle.getLayout();
  const center = circle.getCenter();
  const arrayLength = stride * (sides + 1);
  const flatCoordinates = new Array(arrayLength);
  for (let i = 0; i < arrayLength; i += stride) {
    flatCoordinates[i] = 0;
    flatCoordinates[i + 1] = 0;
    for (let j = 2; j < stride; j++) {
      flatCoordinates[i + j] = center[j];
    }
  }
  const ends = [flatCoordinates.length];
  const polygon = new Polygon(flatCoordinates, layout, ends);
  makeRegular(polygon, center, circle.getRadius(), angle);
  return polygon;
}
function makeRegular(polygon, center, radius, angle) {
  const flatCoordinates = polygon.getFlatCoordinates();
  const stride = polygon.getStride();
  const sides = flatCoordinates.length / stride - 1;
  const startAngle = angle ? angle : 0;
  for (let i = 0; i <= sides; ++i) {
    const offset2 = i * stride;
    const angle2 = startAngle + modulo(i, sides) * 2 * Math.PI / sides;
    flatCoordinates[offset2] = center[0] + radius * Math.cos(angle2);
    flatCoordinates[offset2 + 1] = center[1] + radius * Math.sin(angle2);
  }
  polygon.changed();
}

export {
  linearRingss,
  LinearRing_default,
  getInteriorPointOfArray,
  getInteriorPointsOfMultiArray,
  linearRingsAreOriented,
  linearRingssAreOriented,
  orientLinearRings,
  orientLinearRingsArray,
  inflateEnds,
  Polygon_default,
  circular,
  fromExtent,
  fromCircle,
  makeRegular
};
//# sourceMappingURL=chunk-CPUVTREV.js.map
