import {
  DataTile_default
} from "./chunk-PRRJBTUU.js";
import "./chunk-NC7UNPN5.js";
import "./chunk-5Y3T7XVU.js";
import {
  OBJECT_PROPERTY_NODE_FACTORY,
  XML_SCHEMA_INSTANCE_URI,
  createElementNS,
  getAllTextContent,
  getAttributeNS,
  getXMLSerializer,
  isDocument,
  makeArrayExtender,
  makeArrayPusher,
  makeArraySerializer,
  makeChildAppender,
  makeObjectPropertySetter,
  makeReplacer,
  makeSequence,
  makeSimpleNodeFactory,
  makeStructureNS,
  parse,
  parseNode,
  pushParseAndPop,
  pushSerializeAndPop,
  readBoolean,
  readDateTime,
  readDecimal,
  readNonNegativeIntegerString,
  readPositiveInteger,
  readString,
  writeBooleanTextNode,
  writeCDATASection,
  writeDateTimeTextNode,
  writeDecimalTextNode,
  writeNonNegativeIntegerTextNode,
  writeStringTextNode
} from "./chunk-DC4OT5QG.js";
import {
  MVT_default
} from "./chunk-73YC4BIM.js";
import {
  VectorTile_default
} from "./chunk-MFLHN2YP.js";
import "./chunk-45BLP2OC.js";
import {
  createXYZ,
  extentFromProjection
} from "./chunk-Z7PA7HSF.js";
import "./chunk-PNEWLMU7.js";
import "./chunk-TLKYGVK5.js";
import "./chunk-L24RXRRH.js";
import "./chunk-PMSTMQL3.js";
import "./chunk-CJZ66Y35.js";
import {
  Feature_default as Feature_default2,
  transformExtentWithOptions,
  transformGeometryWithOptions
} from "./chunk-VWKLSPS7.js";
import "./chunk-UQ5VBCTK.js";
import "./chunk-WUEFYFM4.js";
import "./chunk-K5VWTFZZ.js";
import "./chunk-ABQOD32P.js";
import {
  TileState_default
} from "./chunk-WFUVBADM.js";
import {
  decompressSync
} from "./chunk-JCP26DSW.js";
import "./chunk-37JEKLY7.js";
import "./chunk-6MWGMXNZ.js";
import {
  Feature_default
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
import "./chunk-SVNYXP6R.js";
import {
  Text_default
} from "./chunk-CZ5OJR36.js";
import {
  Style_default
} from "./chunk-QX64YE7P.js";
import {
  Stroke_default
} from "./chunk-ROPZLQH3.js";
import {
  Icon_default
} from "./chunk-6EYMMMQV.js";
import "./chunk-TXTFX4RY.js";
import "./chunk-2RIYM3D5.js";
import "./chunk-EA4JZPIY.js";
import {
  Fill_default
} from "./chunk-JHWQPIRE.js";
import "./chunk-JNDXFVRB.js";
import "./chunk-QVNGVDO5.js";
import {
  asArray
} from "./chunk-QABMMYJI.js";
import {
  ImageState_default
} from "./chunk-73LIRBW3.js";
import "./chunk-AIKGHEYG.js";
import "./chunk-GA2V7BR7.js";
import "./chunk-FJKL6GEV.js";
import {
  LinearRing_default,
  Polygon_default
} from "./chunk-CPUVTREV.js";
import "./chunk-MXU547EQ.js";
import "./chunk-SUHIIPIP.js";
import "./chunk-V4YYR2FE.js";
import {
  Point_default
} from "./chunk-BYB6RSDC.js";
import {
  Geometry_default
} from "./chunk-S6ZHCVSZ.js";
import "./chunk-5DM6XDPZ.js";
import {
  assert
} from "./chunk-IRDKPWWT.js";
import "./chunk-MCYH4ZL5.js";
import {
  get3 as get
} from "./chunk-QPOUXWMH.js";
import "./chunk-VE7TNJGX.js";
import {
  createOrUpdate
} from "./chunk-IHYRLUFT.js";
import "./chunk-YKLFYZ2P.js";
import "./chunk-X7DDFSZC.js";
import "./chunk-MEYD4SA6.js";
import {
  toRadians
} from "./chunk-3IATBWUD.js";
import {
  abstract
} from "./chunk-JL7CNLN5.js";
import {
  extend
} from "./chunk-LBIH33AC.js";
import "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/format/XMLFeature.js
var XMLFeature = class extends Feature_default2 {
  constructor() {
    super();
    this.xmlSerializer_ = getXMLSerializer();
  }
  /**
   * @return {import("./Feature.js").Type} Format.
   * @override
   */
  getType() {
    return "xml";
  }
  /**
   * Read a single feature.
   *
   * @param {Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {import("../Feature.js").default} Feature.
   * @api
   * @override
   */
  readFeature(source, options) {
    if (!source) {
      return null;
    }
    if (typeof source === "string") {
      const doc = parse(source);
      return this.readFeatureFromDocument(doc, options);
    }
    if (isDocument(source)) {
      return this.readFeatureFromDocument(
        /** @type {Document} */
        source,
        options
      );
    }
    return this.readFeatureFromNode(
      /** @type {Element} */
      source,
      options
    );
  }
  /**
   * @param {Document} doc Document.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @return {import("../Feature.js").default} Feature.
   */
  readFeatureFromDocument(doc, options) {
    const features = this.readFeaturesFromDocument(doc, options);
    if (features.length > 0) {
      return features[0];
    }
    return null;
  }
  /**
   * @param {Element} node Node.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @return {import("../Feature.js").default} Feature.
   */
  readFeatureFromNode(node, options) {
    return null;
  }
  /**
   * Read all features from a feature collection.
   *
   * @param {Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @return {Array<import("../Feature.js").default>} Features.
   * @api
   * @override
   */
  readFeatures(source, options) {
    if (!source) {
      return [];
    }
    if (typeof source === "string") {
      const doc = parse(source);
      return this.readFeaturesFromDocument(doc, options);
    }
    if (isDocument(source)) {
      return this.readFeaturesFromDocument(
        /** @type {Document} */
        source,
        options
      );
    }
    return this.readFeaturesFromNode(
      /** @type {Element} */
      source,
      options
    );
  }
  /**
   * @param {Document} doc Document.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @protected
   * @return {Array<import("../Feature.js").default>} Features.
   */
  readFeaturesFromDocument(doc, options) {
    const features = [];
    for (let n = doc.firstChild; n; n = n.nextSibling) {
      if (n.nodeType == Node.ELEMENT_NODE) {
        extend(features, this.readFeaturesFromNode(
          /** @type {Element} */
          n,
          options
        ));
      }
    }
    return features;
  }
  /**
   * @abstract
   * @param {Element} node Node.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @protected
   * @return {Array<import("../Feature.js").default>} Features.
   */
  readFeaturesFromNode(node, options) {
    return abstract();
  }
  /**
   * Read a single geometry from a source.
   *
   * @param {Document|Element|Object|string} source Source.
   * @param {import("./Feature.js").ReadOptions} [options] Read options.
   * @return {import("../geom/Geometry.js").default} Geometry.
   * @override
   */
  readGeometry(source, options) {
    if (!source) {
      return null;
    }
    if (typeof source === "string") {
      const doc = parse(source);
      return this.readGeometryFromDocument(doc, options);
    }
    if (isDocument(source)) {
      return this.readGeometryFromDocument(
        /** @type {Document} */
        source,
        options
      );
    }
    return this.readGeometryFromNode(
      /** @type {Element} */
      source,
      options
    );
  }
  /**
   * @param {Document} doc Document.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @protected
   * @return {import("../geom/Geometry.js").default} Geometry.
   */
  readGeometryFromDocument(doc, options) {
    return null;
  }
  /**
   * @param {Element} node Node.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @protected
   * @return {import("../geom/Geometry.js").default} Geometry.
   */
  readGeometryFromNode(node, options) {
    return null;
  }
  /**
   * Read the projection from the source.
   *
   * @param {Document|Element|Object|string} source Source.
   * @return {import("../proj/Projection.js").default} Projection.
   * @api
   * @override
   */
  readProjection(source) {
    if (!source) {
      return null;
    }
    if (typeof source === "string") {
      const doc = parse(source);
      return this.readProjectionFromDocument(doc);
    }
    if (isDocument(source)) {
      return this.readProjectionFromDocument(
        /** @type {Document} */
        source
      );
    }
    return this.readProjectionFromNode(
      /** @type {Element} */
      source
    );
  }
  /**
   * @param {Document} doc Document.
   * @protected
   * @return {import("../proj/Projection.js").default} Projection.
   */
  readProjectionFromDocument(doc) {
    return this.dataProjection;
  }
  /**
   * @param {Element} node Node.
   * @protected
   * @return {import("../proj/Projection.js").default} Projection.
   */
  readProjectionFromNode(node) {
    return this.dataProjection;
  }
  /**
   * Encode a feature as string.
   *
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Encoded feature.
   * @override
   */
  writeFeature(feature, options) {
    const node = this.writeFeatureNode(feature, options);
    return this.xmlSerializer_.serializeToString(node);
  }
  /**
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("./Feature.js").WriteOptions} [options] Options.
   * @protected
   * @return {Node} Node.
   */
  writeFeatureNode(feature, options) {
    return null;
  }
  /**
   * Encode an array of features as string.
   *
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Result.
   * @api
   * @override
   */
  writeFeatures(features, options) {
    const node = this.writeFeaturesNode(features, options);
    return this.xmlSerializer_.serializeToString(node);
  }
  /**
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Options.
   * @return {Node} Node.
   */
  writeFeaturesNode(features, options) {
    return null;
  }
  /**
   * Encode a geometry as string.
   *
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Write options.
   * @return {string} Encoded geometry.
   * @override
   */
  writeGeometry(geometry, options) {
    const node = this.writeGeometryNode(geometry, options);
    return this.xmlSerializer_.serializeToString(node);
  }
  /**
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Options.
   * @return {Node} Node.
   */
  writeGeometryNode(geometry, options) {
    return null;
  }
};
var XMLFeature_default = XMLFeature;

// ../../node_modules/ol/format/GMLBase.js
var GMLNS = "http://www.opengis.net/gml";
var ONLY_WHITESPACE_RE = /^\s*$/;
var GMLBase = class extends XMLFeature_default {
  /**
   * @param {Options} [options] Optional configuration object.
   */
  constructor(options) {
    super();
    options = options ? options : {};
    this.featureType = options.featureType;
    this.featureNS = options.featureNS;
    this.srsName = options.srsName;
    this.schemaLocation = "";
    this.FEATURE_COLLECTION_PARSERS = {};
    this.FEATURE_COLLECTION_PARSERS[this.namespace] = {
      "featureMember": makeArrayPusher(this.readFeaturesInternal),
      "featureMembers": makeReplacer(this.readFeaturesInternal)
    };
    this.supportedMediaTypes = ["application/gml+xml"];
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<Feature> | undefined} Features.
   */
  readFeaturesInternal(node, objectStack) {
    const localName = node.localName;
    let features = null;
    if (localName == "FeatureCollection") {
      features = pushParseAndPop([], this.FEATURE_COLLECTION_PARSERS, node, objectStack, this);
    } else if (localName == "featureMembers" || localName == "featureMember" || localName == "member") {
      const context = objectStack[0];
      let featureType = context["featureType"];
      let featureNS = context["featureNS"];
      const prefix = "p";
      const defaultPrefix = "p0";
      if (!featureType && node.childNodes) {
        featureType = [], featureNS = {};
        for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
          const child = (
            /** @type {Element} */
            node.childNodes[i]
          );
          if (child.nodeType === 1) {
            const ft = child.nodeName.split(":").pop();
            if (!featureType.includes(ft)) {
              let key = "";
              let count = 0;
              const uri = child.namespaceURI;
              for (const candidate in featureNS) {
                if (featureNS[candidate] === uri) {
                  key = candidate;
                  break;
                }
                ++count;
              }
              if (!key) {
                key = prefix + count;
                featureNS[key] = uri;
              }
              featureType.push(key + ":" + ft);
            }
          }
        }
        if (localName != "featureMember") {
          context["featureType"] = featureType;
          context["featureNS"] = featureNS;
        }
      }
      if (typeof featureNS === "string") {
        const ns = featureNS;
        featureNS = {};
        featureNS[defaultPrefix] = ns;
      }
      const parsersNS = {};
      const featureTypes = Array.isArray(featureType) ? featureType : [featureType];
      for (const p in featureNS) {
        const parsers = {};
        for (let i = 0, ii = featureTypes.length; i < ii; ++i) {
          const featurePrefix = featureTypes[i].includes(":") ? featureTypes[i].split(":")[0] : defaultPrefix;
          if (featurePrefix === p) {
            parsers[featureTypes[i].split(":").pop()] = localName == "featureMembers" ? makeArrayPusher(this.readFeatureElement, this) : makeReplacer(this.readFeatureElement, this);
          }
        }
        parsersNS[featureNS[p]] = parsers;
      }
      if (localName == "featureMember" || localName == "member") {
        features = pushParseAndPop(void 0, parsersNS, node, objectStack);
      } else {
        features = pushParseAndPop([], parsersNS, node, objectStack);
      }
    }
    if (features === null) {
      features = [];
    }
    return features;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {import("../geom/Geometry.js").default|import("../extent.js").Extent|undefined} Geometry.
   */
  readGeometryOrExtent(node, objectStack) {
    const context = (
      /** @type {Object} */
      objectStack[0]
    );
    context["srsName"] = node.firstElementChild.getAttribute("srsName");
    context["srsDimension"] = node.firstElementChild.getAttribute("srsDimension");
    return pushParseAndPop(null, this.GEOMETRY_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {import("../extent.js").Extent|undefined} Geometry.
   */
  readExtentElement(node, objectStack) {
    const context = (
      /** @type {Object} */
      objectStack[0]
    );
    const extent = (
      /** @type {import("../extent.js").Extent} */
      this.readGeometryOrExtent(node, objectStack)
    );
    return extent ? transformExtentWithOptions(extent, context) : void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {import("../geom/Geometry.js").default|undefined} Geometry.
   */
  readGeometryElement(node, objectStack) {
    const context = (
      /** @type {Object} */
      objectStack[0]
    );
    const geometry = (
      /** @type {import("../geom/Geometry.js").default} */
      this.readGeometryOrExtent(node, objectStack)
    );
    return geometry ? transformGeometryWithOptions(geometry, false, context) : void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @param {boolean} asFeature whether result should be wrapped as a feature.
   * @return {Feature|Object} Feature
   */
  readFeatureElementInternal(node, objectStack, asFeature) {
    let geometryName;
    const values = {};
    for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
      let value;
      const localName = n.localName;
      if (n.childNodes.length === 0 || n.childNodes.length === 1 && (n.firstChild.nodeType === 3 || n.firstChild.nodeType === 4)) {
        value = getAllTextContent(n, false);
        if (ONLY_WHITESPACE_RE.test(value)) {
          value = void 0;
        }
      } else {
        if (asFeature) {
          value = localName === "boundedBy" ? this.readExtentElement(n, objectStack) : this.readGeometryElement(n, objectStack);
        }
        if (!value) {
          value = this.readFeatureElementInternal(n, objectStack, false);
        } else if (localName !== "boundedBy") {
          geometryName = localName;
        }
      }
      const len = n.attributes.length;
      if (len > 0 && !(value instanceof Geometry_default)) {
        value = {
          _content_: value
        };
        for (let i = 0; i < len; i++) {
          const attName = n.attributes[i].name;
          value[attName] = n.attributes[i].value;
        }
      }
      if (values[localName]) {
        if (!(values[localName] instanceof Array)) {
          values[localName] = [values[localName]];
        }
        values[localName].push(value);
      } else {
        values[localName] = value;
      }
    }
    if (!asFeature) {
      return values;
    }
    const feature = new Feature_default(values);
    if (geometryName) {
      feature.setGeometryName(geometryName);
    }
    const fid = node.getAttribute("fid") || getAttributeNS(node, this.namespace, "id");
    if (fid) {
      feature.setId(fid);
    }
    return feature;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Feature} Feature.
   */
  readFeatureElement(node, objectStack) {
    return this.readFeatureElementInternal(node, objectStack, true);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Point|undefined} Point.
   */
  readPoint(node, objectStack) {
    const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
    if (flatCoordinates) {
      return new Point_default(flatCoordinates, "XYZ");
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {MultiPoint|undefined} MultiPoint.
   */
  readMultiPoint(node, objectStack) {
    const coordinates = pushParseAndPop([], this.MULTIPOINT_PARSERS, node, objectStack, this);
    if (coordinates) {
      return new MultiPoint_default(coordinates);
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {MultiLineString|undefined} MultiLineString.
   */
  readMultiLineString(node, objectStack) {
    const lineStrings = pushParseAndPop([], this.MULTILINESTRING_PARSERS, node, objectStack, this);
    if (lineStrings) {
      return new MultiLineString_default(lineStrings);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {MultiPolygon|undefined} MultiPolygon.
   */
  readMultiPolygon(node, objectStack) {
    const polygons = pushParseAndPop([], this.MULTIPOLYGON_PARSERS, node, objectStack, this);
    if (polygons) {
      return new MultiPolygon_default(polygons);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  pointMemberParser(node, objectStack) {
    parseNode(this.POINTMEMBER_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  lineStringMemberParser(node, objectStack) {
    parseNode(this.LINESTRINGMEMBER_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  polygonMemberParser(node, objectStack) {
    parseNode(this.POLYGONMEMBER_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {LineString|undefined} LineString.
   */
  readLineString(node, objectStack) {
    const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
    if (flatCoordinates) {
      const lineString = new LineString_default(flatCoordinates, "XYZ");
      return lineString;
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} LinearRing flat coordinates.
   */
  readFlatLinearRing(node, objectStack) {
    const ring = pushParseAndPop(null, this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
    if (ring) {
      return ring;
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {LinearRing|undefined} LinearRing.
   */
  readLinearRing(node, objectStack) {
    const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
    if (flatCoordinates) {
      return new LinearRing_default(flatCoordinates, "XYZ");
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Polygon|undefined} Polygon.
   */
  readPolygon(node, objectStack) {
    const flatLinearRings = pushParseAndPop([null], this.FLAT_LINEAR_RINGS_PARSERS, node, objectStack, this);
    if (flatLinearRings && flatLinearRings[0]) {
      const flatCoordinates = flatLinearRings[0];
      const ends = [flatCoordinates.length];
      let i, ii;
      for (i = 1, ii = flatLinearRings.length; i < ii; ++i) {
        extend(flatCoordinates, flatLinearRings[i]);
        ends.push(flatCoordinates.length);
      }
      return new Polygon_default(flatCoordinates, "XYZ", ends);
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>} Flat coordinates.
   */
  readFlatCoordinatesFromNode(node, objectStack) {
    return pushParseAndPop(null, this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @protected
   * @return {import("../geom/Geometry.js").default} Geometry.
   * @override
   */
  readGeometryFromNode(node, options) {
    const geometry = this.readGeometryElement(node, [this.getReadOptions(node, options ? options : {})]);
    return geometry ? geometry : null;
  }
  /**
   * @param {Element} node Node.
   * @param {import("./Feature.js").ReadOptions} [options] Options.
   * @return {Array<import("../Feature.js").default>} Features.
   * @override
   */
  readFeaturesFromNode(node, options) {
    const internalOptions = {
      featureType: this.featureType,
      featureNS: this.featureNS
    };
    if (internalOptions) {
      Object.assign(internalOptions, this.getReadOptions(node, options));
    }
    const features = this.readFeaturesInternal(node, [internalOptions]);
    return features || [];
  }
  /**
   * @param {Element} node Node.
   * @return {import("../proj/Projection.js").default} Projection.
   * @override
   */
  readProjectionFromNode(node) {
    return get(this.srsName ? this.srsName : node.firstElementChild.getAttribute("srsName"));
  }
};
GMLBase.prototype.namespace = GMLNS;
GMLBase.prototype.FLAT_LINEAR_RINGS_PARSERS = {
  "http://www.opengis.net/gml": {}
};
GMLBase.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = {
  "http://www.opengis.net/gml": {}
};
GMLBase.prototype.GEOMETRY_PARSERS = {
  "http://www.opengis.net/gml": {}
};
GMLBase.prototype.MULTIPOINT_PARSERS = {
  "http://www.opengis.net/gml": {
    "pointMember": makeArrayPusher(GMLBase.prototype.pointMemberParser),
    "pointMembers": makeArrayPusher(GMLBase.prototype.pointMemberParser)
  }
};
GMLBase.prototype.MULTILINESTRING_PARSERS = {
  "http://www.opengis.net/gml": {
    "lineStringMember": makeArrayPusher(GMLBase.prototype.lineStringMemberParser),
    "lineStringMembers": makeArrayPusher(GMLBase.prototype.lineStringMemberParser)
  }
};
GMLBase.prototype.MULTIPOLYGON_PARSERS = {
  "http://www.opengis.net/gml": {
    "polygonMember": makeArrayPusher(GMLBase.prototype.polygonMemberParser),
    "polygonMembers": makeArrayPusher(GMLBase.prototype.polygonMemberParser)
  }
};
GMLBase.prototype.POINTMEMBER_PARSERS = {
  "http://www.opengis.net/gml": {
    "Point": makeArrayPusher(GMLBase.prototype.readFlatCoordinatesFromNode)
  }
};
GMLBase.prototype.LINESTRINGMEMBER_PARSERS = {
  "http://www.opengis.net/gml": {
    "LineString": makeArrayPusher(GMLBase.prototype.readLineString)
  }
};
GMLBase.prototype.POLYGONMEMBER_PARSERS = {
  "http://www.opengis.net/gml": {
    "Polygon": makeArrayPusher(GMLBase.prototype.readPolygon)
  }
};
GMLBase.prototype.RING_PARSERS = {
  "http://www.opengis.net/gml": {
    "LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing)
  }
};
var GMLBase_default = GMLBase;

// ../../node_modules/ol/format/GML2.js
var schemaLocation = GMLNS + " http://schemas.opengis.net/gml/2.1.2/feature.xsd";
var MULTIGEOMETRY_TO_MEMBER_NODENAME = {
  "MultiLineString": "lineStringMember",
  "MultiCurve": "curveMember",
  "MultiPolygon": "polygonMember",
  "MultiSurface": "surfaceMember"
};
var GML2 = class extends GMLBase_default {
  /**
   * @param {import("./GMLBase.js").Options} [options] Optional configuration object.
   */
  constructor(options) {
    options = options ? options : {};
    super(options);
    this.FEATURE_COLLECTION_PARSERS[GMLNS]["featureMember"] = makeArrayPusher(this.readFeaturesInternal);
    this.schemaLocation = options.schemaLocation ? options.schemaLocation : schemaLocation;
  }
  /**
   * @param {Node} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} Flat coordinates.
   */
  readFlatCoordinates(node, objectStack) {
    const s = getAllTextContent(node, false).replace(/^\s*|\s*$/g, "");
    const context = (
      /** @type {import("../xml.js").NodeStackItem} */
      objectStack[0]
    );
    const containerSrs = context["srsName"];
    let axisOrientation = "enu";
    if (containerSrs) {
      const proj = get(containerSrs);
      if (proj) {
        axisOrientation = proj.getAxisOrientation();
      }
    }
    const coordsGroups = s.trim().split(/\s+/);
    const flatCoordinates = [];
    for (let i = 0, ii = coordsGroups.length; i < ii; i++) {
      const coords = coordsGroups[i].split(/,+/);
      const x2 = parseFloat(coords[0]);
      const y = parseFloat(coords[1]);
      const z2 = coords.length === 3 ? parseFloat(coords[2]) : 0;
      if (axisOrientation.startsWith("en")) {
        flatCoordinates.push(x2, y, z2);
      } else {
        flatCoordinates.push(y, x2, z2);
      }
    }
    return flatCoordinates;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {import("../extent.js").Extent|undefined} Envelope.
   */
  readBox(node, objectStack) {
    const flatCoordinates = pushParseAndPop([null], this.BOX_PARSERS_, node, objectStack, this);
    return createOrUpdate(flatCoordinates[1][0], flatCoordinates[1][1], flatCoordinates[1][3], flatCoordinates[1][4]);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  innerBoundaryIsParser(node, objectStack) {
    const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
    if (flatLinearRing) {
      const flatLinearRings = (
        /** @type {Array<Array<number>>} */
        objectStack[objectStack.length - 1]
      );
      flatLinearRings.push(flatLinearRing);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  outerBoundaryIsParser(node, objectStack) {
    const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
    if (flatLinearRing) {
      const flatLinearRings = (
        /** @type {Array<Array<number>>} */
        objectStack[objectStack.length - 1]
      );
      flatLinearRings[0] = flatLinearRing;
    }
  }
  /**
   * @const
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Element|undefined} Node.
   * @private
   */
  GEOMETRY_NODE_FACTORY_(value, objectStack, nodeName) {
    const context = objectStack[objectStack.length - 1];
    const multiSurface = context["multiSurface"];
    const surface = context["surface"];
    const multiCurve = context["multiCurve"];
    if (!Array.isArray(value)) {
      nodeName = /** @type {import("../geom/Geometry.js").default} */
      value.getType();
      if (nodeName === "MultiPolygon" && multiSurface === true) {
        nodeName = "MultiSurface";
      } else if (nodeName === "Polygon" && surface === true) {
        nodeName = "Surface";
      } else if (nodeName === "MultiLineString" && multiCurve === true) {
        nodeName = "MultiCurve";
      }
    } else {
      nodeName = "Envelope";
    }
    return createElementNS("http://www.opengis.net/gml", nodeName);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../Feature.js").default} feature Feature.
   * @param {Array<*>} objectStack Node stack.
   */
  writeFeatureElement(node, feature, objectStack) {
    const fid = feature.getId();
    if (fid) {
      node.setAttribute(
        "fid",
        /** @type {string} */
        fid
      );
    }
    const context = (
      /** @type {Object} */
      objectStack[objectStack.length - 1]
    );
    const featureNS = context["featureNS"];
    const geometryName = feature.getGeometryName();
    if (!context.serializers) {
      context.serializers = {};
      context.serializers[featureNS] = {};
    }
    const keys = [];
    const values = [];
    if (feature.hasProperties()) {
      const properties = feature.getProperties();
      for (const key in properties) {
        const value = properties[key];
        if (value !== null && value !== void 0) {
          keys.push(key);
          values.push(value);
          if (key == geometryName || typeof /** @type {?} */
          value.getSimplifiedGeometry === "function") {
            if (!(key in context.serializers[featureNS])) {
              context.serializers[featureNS][key] = makeChildAppender(this.writeGeometryElement, this);
            }
          } else {
            if (!(key in context.serializers[featureNS])) {
              context.serializers[featureNS][key] = makeChildAppender(writeStringTextNode);
            }
          }
        }
      }
    }
    const item = Object.assign({}, context);
    item.node = node;
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      item,
      context.serializers,
      makeSimpleNodeFactory(void 0, featureNS),
      values,
      objectStack,
      keys
    );
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LineString.js").default} geometry LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeCurveOrLineString(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (node.nodeName !== "LineStringSegment" && srsName) {
      node.setAttribute("srsName", srsName);
    }
    if (node.nodeName === "LineString" || node.nodeName === "LineStringSegment") {
      const coordinates = this.createCoordinatesNode_(node.namespaceURI);
      node.appendChild(coordinates);
      this.writeCoordinates_(coordinates, geometry, objectStack);
    } else if (node.nodeName === "Curve") {
      const segments = createElementNS(node.namespaceURI, "segments");
      node.appendChild(segments);
      this.writeCurveSegments_(segments, geometry, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LineString.js").default} line LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeLineStringOrCurveMember(node, line, objectStack) {
    const child = this.GEOMETRY_NODE_FACTORY_(line, objectStack);
    if (child) {
      node.appendChild(child);
      this.writeCurveOrLineString(child, line, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/MultiLineString.js").default} geometry MultiLineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiCurveOrLineString(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    const curve = context["curve"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const lines = geometry.getLineStrings();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName,
      curve
    }, this.LINESTRINGORCURVEMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, lines, objectStack, void 0, this);
  }
  /**
   * @param {Node} node Node.
   * @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeGeometryElement(node, geometry, objectStack) {
    const context = (
      /** @type {import("./Feature.js").WriteOptions} */
      objectStack[objectStack.length - 1]
    );
    const item = Object.assign({}, context);
    item["node"] = node;
    let value;
    if (Array.isArray(geometry)) {
      value = transformExtentWithOptions(
        /** @type {import("../extent.js").Extent} */
        geometry,
        context
      );
    } else {
      value = transformGeometryWithOptions(
        /** @type {import("../geom/Geometry.js").default} */
        geometry,
        true,
        context
      );
    }
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      item,
      this.GEOMETRY_SERIALIZERS,
      this.GEOMETRY_NODE_FACTORY_,
      [value],
      objectStack,
      void 0,
      this
    );
  }
  /**
   * @param {string} namespaceURI XML namespace.
   * @return {Element} coordinates node.
   * @private
   */
  createCoordinatesNode_(namespaceURI) {
    const coordinates = createElementNS(namespaceURI, "coordinates");
    coordinates.setAttribute("decimal", ".");
    coordinates.setAttribute("cs", ",");
    coordinates.setAttribute("ts", " ");
    return coordinates;
  }
  /**
   * @param {Node} node Node.
   * @param {import("../geom/LineString.js").default|import("../geom/LinearRing.js").default} value Geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeCoordinates_(node, value, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    const points = value.getCoordinates();
    const len = points.length;
    const parts = new Array(len);
    for (let i = 0; i < len; ++i) {
      const point = points[i];
      parts[i] = this.getCoords_(point, srsName, hasZ);
    }
    writeStringTextNode(node, parts.join(" "));
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LineString.js").default} line LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeCurveSegments_(node, line, objectStack) {
    const child = createElementNS(node.namespaceURI, "LineStringSegment");
    node.appendChild(child);
    this.writeCurveOrLineString(child, line, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Polygon.js").default} geometry Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeSurfaceOrPolygon(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    if (node.nodeName !== "PolygonPatch" && srsName) {
      node.setAttribute("srsName", srsName);
    }
    if (node.nodeName === "Polygon" || node.nodeName === "PolygonPatch") {
      const rings = geometry.getLinearRings();
      pushSerializeAndPop({
        node,
        hasZ,
        srsName
      }, this.RING_SERIALIZERS, this.RING_NODE_FACTORY_, rings, objectStack, void 0, this);
    } else if (node.nodeName === "Surface") {
      const patches = createElementNS(node.namespaceURI, "patches");
      node.appendChild(patches);
      this.writeSurfacePatches_(patches, geometry, objectStack);
    }
  }
  /**
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Node} Node.
   * @private
   */
  RING_NODE_FACTORY_(value, objectStack, nodeName) {
    const context = objectStack[objectStack.length - 1];
    const parentNode = context.node;
    const exteriorWritten = context["exteriorWritten"];
    if (exteriorWritten === void 0) {
      context["exteriorWritten"] = true;
    }
    return createElementNS(parentNode.namespaceURI, exteriorWritten !== void 0 ? "innerBoundaryIs" : "outerBoundaryIs");
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Polygon.js").default} polygon Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeSurfacePatches_(node, polygon, objectStack) {
    const child = createElementNS(node.namespaceURI, "PolygonPatch");
    node.appendChild(child);
    this.writeSurfaceOrPolygon(child, polygon, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LinearRing.js").default} ring LinearRing geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeRing(node, ring, objectStack) {
    const linearRing = createElementNS(node.namespaceURI, "LinearRing");
    node.appendChild(linearRing);
    this.writeLinearRing(linearRing, ring, objectStack);
  }
  /**
   * @param {Array<number>} point Point geometry.
   * @param {string} [srsName] Optional srsName
   * @param {boolean} [hasZ] whether the geometry has a Z coordinate (is 3D) or not.
   * @return {string} The coords string.
   * @private
   */
  getCoords_(point, srsName, hasZ) {
    const axisOrientation = srsName ? get(srsName).getAxisOrientation() : "enu";
    let coords = axisOrientation.startsWith("en") ? point[0] + "," + point[1] : point[1] + "," + point[0];
    if (hasZ) {
      const z2 = point[2] || 0;
      coords += "," + z2;
    }
    return coords;
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Point.js").default} geometry Point geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writePoint(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const coordinates = this.createCoordinatesNode_(node.namespaceURI);
    node.appendChild(coordinates);
    const point = geometry.getCoordinates();
    const coord = this.getCoords_(point, srsName, hasZ);
    writeStringTextNode(coordinates, coord);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/MultiPoint.js").default} geometry MultiPoint geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiPoint(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const points = geometry.getPoints();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName
    }, this.POINTMEMBER_SERIALIZERS, makeSimpleNodeFactory("pointMember"), points, objectStack, void 0, this);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Point.js").default} point Point geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writePointMember(node, point, objectStack) {
    const child = createElementNS(node.namespaceURI, "Point");
    node.appendChild(child);
    this.writePoint(child, point, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LinearRing.js").default} geometry LinearRing geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeLinearRing(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const coordinates = this.createCoordinatesNode_(node.namespaceURI);
    node.appendChild(coordinates);
    this.writeCoordinates_(coordinates, geometry, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/MultiPolygon.js").default} geometry MultiPolygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiSurfaceOrPolygon(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    const surface = context["surface"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const polygons = geometry.getPolygons();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName,
      surface
    }, this.SURFACEORPOLYGONMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, polygons, objectStack, void 0, this);
  }
  /**
   * @param {Node} node Node.
   * @param {import("../geom/Polygon.js").default} polygon Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeSurfaceOrPolygonMember(node, polygon, objectStack) {
    const child = this.GEOMETRY_NODE_FACTORY_(polygon, objectStack);
    if (child) {
      node.appendChild(child);
      this.writeSurfaceOrPolygon(child, polygon, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {Array<*>} objectStack Node stack.
   */
  writeEnvelope(node, extent, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const keys = ["lowerCorner", "upperCorner"];
    const values = [extent[0] + " " + extent[1], extent[2] + " " + extent[3]];
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      {
        node
      },
      this.ENVELOPE_SERIALIZERS,
      OBJECT_PROPERTY_NODE_FACTORY,
      values,
      objectStack,
      keys,
      this
    );
  }
  /**
   * @const
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Node|undefined} Node.
   * @private
   */
  MULTIGEOMETRY_MEMBER_NODE_FACTORY_(value, objectStack, nodeName) {
    const parentNode = objectStack[objectStack.length - 1].node;
    return createElementNS("http://www.opengis.net/gml", MULTIGEOMETRY_TO_MEMBER_NODENAME[parentNode.nodeName]);
  }
};
GML2.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = {
  "http://www.opengis.net/gml": {
    "coordinates": makeReplacer(GML2.prototype.readFlatCoordinates)
  }
};
GML2.prototype.FLAT_LINEAR_RINGS_PARSERS = {
  "http://www.opengis.net/gml": {
    "innerBoundaryIs": GML2.prototype.innerBoundaryIsParser,
    "outerBoundaryIs": GML2.prototype.outerBoundaryIsParser
  }
};
GML2.prototype.BOX_PARSERS_ = {
  "http://www.opengis.net/gml": {
    "coordinates": makeArrayPusher(GML2.prototype.readFlatCoordinates)
  }
};
GML2.prototype.GEOMETRY_PARSERS = {
  "http://www.opengis.net/gml": {
    "Point": makeReplacer(GMLBase_default.prototype.readPoint),
    "MultiPoint": makeReplacer(GMLBase_default.prototype.readMultiPoint),
    "LineString": makeReplacer(GMLBase_default.prototype.readLineString),
    "MultiLineString": makeReplacer(GMLBase_default.prototype.readMultiLineString),
    "LinearRing": makeReplacer(GMLBase_default.prototype.readLinearRing),
    "Polygon": makeReplacer(GMLBase_default.prototype.readPolygon),
    "MultiPolygon": makeReplacer(GMLBase_default.prototype.readMultiPolygon),
    "Box": makeReplacer(GML2.prototype.readBox)
  }
};
GML2.prototype.GEOMETRY_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "Curve": makeChildAppender(GML2.prototype.writeCurveOrLineString),
    "MultiCurve": makeChildAppender(GML2.prototype.writeMultiCurveOrLineString),
    "Point": makeChildAppender(GML2.prototype.writePoint),
    "MultiPoint": makeChildAppender(GML2.prototype.writeMultiPoint),
    "LineString": makeChildAppender(GML2.prototype.writeCurveOrLineString),
    "MultiLineString": makeChildAppender(GML2.prototype.writeMultiCurveOrLineString),
    "LinearRing": makeChildAppender(GML2.prototype.writeLinearRing),
    "Polygon": makeChildAppender(GML2.prototype.writeSurfaceOrPolygon),
    "MultiPolygon": makeChildAppender(GML2.prototype.writeMultiSurfaceOrPolygon),
    "Surface": makeChildAppender(GML2.prototype.writeSurfaceOrPolygon),
    "MultiSurface": makeChildAppender(GML2.prototype.writeMultiSurfaceOrPolygon),
    "Envelope": makeChildAppender(GML2.prototype.writeEnvelope)
  }
};
GML2.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "lineStringMember": makeChildAppender(GML2.prototype.writeLineStringOrCurveMember),
    "curveMember": makeChildAppender(GML2.prototype.writeLineStringOrCurveMember)
  }
};
GML2.prototype.RING_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "outerBoundaryIs": makeChildAppender(GML2.prototype.writeRing),
    "innerBoundaryIs": makeChildAppender(GML2.prototype.writeRing)
  }
};
GML2.prototype.POINTMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "pointMember": makeChildAppender(GML2.prototype.writePointMember)
  }
};
GML2.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "surfaceMember": makeChildAppender(GML2.prototype.writeSurfaceOrPolygonMember),
    "polygonMember": makeChildAppender(GML2.prototype.writeSurfaceOrPolygonMember)
  }
};
GML2.prototype.ENVELOPE_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "lowerCorner": makeChildAppender(writeStringTextNode),
    "upperCorner": makeChildAppender(writeStringTextNode)
  }
};
var GML2_default = GML2;

// ../../node_modules/ol/format/GML3.js
var schemaLocation2 = GMLNS + " http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd";
var MULTIGEOMETRY_TO_MEMBER_NODENAME2 = {
  "MultiLineString": "lineStringMember",
  "MultiCurve": "curveMember",
  "MultiPolygon": "polygonMember",
  "MultiSurface": "surfaceMember"
};
var GML3 = class extends GMLBase_default {
  /**
   * @param {import("./GMLBase.js").Options} [options] Optional configuration object.
   */
  constructor(options) {
    options = options ? options : {};
    super(options);
    this.surface_ = options.surface !== void 0 ? options.surface : false;
    this.curve_ = options.curve !== void 0 ? options.curve : false;
    this.multiCurve_ = options.multiCurve !== void 0 ? options.multiCurve : true;
    this.multiSurface_ = options.multiSurface !== void 0 ? options.multiSurface : true;
    this.schemaLocation = options.schemaLocation ? options.schemaLocation : schemaLocation2;
    this.hasZ = options.hasZ !== void 0 ? options.hasZ : false;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {MultiLineString|undefined} MultiLineString.
   */
  readMultiCurve(node, objectStack) {
    const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
    if (lineStrings) {
      const multiLineString = new MultiLineString_default(lineStrings);
      return multiLineString;
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} Polygon.
   */
  readFlatCurveRing(node, objectStack) {
    const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
    const flatCoordinates = [];
    for (let i = 0, ii = lineStrings.length; i < ii; ++i) {
      extend(flatCoordinates, lineStrings[i].getFlatCoordinates());
    }
    return flatCoordinates;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {MultiPolygon|undefined} MultiPolygon.
   */
  readMultiSurface(node, objectStack) {
    const polygons = pushParseAndPop([], this.MULTISURFACE_PARSERS, node, objectStack, this);
    if (polygons) {
      return new MultiPolygon_default(polygons);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  curveMemberParser(node, objectStack) {
    parseNode(this.CURVEMEMBER_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  surfaceMemberParser(node, objectStack) {
    parseNode(this.SURFACEMEMBER_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<(Array<number>)>|undefined} flat coordinates.
   */
  readPatch(node, objectStack) {
    return pushParseAndPop([null], this.PATCHES_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} flat coordinates.
   */
  readSegment(node, objectStack) {
    return pushParseAndPop([], this.SEGMENTS_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<(Array<number>)>|undefined} flat coordinates.
   */
  readPolygonPatch(node, objectStack) {
    return pushParseAndPop([null], this.FLAT_LINEAR_RINGS_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} flat coordinates.
   */
  readLineStringSegment(node, objectStack) {
    return pushParseAndPop([null], this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  interiorParser(node, objectStack) {
    const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
    if (flatLinearRing) {
      const flatLinearRings = (
        /** @type {Array<Array<number>>} */
        objectStack[objectStack.length - 1]
      );
      flatLinearRings.push(flatLinearRing);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   */
  exteriorParser(node, objectStack) {
    const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
    if (flatLinearRing) {
      const flatLinearRings = (
        /** @type {Array<Array<number>>} */
        objectStack[objectStack.length - 1]
      );
      flatLinearRings[0] = flatLinearRing;
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Polygon|undefined} Polygon.
   */
  readSurface(node, objectStack) {
    const flatLinearRings = pushParseAndPop([null], this.SURFACE_PARSERS, node, objectStack, this);
    if (flatLinearRings && flatLinearRings[0]) {
      const flatCoordinates = flatLinearRings[0];
      const ends = [flatCoordinates.length];
      let i, ii;
      for (i = 1, ii = flatLinearRings.length; i < ii; ++i) {
        extend(flatCoordinates, flatLinearRings[i]);
        ends.push(flatCoordinates.length);
      }
      return new Polygon_default(flatCoordinates, "XYZ", ends);
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {LineString|undefined} LineString.
   */
  readCurve(node, objectStack) {
    const flatCoordinates = pushParseAndPop([null], this.CURVE_PARSERS, node, objectStack, this);
    if (flatCoordinates) {
      const lineString = new LineString_default(flatCoordinates, "XYZ");
      return lineString;
    }
    return void 0;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {import("../extent.js").Extent|undefined} Envelope.
   */
  readEnvelope(node, objectStack) {
    const flatCoordinates = pushParseAndPop([null], this.ENVELOPE_PARSERS, node, objectStack, this);
    return createOrUpdate(flatCoordinates[1][0], flatCoordinates[1][1], flatCoordinates[2][0], flatCoordinates[2][1]);
  }
  /**
   * @param {Node} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} Flat coordinates.
   */
  readFlatPos(node, objectStack) {
    let s = getAllTextContent(node, false);
    const re2 = /^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/;
    const flatCoordinates = [];
    let m2;
    while (m2 = re2.exec(s)) {
      flatCoordinates.push(parseFloat(m2[1]));
      s = s.substr(m2[0].length);
    }
    if (s !== "") {
      return void 0;
    }
    const context = objectStack[0];
    const containerSrs = context["srsName"];
    const axisOrientation = containerSrs ? get(containerSrs).getAxisOrientation() : "enu";
    if (axisOrientation === "neu") {
      for (let i = 0, ii = flatCoordinates.length; i < ii; i += 3) {
        const y = flatCoordinates[i];
        const x2 = flatCoordinates[i + 1];
        flatCoordinates[i] = x2;
        flatCoordinates[i + 1] = y;
      }
    }
    const len = flatCoordinates.length;
    if (len == 2) {
      flatCoordinates.push(0);
    }
    if (len === 0) {
      return void 0;
    }
    return flatCoordinates;
  }
  /**
   * @param {Element} node Node.
   * @param {Array<*>} objectStack Object stack.
   * @return {Array<number>|undefined} Flat coordinates.
   */
  readFlatPosList(node, objectStack) {
    const s = getAllTextContent(node, false).replace(/^\s*|\s*$/g, "");
    const context = objectStack[0];
    const containerSrs = context["srsName"];
    const contextDimension = context["srsDimension"];
    const axisOrientation = containerSrs ? get(containerSrs).getAxisOrientation() : "enu";
    const coords = s.split(/\s+/);
    let dim = 2;
    if (node.getAttribute("srsDimension")) {
      dim = readNonNegativeIntegerString(node.getAttribute("srsDimension"));
    } else if (node.getAttribute("dimension")) {
      dim = readNonNegativeIntegerString(node.getAttribute("dimension"));
    } else if (
      /** @type {Element} */
      node.parentNode.getAttribute("srsDimension")
    ) {
      dim = readNonNegativeIntegerString(
        /** @type {Element} */
        node.parentNode.getAttribute("srsDimension")
      );
    } else if (contextDimension) {
      dim = readNonNegativeIntegerString(contextDimension);
    }
    const asXYZ = axisOrientation.startsWith("en");
    let x2, y, z2;
    const flatCoordinates = [];
    for (let i = 0, ii = coords.length; i < ii; i += dim) {
      x2 = parseFloat(coords[i]);
      y = parseFloat(coords[i + 1]);
      z2 = dim === 3 ? parseFloat(coords[i + 2]) : 0;
      if (asXYZ) {
        flatCoordinates.push(x2, y, z2);
      } else {
        flatCoordinates.push(y, x2, z2);
      }
    }
    return flatCoordinates;
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Point.js").default} value Point geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writePos_(node, value, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsDimension = hasZ ? "3" : "2";
    node.setAttribute("srsDimension", srsDimension);
    const srsName = context["srsName"];
    const axisOrientation = srsName ? get(srsName).getAxisOrientation() : "enu";
    const point = value.getCoordinates();
    let coords = axisOrientation.startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
    if (hasZ) {
      const z2 = point[2] || 0;
      coords += " " + z2;
    }
    writeStringTextNode(node, coords);
  }
  /**
   * @param {Array<number>} point Point geometry.
   * @param {string} [srsName] Optional srsName
   * @param {boolean} [hasZ] whether the geometry has a Z coordinate (is 3D) or not.
   * @return {string} The coords string.
   * @private
   */
  getCoords_(point, srsName, hasZ) {
    const axisOrientation = srsName ? get(srsName).getAxisOrientation() : "enu";
    let coords = axisOrientation.startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
    if (hasZ) {
      const z2 = point[2] || 0;
      coords += " " + z2;
    }
    return coords;
  }
  /**
   * @param {Element} node Node.
   * @param {LineString|import("../geom/LinearRing.js").default} value Geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writePosList_(node, value, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsDimension = hasZ ? "3" : "2";
    node.setAttribute("srsDimension", srsDimension);
    const srsName = context["srsName"];
    const points = value.getCoordinates();
    const len = points.length;
    const parts = new Array(len);
    let point;
    for (let i = 0; i < len; ++i) {
      point = points[i];
      parts[i] = this.getCoords_(point, srsName, hasZ);
    }
    writeStringTextNode(node, parts.join(" "));
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Point.js").default} geometry Point geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writePoint(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const pos = createElementNS(node.namespaceURI, "pos");
    node.appendChild(pos);
    this.writePos_(pos, geometry, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {Array<*>} objectStack Node stack.
   */
  writeEnvelope(node, extent, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const keys = ["lowerCorner", "upperCorner"];
    const values = [extent[0] + " " + extent[1], extent[2] + " " + extent[3]];
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      {
        node
      },
      this.ENVELOPE_SERIALIZERS,
      OBJECT_PROPERTY_NODE_FACTORY,
      values,
      objectStack,
      keys,
      this
    );
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LinearRing.js").default} geometry LinearRing geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeLinearRing(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const posList = createElementNS(node.namespaceURI, "posList");
    node.appendChild(posList);
    this.writePosList_(posList, geometry, objectStack);
  }
  /**
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Node} Node.
   * @private
   */
  RING_NODE_FACTORY_(value, objectStack, nodeName) {
    const context = objectStack[objectStack.length - 1];
    const parentNode = context.node;
    const exteriorWritten = context["exteriorWritten"];
    if (exteriorWritten === void 0) {
      context["exteriorWritten"] = true;
    }
    return createElementNS(parentNode.namespaceURI, exteriorWritten !== void 0 ? "interior" : "exterior");
  }
  /**
   * @param {Element} node Node.
   * @param {Polygon} geometry Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeSurfaceOrPolygon(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    if (node.nodeName !== "PolygonPatch" && srsName) {
      node.setAttribute("srsName", srsName);
    }
    if (node.nodeName === "Polygon" || node.nodeName === "PolygonPatch") {
      const rings = geometry.getLinearRings();
      pushSerializeAndPop({
        node,
        hasZ,
        srsName
      }, this.RING_SERIALIZERS, this.RING_NODE_FACTORY_, rings, objectStack, void 0, this);
    } else if (node.nodeName === "Surface") {
      const patches = createElementNS(node.namespaceURI, "patches");
      node.appendChild(patches);
      this.writeSurfacePatches_(patches, geometry, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {LineString} geometry LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeCurveOrLineString(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    if (node.nodeName !== "LineStringSegment" && srsName) {
      node.setAttribute("srsName", srsName);
    }
    if (node.nodeName === "LineString" || node.nodeName === "LineStringSegment") {
      const posList = createElementNS(node.namespaceURI, "posList");
      node.appendChild(posList);
      this.writePosList_(posList, geometry, objectStack);
    } else if (node.nodeName === "Curve") {
      const segments = createElementNS(node.namespaceURI, "segments");
      node.appendChild(segments);
      this.writeCurveSegments_(segments, geometry, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {MultiPolygon} geometry MultiPolygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiSurfaceOrPolygon(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    const surface = context["surface"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const polygons = geometry.getPolygons();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName,
      surface
    }, this.SURFACEORPOLYGONMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, polygons, objectStack, void 0, this);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/MultiPoint.js").default} geometry MultiPoint geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiPoint(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const srsName = context["srsName"];
    const hasZ = context["hasZ"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const points = geometry.getPoints();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName
    }, this.POINTMEMBER_SERIALIZERS, makeSimpleNodeFactory("pointMember"), points, objectStack, void 0, this);
  }
  /**
   * @param {Element} node Node.
   * @param {MultiLineString} geometry MultiLineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeMultiCurveOrLineString(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    const hasZ = context["hasZ"];
    const srsName = context["srsName"];
    const curve = context["curve"];
    if (srsName) {
      node.setAttribute("srsName", srsName);
    }
    const lines = geometry.getLineStrings();
    pushSerializeAndPop({
      node,
      hasZ,
      srsName,
      curve
    }, this.LINESTRINGORCURVEMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, lines, objectStack, void 0, this);
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/LinearRing.js").default} ring LinearRing geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeRing(node, ring, objectStack) {
    const linearRing = createElementNS(node.namespaceURI, "LinearRing");
    node.appendChild(linearRing);
    this.writeLinearRing(linearRing, ring, objectStack);
  }
  /**
   * @param {Node} node Node.
   * @param {Polygon} polygon Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeSurfaceOrPolygonMember(node, polygon, objectStack) {
    const child = this.GEOMETRY_NODE_FACTORY_(polygon, objectStack);
    if (child) {
      node.appendChild(child);
      this.writeSurfaceOrPolygon(child, polygon, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {import("../geom/Point.js").default} point Point geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writePointMember(node, point, objectStack) {
    const child = createElementNS(node.namespaceURI, "Point");
    node.appendChild(child);
    this.writePoint(child, point, objectStack);
  }
  /**
   * @param {Node} node Node.
   * @param {LineString} line LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeLineStringOrCurveMember(node, line, objectStack) {
    const child = this.GEOMETRY_NODE_FACTORY_(line, objectStack);
    if (child) {
      node.appendChild(child);
      this.writeCurveOrLineString(child, line, objectStack);
    }
  }
  /**
   * @param {Element} node Node.
   * @param {Polygon} polygon Polygon geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeSurfacePatches_(node, polygon, objectStack) {
    const child = createElementNS(node.namespaceURI, "PolygonPatch");
    node.appendChild(child);
    this.writeSurfaceOrPolygon(child, polygon, objectStack);
  }
  /**
   * @param {Element} node Node.
   * @param {LineString} line LineString geometry.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeCurveSegments_(node, line, objectStack) {
    const child = createElementNS(node.namespaceURI, "LineStringSegment");
    node.appendChild(child);
    this.writeCurveOrLineString(child, line, objectStack);
  }
  /**
   * @param {Node} node Node.
   * @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
   * @param {Array<*>} objectStack Node stack.
   */
  writeGeometryElement(node, geometry, objectStack) {
    const context = (
      /** @type {import("./Feature.js").WriteOptions} */
      objectStack[objectStack.length - 1]
    );
    const item = Object.assign({}, context);
    item["node"] = node;
    let value;
    if (Array.isArray(geometry)) {
      value = transformExtentWithOptions(
        /** @type {import("../extent.js").Extent} */
        geometry,
        context
      );
    } else {
      value = transformGeometryWithOptions(
        /** @type {import("../geom/Geometry.js").default} */
        geometry,
        true,
        context
      );
    }
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      item,
      this.GEOMETRY_SERIALIZERS,
      this.GEOMETRY_NODE_FACTORY_,
      [value],
      objectStack,
      void 0,
      this
    );
  }
  /**
   * @param {Element} node Node.
   * @param {import("../Feature.js").default} feature Feature.
   * @param {Array<*>} objectStack Node stack.
   */
  writeFeatureElement(node, feature, objectStack) {
    const fid = feature.getId();
    if (fid) {
      node.setAttribute(
        "fid",
        /** @type {string} */
        fid
      );
    }
    const context = (
      /** @type {Object} */
      objectStack[objectStack.length - 1]
    );
    const featureNS = context["featureNS"];
    const geometryName = feature.getGeometryName();
    if (!context.serializers) {
      context.serializers = {};
      context.serializers[featureNS] = {};
    }
    const keys = [];
    const values = [];
    if (feature.hasProperties()) {
      const properties = feature.getProperties();
      for (const key in properties) {
        const value = properties[key];
        if (value !== null && value !== void 0) {
          keys.push(key);
          values.push(value);
          if (key == geometryName || typeof /** @type {?} */
          value.getSimplifiedGeometry === "function") {
            if (!(key in context.serializers[featureNS])) {
              context.serializers[featureNS][key] = makeChildAppender(this.writeGeometryElement, this);
            }
          } else {
            if (!(key in context.serializers[featureNS])) {
              context.serializers[featureNS][key] = makeChildAppender(writeStringTextNode);
            }
          }
        }
      }
    }
    const item = Object.assign({}, context);
    item.node = node;
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      item,
      context.serializers,
      makeSimpleNodeFactory(void 0, featureNS),
      values,
      objectStack,
      keys
    );
  }
  /**
   * @param {Node} node Node.
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {Array<*>} objectStack Node stack.
   * @private
   */
  writeFeatureMembers_(node, features, objectStack) {
    const context = (
      /** @type {Object} */
      objectStack[objectStack.length - 1]
    );
    const featureType = context["featureType"];
    const featureNS = context["featureNS"];
    const serializers = {};
    serializers[featureNS] = {};
    serializers[featureNS][featureType] = makeChildAppender(this.writeFeatureElement, this);
    const item = Object.assign({}, context);
    item.node = node;
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      item,
      serializers,
      makeSimpleNodeFactory(featureType, featureNS),
      features,
      objectStack
    );
  }
  /**
   * @const
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Node|undefined} Node.
   * @private
   */
  MULTIGEOMETRY_MEMBER_NODE_FACTORY_(value, objectStack, nodeName) {
    const parentNode = objectStack[objectStack.length - 1].node;
    return createElementNS(this.namespace, MULTIGEOMETRY_TO_MEMBER_NODENAME2[parentNode.nodeName]);
  }
  /**
   * @const
   * @param {*} value Value.
   * @param {Array<*>} objectStack Object stack.
   * @param {string} [nodeName] Node name.
   * @return {Element|undefined} Node.
   * @private
   */
  GEOMETRY_NODE_FACTORY_(value, objectStack, nodeName) {
    const context = objectStack[objectStack.length - 1];
    const multiSurface = context["multiSurface"];
    const surface = context["surface"];
    const curve = context["curve"];
    const multiCurve = context["multiCurve"];
    if (!Array.isArray(value)) {
      nodeName = /** @type {import("../geom/Geometry.js").default} */
      value.getType();
      if (nodeName === "MultiPolygon" && multiSurface === true) {
        nodeName = "MultiSurface";
      } else if (nodeName === "Polygon" && surface === true) {
        nodeName = "Surface";
      } else if (nodeName === "LineString" && curve === true) {
        nodeName = "Curve";
      } else if (nodeName === "MultiLineString" && multiCurve === true) {
        nodeName = "MultiCurve";
      }
    } else {
      nodeName = "Envelope";
    }
    return createElementNS(this.namespace, nodeName);
  }
  /**
   * Encode a geometry in GML 3.1.1 Simple Features.
   *
   * @param {import("../geom/Geometry.js").default} geometry Geometry.
   * @param {import("./Feature.js").WriteOptions} [options] Options.
   * @return {Node} Node.
   * @api
   * @override
   */
  writeGeometryNode(geometry, options) {
    options = this.adaptOptions(options);
    const geom = createElementNS(this.namespace, "geom");
    const context = {
      node: geom,
      hasZ: this.hasZ,
      srsName: this.srsName,
      curve: this.curve_,
      surface: this.surface_,
      multiSurface: this.multiSurface_,
      multiCurve: this.multiCurve_
    };
    if (options) {
      Object.assign(context, options);
    }
    this.writeGeometryElement(geom, geometry, [context]);
    return geom;
  }
  /**
   * Encode an array of features in the GML 3.1.1 format as an XML node.
   *
   * @param {Array<import("../Feature.js").default>} features Features.
   * @param {import("./Feature.js").WriteOptions} [options] Options.
   * @return {Element} Node.
   * @api
   * @override
   */
  writeFeaturesNode(features, options) {
    options = this.adaptOptions(options);
    const node = createElementNS(this.namespace, "featureMembers");
    node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", this.schemaLocation);
    const context = {
      srsName: this.srsName,
      hasZ: this.hasZ,
      curve: this.curve_,
      surface: this.surface_,
      multiSurface: this.multiSurface_,
      multiCurve: this.multiCurve_,
      featureNS: this.featureNS,
      featureType: this.featureType
    };
    if (options) {
      Object.assign(context, options);
    }
    this.writeFeatureMembers_(node, features, [context]);
    return node;
  }
};
GML3.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = {
  "http://www.opengis.net/gml": {
    "pos": makeReplacer(GML3.prototype.readFlatPos),
    "posList": makeReplacer(GML3.prototype.readFlatPosList),
    "coordinates": makeReplacer(GML2_default.prototype.readFlatCoordinates)
  }
};
GML3.prototype.FLAT_LINEAR_RINGS_PARSERS = {
  "http://www.opengis.net/gml": {
    "interior": GML3.prototype.interiorParser,
    "exterior": GML3.prototype.exteriorParser
  }
};
GML3.prototype.GEOMETRY_PARSERS = {
  "http://www.opengis.net/gml": {
    "Point": makeReplacer(GMLBase_default.prototype.readPoint),
    "MultiPoint": makeReplacer(GMLBase_default.prototype.readMultiPoint),
    "LineString": makeReplacer(GMLBase_default.prototype.readLineString),
    "MultiLineString": makeReplacer(GMLBase_default.prototype.readMultiLineString),
    "LinearRing": makeReplacer(GMLBase_default.prototype.readLinearRing),
    "Polygon": makeReplacer(GMLBase_default.prototype.readPolygon),
    "MultiPolygon": makeReplacer(GMLBase_default.prototype.readMultiPolygon),
    "Surface": makeReplacer(GML3.prototype.readSurface),
    "MultiSurface": makeReplacer(GML3.prototype.readMultiSurface),
    "Curve": makeReplacer(GML3.prototype.readCurve),
    "MultiCurve": makeReplacer(GML3.prototype.readMultiCurve),
    "Envelope": makeReplacer(GML3.prototype.readEnvelope)
  }
};
GML3.prototype.MULTICURVE_PARSERS = {
  "http://www.opengis.net/gml": {
    "curveMember": makeArrayPusher(GML3.prototype.curveMemberParser),
    "curveMembers": makeArrayPusher(GML3.prototype.curveMemberParser)
  }
};
GML3.prototype.MULTISURFACE_PARSERS = {
  "http://www.opengis.net/gml": {
    "surfaceMember": makeArrayPusher(GML3.prototype.surfaceMemberParser),
    "surfaceMembers": makeArrayPusher(GML3.prototype.surfaceMemberParser)
  }
};
GML3.prototype.CURVEMEMBER_PARSERS = {
  "http://www.opengis.net/gml": {
    "LineString": makeArrayPusher(GMLBase_default.prototype.readLineString),
    "Curve": makeArrayPusher(GML3.prototype.readCurve)
  }
};
GML3.prototype.SURFACEMEMBER_PARSERS = {
  "http://www.opengis.net/gml": {
    "Polygon": makeArrayPusher(GMLBase_default.prototype.readPolygon),
    "Surface": makeArrayPusher(GML3.prototype.readSurface)
  }
};
GML3.prototype.SURFACE_PARSERS = {
  "http://www.opengis.net/gml": {
    "patches": makeReplacer(GML3.prototype.readPatch)
  }
};
GML3.prototype.CURVE_PARSERS = {
  "http://www.opengis.net/gml": {
    "segments": makeReplacer(GML3.prototype.readSegment)
  }
};
GML3.prototype.ENVELOPE_PARSERS = {
  "http://www.opengis.net/gml": {
    "lowerCorner": makeArrayPusher(GML3.prototype.readFlatPosList),
    "upperCorner": makeArrayPusher(GML3.prototype.readFlatPosList)
  }
};
GML3.prototype.PATCHES_PARSERS = {
  "http://www.opengis.net/gml": {
    "PolygonPatch": makeReplacer(GML3.prototype.readPolygonPatch)
  }
};
GML3.prototype.SEGMENTS_PARSERS = {
  "http://www.opengis.net/gml": {
    "LineStringSegment": makeArrayExtender(GML3.prototype.readLineStringSegment)
  }
};
GMLBase_default.prototype.RING_PARSERS = {
  "http://www.opengis.net/gml": {
    "LinearRing": makeReplacer(GMLBase_default.prototype.readFlatLinearRing),
    "Ring": makeReplacer(GML3.prototype.readFlatCurveRing)
  }
};
GML3.prototype.writeFeatures;
GML3.prototype.RING_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "exterior": makeChildAppender(GML3.prototype.writeRing),
    "interior": makeChildAppender(GML3.prototype.writeRing)
  }
};
GML3.prototype.ENVELOPE_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "lowerCorner": makeChildAppender(writeStringTextNode),
    "upperCorner": makeChildAppender(writeStringTextNode)
  }
};
GML3.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "surfaceMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember),
    "polygonMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember)
  }
};
GML3.prototype.POINTMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "pointMember": makeChildAppender(GML3.prototype.writePointMember)
  }
};
GML3.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "lineStringMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember),
    "curveMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember)
  }
};
GML3.prototype.GEOMETRY_SERIALIZERS = {
  "http://www.opengis.net/gml": {
    "Curve": makeChildAppender(GML3.prototype.writeCurveOrLineString),
    "MultiCurve": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
    "Point": makeChildAppender(GML3.prototype.writePoint),
    "MultiPoint": makeChildAppender(GML3.prototype.writeMultiPoint),
    "LineString": makeChildAppender(GML3.prototype.writeCurveOrLineString),
    "MultiLineString": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
    "LinearRing": makeChildAppender(GML3.prototype.writeLinearRing),
    "Polygon": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
    "MultiPolygon": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
    "Surface": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
    "MultiSurface": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
    "Envelope": makeChildAppender(GML3.prototype.writeEnvelope)
  }
};
var GML3_default = GML3;

// ../../node_modules/ol/format/GML.js
var GML = GML3_default;
GML.prototype.writeFeatures;
GML.prototype.writeFeaturesNode;

// ../../node_modules/ol/format/GPX.js
var NAMESPACE_URIS = [null, "http://www.topografix.com/GPX/1/0", "http://www.topografix.com/GPX/1/1"];
var GPX_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "rte": makeArrayPusher(readRte),
  "trk": makeArrayPusher(readTrk),
  "wpt": makeArrayPusher(readWpt)
});
var LINK_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "text": makeObjectPropertySetter(readString, "linkText"),
  "type": makeObjectPropertySetter(readString, "linkType")
});
var AUTHOR_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeObjectPropertySetter(readString),
  "email": parseEmail,
  "link": parseLink
});
var METADATA_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeObjectPropertySetter(readString),
  "desc": makeObjectPropertySetter(readString),
  "author": makeObjectPropertySetter(readAuthor),
  "copyright": makeObjectPropertySetter(readCopyright),
  "link": parseLink,
  "time": makeObjectPropertySetter(readDateTime),
  "keywords": makeObjectPropertySetter(readString),
  "bounds": parseBounds,
  "extensions": parseExtensions
});
var COPYRIGHT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "year": makeObjectPropertySetter(readPositiveInteger),
  "license": makeObjectPropertySetter(readString)
});
var GPX_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "rte": makeChildAppender(writeRte),
  "trk": makeChildAppender(writeTrk),
  "wpt": makeChildAppender(writeWpt)
});
var RTE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeObjectPropertySetter(readString),
  "cmt": makeObjectPropertySetter(readString),
  "desc": makeObjectPropertySetter(readString),
  "src": makeObjectPropertySetter(readString),
  "link": parseLink,
  "number": makeObjectPropertySetter(readPositiveInteger),
  "extensions": parseExtensions,
  "type": makeObjectPropertySetter(readString),
  "rtept": parseRtePt
});
var RTEPT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ele": makeObjectPropertySetter(readDecimal),
  "time": makeObjectPropertySetter(readDateTime)
});
var TRK_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeObjectPropertySetter(readString),
  "cmt": makeObjectPropertySetter(readString),
  "desc": makeObjectPropertySetter(readString),
  "src": makeObjectPropertySetter(readString),
  "link": parseLink,
  "number": makeObjectPropertySetter(readPositiveInteger),
  "type": makeObjectPropertySetter(readString),
  "extensions": parseExtensions,
  "trkseg": parseTrkSeg
});
var TRKSEG_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "trkpt": parseTrkPt
});
var TRKPT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ele": makeObjectPropertySetter(readDecimal),
  "time": makeObjectPropertySetter(readDateTime)
});
var WPT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ele": makeObjectPropertySetter(readDecimal),
  "time": makeObjectPropertySetter(readDateTime),
  "magvar": makeObjectPropertySetter(readDecimal),
  "geoidheight": makeObjectPropertySetter(readDecimal),
  "name": makeObjectPropertySetter(readString),
  "cmt": makeObjectPropertySetter(readString),
  "desc": makeObjectPropertySetter(readString),
  "src": makeObjectPropertySetter(readString),
  "link": parseLink,
  "sym": makeObjectPropertySetter(readString),
  "type": makeObjectPropertySetter(readString),
  "fix": makeObjectPropertySetter(readString),
  "sat": makeObjectPropertySetter(readPositiveInteger),
  "hdop": makeObjectPropertySetter(readDecimal),
  "vdop": makeObjectPropertySetter(readDecimal),
  "pdop": makeObjectPropertySetter(readDecimal),
  "ageofdgpsdata": makeObjectPropertySetter(readDecimal),
  "dgpsid": makeObjectPropertySetter(readPositiveInteger),
  "extensions": parseExtensions
});
var LINK_SEQUENCE = ["text", "type"];
var LINK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "text": makeChildAppender(writeStringTextNode),
  "type": makeChildAppender(writeStringTextNode)
});
var RTE_SEQUENCE = makeStructureNS(NAMESPACE_URIS, ["name", "cmt", "desc", "src", "link", "number", "type", "rtept"]);
var RTE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeChildAppender(writeStringTextNode),
  "cmt": makeChildAppender(writeStringTextNode),
  "desc": makeChildAppender(writeStringTextNode),
  "src": makeChildAppender(writeStringTextNode),
  "link": makeChildAppender(writeLink),
  "number": makeChildAppender(writeNonNegativeIntegerTextNode),
  "type": makeChildAppender(writeStringTextNode),
  "rtept": makeArraySerializer(makeChildAppender(writeWptType))
});
var RTEPT_TYPE_SEQUENCE = makeStructureNS(NAMESPACE_URIS, ["ele", "time"]);
var TRK_SEQUENCE = makeStructureNS(NAMESPACE_URIS, ["name", "cmt", "desc", "src", "link", "number", "type", "trkseg"]);
var TRK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "name": makeChildAppender(writeStringTextNode),
  "cmt": makeChildAppender(writeStringTextNode),
  "desc": makeChildAppender(writeStringTextNode),
  "src": makeChildAppender(writeStringTextNode),
  "link": makeChildAppender(writeLink),
  "number": makeChildAppender(writeNonNegativeIntegerTextNode),
  "type": makeChildAppender(writeStringTextNode),
  "trkseg": makeArraySerializer(makeChildAppender(writeTrkSeg))
});
var TRKSEG_NODE_FACTORY = makeSimpleNodeFactory("trkpt");
var TRKSEG_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "trkpt": makeChildAppender(writeWptType)
});
var WPT_TYPE_SEQUENCE = makeStructureNS(NAMESPACE_URIS, ["ele", "time", "magvar", "geoidheight", "name", "cmt", "desc", "src", "link", "sym", "type", "fix", "sat", "hdop", "vdop", "pdop", "ageofdgpsdata", "dgpsid"]);
var WPT_TYPE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS, {
  "ele": makeChildAppender(writeDecimalTextNode),
  "time": makeChildAppender(writeDateTimeTextNode),
  "magvar": makeChildAppender(writeDecimalTextNode),
  "geoidheight": makeChildAppender(writeDecimalTextNode),
  "name": makeChildAppender(writeStringTextNode),
  "cmt": makeChildAppender(writeStringTextNode),
  "desc": makeChildAppender(writeStringTextNode),
  "src": makeChildAppender(writeStringTextNode),
  "link": makeChildAppender(writeLink),
  "sym": makeChildAppender(writeStringTextNode),
  "type": makeChildAppender(writeStringTextNode),
  "fix": makeChildAppender(writeStringTextNode),
  "sat": makeChildAppender(writeNonNegativeIntegerTextNode),
  "hdop": makeChildAppender(writeDecimalTextNode),
  "vdop": makeChildAppender(writeDecimalTextNode),
  "pdop": makeChildAppender(writeDecimalTextNode),
  "ageofdgpsdata": makeChildAppender(writeDecimalTextNode),
  "dgpsid": makeChildAppender(writeNonNegativeIntegerTextNode)
});
function appendCoordinate(flatCoordinates, layoutOptions, node, values) {
  flatCoordinates.push(parseFloat(node.getAttribute("lon")), parseFloat(node.getAttribute("lat")));
  if ("ele" in values) {
    flatCoordinates.push(
      /** @type {number} */
      values["ele"]
    );
    delete values["ele"];
    layoutOptions.hasZ = true;
  } else {
    flatCoordinates.push(0);
  }
  if ("time" in values) {
    flatCoordinates.push(
      /** @type {number} */
      values["time"]
    );
    delete values["time"];
    layoutOptions.hasM = true;
  } else {
    flatCoordinates.push(0);
  }
  return flatCoordinates;
}
function applyLayoutOptions(layoutOptions, flatCoordinates, ends) {
  let layout = "XY";
  let stride = 2;
  if (layoutOptions.hasZ && layoutOptions.hasM) {
    layout = "XYZM";
    stride = 4;
  } else if (layoutOptions.hasZ) {
    layout = "XYZ";
    stride = 3;
  } else if (layoutOptions.hasM) {
    layout = "XYM";
    stride = 3;
  }
  if (stride !== 4) {
    for (let i = 0, ii = flatCoordinates.length / 4; i < ii; i++) {
      flatCoordinates[i * stride] = flatCoordinates[i * 4];
      flatCoordinates[i * stride + 1] = flatCoordinates[i * 4 + 1];
      if (layoutOptions.hasZ) {
        flatCoordinates[i * stride + 2] = flatCoordinates[i * 4 + 2];
      }
      if (layoutOptions.hasM) {
        flatCoordinates[i * stride + 2] = flatCoordinates[i * 4 + 3];
      }
    }
    flatCoordinates.length = flatCoordinates.length / 4 * stride;
    if (ends) {
      for (let i = 0, ii = ends.length; i < ii; i++) {
        ends[i] = ends[i] / 4 * stride;
      }
    }
  }
  return layout;
}
function readAuthor(node, objectStack) {
  const values = pushParseAndPop({}, AUTHOR_PARSERS, node, objectStack);
  if (values) {
    return values;
  }
  return void 0;
}
function readCopyright(node, objectStack) {
  const values = pushParseAndPop({}, COPYRIGHT_PARSERS, node, objectStack);
  if (values) {
    const author = node.getAttribute("author");
    if (author !== null) {
      values["author"] = author;
    }
    return values;
  }
  return void 0;
}
function parseBounds(node, objectStack) {
  const values = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const minlat = node.getAttribute("minlat");
  const minlon = node.getAttribute("minlon");
  const maxlat = node.getAttribute("maxlat");
  const maxlon = node.getAttribute("maxlon");
  if (minlon !== null && minlat !== null && maxlon !== null && maxlat !== null) {
    values["bounds"] = [[parseFloat(minlon), parseFloat(minlat)], [parseFloat(maxlon), parseFloat(maxlat)]];
  }
}
function parseEmail(node, objectStack) {
  const values = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const id = node.getAttribute("id");
  const domain = node.getAttribute("domain");
  if (id !== null && domain !== null) {
    values["email"] = `${id}@${domain}`;
  }
}
function parseLink(node, objectStack) {
  const values = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const href = node.getAttribute("href");
  if (href !== null) {
    values["link"] = href;
  }
  parseNode(LINK_PARSERS, node, objectStack);
}
function parseExtensions(node, objectStack) {
  const values = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  values["extensionsNode_"] = node;
}
function parseRtePt(node, objectStack) {
  const values = pushParseAndPop({}, RTEPT_PARSERS, node, objectStack);
  if (values) {
    const rteValues = (
      /** @type {!Object} */
      objectStack[objectStack.length - 1]
    );
    const flatCoordinates = (
      /** @type {Array<number>} */
      rteValues["flatCoordinates"]
    );
    const layoutOptions = (
      /** @type {LayoutOptions} */
      rteValues["layoutOptions"]
    );
    appendCoordinate(flatCoordinates, layoutOptions, node, values);
  }
}
function parseTrkPt(node, objectStack) {
  const values = pushParseAndPop({}, TRKPT_PARSERS, node, objectStack);
  if (values) {
    const trkValues = (
      /** @type {!Object} */
      objectStack[objectStack.length - 1]
    );
    const flatCoordinates = (
      /** @type {Array<number>} */
      trkValues["flatCoordinates"]
    );
    const layoutOptions = (
      /** @type {LayoutOptions} */
      trkValues["layoutOptions"]
    );
    appendCoordinate(flatCoordinates, layoutOptions, node, values);
  }
}
function parseTrkSeg(node, objectStack) {
  const values = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  parseNode(TRKSEG_PARSERS, node, objectStack);
  const flatCoordinates = (
    /** @type {Array<number>} */
    values["flatCoordinates"]
  );
  const ends = (
    /** @type {Array<number>} */
    values["ends"]
  );
  ends.push(flatCoordinates.length);
}
function readRte(node, objectStack) {
  const options = (
    /** @type {import("./Feature.js").ReadOptions} */
    objectStack[0]
  );
  const values = pushParseAndPop({
    "flatCoordinates": [],
    "layoutOptions": {}
  }, RTE_PARSERS, node, objectStack);
  if (!values) {
    return void 0;
  }
  const flatCoordinates = (
    /** @type {Array<number>} */
    values["flatCoordinates"]
  );
  delete values["flatCoordinates"];
  const layoutOptions = (
    /** @type {LayoutOptions} */
    values["layoutOptions"]
  );
  delete values["layoutOptions"];
  const layout = applyLayoutOptions(layoutOptions, flatCoordinates);
  const geometry = new LineString_default(flatCoordinates, layout);
  transformGeometryWithOptions(geometry, false, options);
  const feature = new Feature_default(geometry);
  feature.setProperties(values, true);
  return feature;
}
function readTrk(node, objectStack) {
  const options = (
    /** @type {import("./Feature.js").ReadOptions} */
    objectStack[0]
  );
  const values = pushParseAndPop({
    "flatCoordinates": [],
    "ends": [],
    "layoutOptions": {}
  }, TRK_PARSERS, node, objectStack);
  if (!values) {
    return void 0;
  }
  const flatCoordinates = (
    /** @type {Array<number>} */
    values["flatCoordinates"]
  );
  delete values["flatCoordinates"];
  const ends = (
    /** @type {Array<number>} */
    values["ends"]
  );
  delete values["ends"];
  const layoutOptions = (
    /** @type {LayoutOptions} */
    values["layoutOptions"]
  );
  delete values["layoutOptions"];
  const layout = applyLayoutOptions(layoutOptions, flatCoordinates, ends);
  const geometry = new MultiLineString_default(flatCoordinates, layout, ends);
  transformGeometryWithOptions(geometry, false, options);
  const feature = new Feature_default(geometry);
  feature.setProperties(values, true);
  return feature;
}
function readWpt(node, objectStack) {
  const options = (
    /** @type {import("./Feature.js").ReadOptions} */
    objectStack[0]
  );
  const values = pushParseAndPop({}, WPT_PARSERS, node, objectStack);
  if (!values) {
    return void 0;
  }
  const layoutOptions = (
    /** @type {LayoutOptions} */
    {}
  );
  const coordinates = appendCoordinate([], layoutOptions, node, values);
  const layout = applyLayoutOptions(layoutOptions, coordinates);
  const geometry = new Point_default(coordinates, layout);
  transformGeometryWithOptions(geometry, false, options);
  const feature = new Feature_default(geometry);
  feature.setProperties(values, true);
  return feature;
}
function writeLink(node, value, objectStack) {
  node.setAttribute("href", value);
  const context = objectStack[objectStack.length - 1];
  const properties = context["properties"];
  const link = [properties["linkText"], properties["linkType"]];
  pushSerializeAndPop(
    /** @type {import("../xml.js").NodeStackItem} */
    {
      node
    },
    LINK_SERIALIZERS,
    OBJECT_PROPERTY_NODE_FACTORY,
    link,
    objectStack,
    LINK_SEQUENCE
  );
}
function writeWptType(node, coordinate, objectStack) {
  const context = objectStack[objectStack.length - 1];
  const parentNode = context.node;
  const namespaceURI = parentNode.namespaceURI;
  const properties = context["properties"];
  node.setAttributeNS(null, "lat", String(coordinate[1]));
  node.setAttributeNS(null, "lon", String(coordinate[0]));
  const geometryLayout = context["geometryLayout"];
  switch (geometryLayout) {
    case "XYZM":
      if (coordinate[3] !== 0) {
        properties["time"] = coordinate[3];
      }
    case "XYZ":
      if (coordinate[2] !== 0) {
        properties["ele"] = coordinate[2];
      }
      break;
    case "XYM":
      if (coordinate[2] !== 0) {
        properties["time"] = coordinate[2];
      }
      break;
    default:
  }
  const orderedKeys = node.nodeName == "rtept" ? RTEPT_TYPE_SEQUENCE[namespaceURI] : WPT_TYPE_SEQUENCE[namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(
    /** @type {import("../xml.js").NodeStackItem} */
    {
      node,
      "properties": properties
    },
    WPT_TYPE_SERIALIZERS,
    OBJECT_PROPERTY_NODE_FACTORY,
    values,
    objectStack,
    orderedKeys
  );
}
function writeRte(node, feature, objectStack) {
  const options = (
    /** @type {import("./Feature.js").WriteOptions} */
    objectStack[0]
  );
  const properties = feature.getProperties();
  const context = {
    node
  };
  context["properties"] = properties;
  const geometry = feature.getGeometry();
  if (geometry.getType() == "LineString") {
    const lineString = (
      /** @type {LineString} */
      transformGeometryWithOptions(geometry, true, options)
    );
    context["geometryLayout"] = lineString.getLayout();
    properties["rtept"] = lineString.getCoordinates();
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = RTE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, RTE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
function writeTrk(node, feature, objectStack) {
  const options = (
    /** @type {import("./Feature.js").WriteOptions} */
    objectStack[0]
  );
  const properties = feature.getProperties();
  const context = {
    node
  };
  context["properties"] = properties;
  const geometry = feature.getGeometry();
  if (geometry.getType() == "MultiLineString") {
    const multiLineString = (
      /** @type {MultiLineString} */
      transformGeometryWithOptions(geometry, true, options)
    );
    properties["trkseg"] = multiLineString.getLineStrings();
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = TRK_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, TRK_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
function writeTrkSeg(node, lineString, objectStack) {
  const context = {
    node
  };
  context["geometryLayout"] = lineString.getLayout();
  context["properties"] = {};
  pushSerializeAndPop(context, TRKSEG_SERIALIZERS, TRKSEG_NODE_FACTORY, lineString.getCoordinates(), objectStack);
}
function writeWpt(node, feature, objectStack) {
  const options = (
    /** @type {import("./Feature.js").WriteOptions} */
    objectStack[0]
  );
  const context = objectStack[objectStack.length - 1];
  context["properties"] = feature.getProperties();
  const geometry = feature.getGeometry();
  if (geometry.getType() == "Point") {
    const point = (
      /** @type {Point} */
      transformGeometryWithOptions(geometry, true, options)
    );
    context["geometryLayout"] = point.getLayout();
    writeWptType(node, point.getCoordinates(), objectStack);
  }
}

// ../../node_modules/ol/format/KML.js
var GX_NAMESPACE_URIS = ["http://www.google.com/kml/ext/2.2"];
var NAMESPACE_URIS2 = [null, "http://earth.google.com/kml/2.0", "http://earth.google.com/kml/2.1", "http://earth.google.com/kml/2.2", "http://www.opengis.net/kml/2.2"];
var ICON_ANCHOR_UNITS_MAP = {
  "fraction": "fraction",
  "pixels": "pixels",
  "insetPixels": "pixels"
};
var PLACEMARK_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "ExtendedData": extendedDataParser,
  "Region": regionParser,
  "MultiGeometry": makeObjectPropertySetter(readMultiGeometry, "geometry"),
  "LineString": makeObjectPropertySetter(readLineString, "geometry"),
  "LinearRing": makeObjectPropertySetter(readLinearRing, "geometry"),
  "Point": makeObjectPropertySetter(readPoint, "geometry"),
  "Polygon": makeObjectPropertySetter(readPolygon, "geometry"),
  "Style": makeObjectPropertySetter(readStyle),
  "StyleMap": placemarkStyleMapParser,
  "address": makeObjectPropertySetter(readString),
  "description": makeObjectPropertySetter(readString),
  "name": makeObjectPropertySetter(readString),
  "open": makeObjectPropertySetter(readBoolean),
  "phoneNumber": makeObjectPropertySetter(readString),
  "styleUrl": makeObjectPropertySetter(readStyleURL),
  "visibility": makeObjectPropertySetter(readBoolean)
}, makeStructureNS(GX_NAMESPACE_URIS, {
  "MultiTrack": makeObjectPropertySetter(readGxMultiTrack, "geometry"),
  "Track": makeObjectPropertySetter(readGxTrack, "geometry")
}));
var NETWORK_LINK_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "ExtendedData": extendedDataParser,
  "Region": regionParser,
  "Link": linkParser,
  "address": makeObjectPropertySetter(readString),
  "description": makeObjectPropertySetter(readString),
  "name": makeObjectPropertySetter(readString),
  "open": makeObjectPropertySetter(readBoolean),
  "phoneNumber": makeObjectPropertySetter(readString),
  "visibility": makeObjectPropertySetter(readBoolean)
});
var LINK_PARSERS2 = makeStructureNS(NAMESPACE_URIS2, {
  "href": makeObjectPropertySetter(readURI)
});
var CAMERA_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  Altitude: makeObjectPropertySetter(readDecimal),
  Longitude: makeObjectPropertySetter(readDecimal),
  Latitude: makeObjectPropertySetter(readDecimal),
  Tilt: makeObjectPropertySetter(readDecimal),
  AltitudeMode: makeObjectPropertySetter(readString),
  Heading: makeObjectPropertySetter(readDecimal),
  Roll: makeObjectPropertySetter(readDecimal)
});
var REGION_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "LatLonAltBox": latLonAltBoxParser,
  "Lod": lodParser
});
var KML_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["Document", "Placemark"]);
var KML_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "Document": makeChildAppender(writeDocument),
  "Placemark": makeChildAppender(writePlacemark)
});
var DEFAULT_COLOR;
var DEFAULT_FILL_STYLE = null;
var DEFAULT_IMAGE_STYLE_ANCHOR;
var DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
var DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
var DEFAULT_IMAGE_STYLE_SIZE;
var DEFAULT_IMAGE_STYLE_SRC;
var DEFAULT_IMAGE_STYLE = null;
var DEFAULT_NO_IMAGE_STYLE;
var DEFAULT_STROKE_STYLE = null;
var DEFAULT_TEXT_STYLE = null;
function scaleForSize(size) {
  return 32 / Math.min(size[0], size[1]);
}
function readColor(node) {
  const s = getAllTextContent(node, false);
  const m2 = /^\s*#?\s*([0-9A-Fa-f]{8})\s*$/.exec(s);
  if (m2) {
    const hexColor = m2[1];
    return [parseInt(hexColor.substr(6, 2), 16), parseInt(hexColor.substr(4, 2), 16), parseInt(hexColor.substr(2, 2), 16), parseInt(hexColor.substr(0, 2), 16) / 255];
  }
  return void 0;
}
function readFlatCoordinates(node) {
  let s = getAllTextContent(node, false);
  const flatCoordinates = [];
  s = s.replace(/\s*,\s*/g, ",");
  const re2 = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?),([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s+|,|$)(?:([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s+|$))?\s*/i;
  let m2;
  while (m2 = re2.exec(s)) {
    const x2 = parseFloat(m2[1]);
    const y = parseFloat(m2[2]);
    const z2 = m2[3] ? parseFloat(m2[3]) : 0;
    flatCoordinates.push(x2, y, z2);
    s = s.substr(m2[0].length);
  }
  if (s !== "") {
    return void 0;
  }
  return flatCoordinates;
}
function readURI(node) {
  const s = getAllTextContent(node, false).trim();
  let baseURI = node.baseURI;
  if (!baseURI || baseURI == "about:blank") {
    baseURI = window.location.href;
  }
  if (baseURI) {
    const url = new URL(s, baseURI);
    return url.href;
  }
  return s;
}
function readStyleURL(node) {
  const s = getAllTextContent(node, false).trim().replace(/^(?!.*#)/, "#");
  let baseURI = node.baseURI;
  if (!baseURI || baseURI == "about:blank") {
    baseURI = window.location.href;
  }
  if (baseURI) {
    const url = new URL(s, baseURI);
    return url.href;
  }
  return s;
}
function readVec2(node) {
  const xunits = node.getAttribute("xunits");
  const yunits = node.getAttribute("yunits");
  let origin;
  if (xunits !== "insetPixels") {
    if (yunits !== "insetPixels") {
      origin = "bottom-left";
    } else {
      origin = "top-left";
    }
  } else {
    if (yunits !== "insetPixels") {
      origin = "bottom-right";
    } else {
      origin = "top-right";
    }
  }
  return {
    x: parseFloat(node.getAttribute("x")),
    xunits: ICON_ANCHOR_UNITS_MAP[xunits],
    y: parseFloat(node.getAttribute("y")),
    yunits: ICON_ANCHOR_UNITS_MAP[yunits],
    origin
  };
}
function readScale(node) {
  return readDecimal(node);
}
var STYLE_MAP_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Pair": pairDataParser
});
function readStyleMapValue(node, objectStack) {
  return pushParseAndPop(void 0, STYLE_MAP_PARSERS, node, objectStack, this);
}
var ICON_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Icon": makeObjectPropertySetter(readIcon),
  "color": makeObjectPropertySetter(readColor),
  "heading": makeObjectPropertySetter(readDecimal),
  "hotSpot": makeObjectPropertySetter(readVec2),
  "scale": makeObjectPropertySetter(readScale)
});
function iconStyleParser(node, objectStack) {
  const object = pushParseAndPop({}, ICON_STYLE_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const styleObject = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const IconObject = "Icon" in object ? object["Icon"] : {};
  const drawIcon = !("Icon" in object) || Object.keys(IconObject).length > 0;
  let src;
  const href = (
    /** @type {string|undefined} */
    IconObject["href"]
  );
  if (href) {
    src = href;
  } else if (drawIcon) {
    src = DEFAULT_IMAGE_STYLE_SRC;
  }
  let anchor, anchorXUnits, anchorYUnits;
  let anchorOrigin = "bottom-left";
  const hotSpot = (
    /** @type {Vec2|undefined} */
    object["hotSpot"]
  );
  if (hotSpot) {
    anchor = [hotSpot.x, hotSpot.y];
    anchorXUnits = hotSpot.xunits;
    anchorYUnits = hotSpot.yunits;
    anchorOrigin = hotSpot.origin;
  } else if (/^https?:\/\/maps\.(?:google|gstatic)\.com\//.test(src)) {
    if (src.includes("pushpin")) {
      anchor = DEFAULT_IMAGE_STYLE_ANCHOR;
      anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
      anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
    } else if (src.includes("arrow-reverse")) {
      anchor = [54, 42];
      anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
      anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
    } else if (src.includes("paddle")) {
      anchor = [32, 1];
      anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
      anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
    }
  }
  let offset;
  const x2 = (
    /** @type {number|undefined} */
    IconObject["x"]
  );
  const y = (
    /** @type {number|undefined} */
    IconObject["y"]
  );
  if (x2 !== void 0 && y !== void 0) {
    offset = [x2, y];
  }
  let size;
  const w2 = (
    /** @type {number|undefined} */
    IconObject["w"]
  );
  const h = (
    /** @type {number|undefined} */
    IconObject["h"]
  );
  if (w2 !== void 0 && h !== void 0) {
    size = [w2, h];
  }
  let rotation;
  const heading = (
    /** @type {number} */
    object["heading"]
  );
  if (heading !== void 0) {
    rotation = toRadians(heading);
  }
  const scale = (
    /** @type {number|undefined} */
    object["scale"]
  );
  const color = (
    /** @type {Array<number>|undefined} */
    object["color"]
  );
  if (drawIcon) {
    if (src == DEFAULT_IMAGE_STYLE_SRC) {
      size = DEFAULT_IMAGE_STYLE_SIZE;
    }
    const imageStyle = new Icon_default({
      anchor,
      anchorOrigin,
      anchorXUnits,
      anchorYUnits,
      crossOrigin: this.crossOrigin_,
      offset,
      offsetOrigin: "bottom-left",
      rotation,
      scale,
      size,
      src: this.iconUrlFunction_(src),
      color
    });
    const imageScale = imageStyle.getScaleArray()[0];
    const imageSize = imageStyle.getSize();
    if (imageSize === null) {
      const imageState = imageStyle.getImageState();
      if (imageState === ImageState_default.IDLE || imageState === ImageState_default.LOADING) {
        const listener = function() {
          const imageState2 = imageStyle.getImageState();
          if (!(imageState2 === ImageState_default.IDLE || imageState2 === ImageState_default.LOADING)) {
            const imageSize2 = imageStyle.getSize();
            if (imageSize2 && imageSize2.length == 2) {
              const resizeScale = scaleForSize(imageSize2);
              imageStyle.setScale(imageScale * resizeScale);
            }
            imageStyle.unlistenImageChange(listener);
          }
        };
        imageStyle.listenImageChange(listener);
        if (imageState === ImageState_default.IDLE) {
          imageStyle.load();
        }
      }
    } else if (imageSize.length == 2) {
      const resizeScale = scaleForSize(imageSize);
      imageStyle.setScale(imageScale * resizeScale);
    }
    styleObject["imageStyle"] = imageStyle;
  } else {
    styleObject["imageStyle"] = DEFAULT_NO_IMAGE_STYLE;
  }
}
var LABEL_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeObjectPropertySetter(readColor),
  "scale": makeObjectPropertySetter(readScale)
});
function labelStyleParser(node, objectStack) {
  const object = pushParseAndPop({}, LABEL_STYLE_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const styleObject = objectStack[objectStack.length - 1];
  const textStyle = new Text_default({
    fill: new Fill_default({
      color: (
        /** @type {import("../color.js").Color} */
        "color" in object ? object["color"] : DEFAULT_COLOR
      )
    }),
    scale: (
      /** @type {number|undefined} */
      object["scale"]
    )
  });
  styleObject["textStyle"] = textStyle;
}
var LINE_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeObjectPropertySetter(readColor),
  "width": makeObjectPropertySetter(readDecimal)
});
function lineStyleParser(node, objectStack) {
  const object = pushParseAndPop({}, LINE_STYLE_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const styleObject = objectStack[objectStack.length - 1];
  const strokeStyle = new Stroke_default({
    color: (
      /** @type {import("../color.js").Color} */
      "color" in object ? object["color"] : DEFAULT_COLOR
    ),
    width: (
      /** @type {number} */
      "width" in object ? object["width"] : 1
    )
  });
  styleObject["strokeStyle"] = strokeStyle;
}
var POLY_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeObjectPropertySetter(readColor),
  "fill": makeObjectPropertySetter(readBoolean),
  "outline": makeObjectPropertySetter(readBoolean)
});
function polyStyleParser(node, objectStack) {
  const object = pushParseAndPop({}, POLY_STYLE_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const styleObject = objectStack[objectStack.length - 1];
  const fillStyle = new Fill_default({
    color: (
      /** @type {import("../color.js").Color} */
      "color" in object ? object["color"] : DEFAULT_COLOR
    )
  });
  styleObject["fillStyle"] = fillStyle;
  const fill = (
    /** @type {boolean|undefined} */
    object["fill"]
  );
  if (fill !== void 0) {
    styleObject["fill"] = fill;
  }
  const outline = (
    /** @type {boolean|undefined} */
    object["outline"]
  );
  if (outline !== void 0) {
    styleObject["outline"] = outline;
  }
}
var FLAT_LINEAR_RING_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "coordinates": makeReplacer(readFlatCoordinates)
});
function readFlatLinearRing(node, objectStack) {
  return pushParseAndPop(null, FLAT_LINEAR_RING_PARSERS, node, objectStack);
}
function gxCoordParser(node, objectStack) {
  const gxTrackObject = (
    /** @type {GxTrackObject} */
    objectStack[objectStack.length - 1]
  );
  const coordinates = gxTrackObject.coordinates;
  const s = getAllTextContent(node, false);
  const re2 = /^\s*([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s*$/i;
  const m2 = re2.exec(s);
  if (m2) {
    const x2 = parseFloat(m2[1]);
    const y = parseFloat(m2[2]);
    const z2 = parseFloat(m2[3]);
    coordinates.push([x2, y, z2]);
  } else {
    coordinates.push([]);
  }
}
var GX_MULTITRACK_GEOMETRY_PARSERS = makeStructureNS(GX_NAMESPACE_URIS, {
  "Track": makeArrayPusher(readGxTrack)
});
function readGxMultiTrack(node, objectStack) {
  const lineStrings = pushParseAndPop([], GX_MULTITRACK_GEOMETRY_PARSERS, node, objectStack);
  if (!lineStrings) {
    return void 0;
  }
  return new MultiLineString_default(lineStrings);
}
var GX_TRACK_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "when": whenParser
}, makeStructureNS(GX_NAMESPACE_URIS, {
  "coord": gxCoordParser
}));
function readGxTrack(node, objectStack) {
  const gxTrackObject = pushParseAndPop(
    /** @type {GxTrackObject} */
    {
      coordinates: [],
      whens: []
    },
    GX_TRACK_PARSERS,
    node,
    objectStack
  );
  if (!gxTrackObject) {
    return void 0;
  }
  const flatCoordinates = [];
  const coordinates = gxTrackObject.coordinates;
  const whens = gxTrackObject.whens;
  for (let i = 0, ii = Math.min(coordinates.length, whens.length); i < ii; ++i) {
    if (coordinates[i].length == 3) {
      flatCoordinates.push(coordinates[i][0], coordinates[i][1], coordinates[i][2], whens[i]);
    }
  }
  return new LineString_default(flatCoordinates, "XYZM");
}
var ICON_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "href": makeObjectPropertySetter(readURI)
}, makeStructureNS(GX_NAMESPACE_URIS, {
  "x": makeObjectPropertySetter(readDecimal),
  "y": makeObjectPropertySetter(readDecimal),
  "w": makeObjectPropertySetter(readDecimal),
  "h": makeObjectPropertySetter(readDecimal)
}));
function readIcon(node, objectStack) {
  const iconObject = pushParseAndPop({}, ICON_PARSERS, node, objectStack);
  if (iconObject) {
    return iconObject;
  }
  return null;
}
var GEOMETRY_FLAT_COORDINATES_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "coordinates": makeReplacer(readFlatCoordinates)
});
function readFlatCoordinatesFromNode(node, objectStack) {
  return pushParseAndPop(null, GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack);
}
var EXTRUDE_AND_ALTITUDE_MODE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "extrude": makeObjectPropertySetter(readBoolean),
  "tessellate": makeObjectPropertySetter(readBoolean),
  "altitudeMode": makeObjectPropertySetter(readString)
});
function readLineString(node, objectStack) {
  const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
  const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
  if (flatCoordinates) {
    const lineString = new LineString_default(flatCoordinates, "XYZ");
    lineString.setProperties(properties, true);
    return lineString;
  }
  return void 0;
}
function readLinearRing(node, objectStack) {
  const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
  const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
  if (flatCoordinates) {
    const polygon = new Polygon_default(flatCoordinates, "XYZ", [flatCoordinates.length]);
    polygon.setProperties(properties, true);
    return polygon;
  }
  return void 0;
}
var MULTI_GEOMETRY_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "LineString": makeArrayPusher(readLineString),
  "LinearRing": makeArrayPusher(readLinearRing),
  "MultiGeometry": makeArrayPusher(readMultiGeometry),
  "Point": makeArrayPusher(readPoint),
  "Polygon": makeArrayPusher(readPolygon)
});
function readMultiGeometry(node, objectStack) {
  const geometries = pushParseAndPop([], MULTI_GEOMETRY_PARSERS, node, objectStack);
  if (!geometries) {
    return null;
  }
  if (geometries.length === 0) {
    return new GeometryCollection_default(geometries);
  }
  let multiGeometry;
  let homogeneous = true;
  const type = geometries[0].getType();
  let geometry;
  for (let i = 1, ii = geometries.length; i < ii; ++i) {
    geometry = geometries[i];
    if (geometry.getType() != type) {
      homogeneous = false;
      break;
    }
  }
  if (homogeneous) {
    let layout;
    let flatCoordinates;
    if (type == "Point") {
      const point = geometries[0];
      layout = point.getLayout();
      flatCoordinates = point.getFlatCoordinates();
      for (let i = 1, ii = geometries.length; i < ii; ++i) {
        geometry = geometries[i];
        extend(flatCoordinates, geometry.getFlatCoordinates());
      }
      multiGeometry = new MultiPoint_default(flatCoordinates, layout);
      setCommonGeometryProperties(multiGeometry, geometries);
    } else if (type == "LineString") {
      multiGeometry = new MultiLineString_default(geometries);
      setCommonGeometryProperties(multiGeometry, geometries);
    } else if (type == "Polygon") {
      multiGeometry = new MultiPolygon_default(geometries);
      setCommonGeometryProperties(multiGeometry, geometries);
    } else if (type == "GeometryCollection" || type.startsWith("Multi")) {
      multiGeometry = new GeometryCollection_default(geometries);
    } else {
      throw new Error("Unknown geometry type found");
    }
  } else {
    multiGeometry = new GeometryCollection_default(geometries);
  }
  return (
    /** @type {import("../geom/Geometry.js").default} */
    multiGeometry
  );
}
function readPoint(node, objectStack) {
  const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
  const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
  if (flatCoordinates) {
    const point = new Point_default(flatCoordinates, "XYZ");
    point.setProperties(properties, true);
    return point;
  }
  return void 0;
}
var FLAT_LINEAR_RINGS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "innerBoundaryIs": innerBoundaryIsParser,
  "outerBoundaryIs": outerBoundaryIsParser
});
function readPolygon(node, objectStack) {
  const properties = pushParseAndPop(
    /** @type {Object<string,*>} */
    {},
    EXTRUDE_AND_ALTITUDE_MODE_PARSERS,
    node,
    objectStack
  );
  const flatLinearRings = pushParseAndPop([null], FLAT_LINEAR_RINGS_PARSERS, node, objectStack);
  if (flatLinearRings && flatLinearRings[0]) {
    const flatCoordinates = flatLinearRings[0];
    const ends = [flatCoordinates.length];
    for (let i = 1, ii = flatLinearRings.length; i < ii; ++i) {
      extend(flatCoordinates, flatLinearRings[i]);
      ends.push(flatCoordinates.length);
    }
    const polygon = new Polygon_default(flatCoordinates, "XYZ", ends);
    polygon.setProperties(properties, true);
    return polygon;
  }
  return void 0;
}
var STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "IconStyle": iconStyleParser,
  "LabelStyle": labelStyleParser,
  "LineStyle": lineStyleParser,
  "PolyStyle": polyStyleParser
});
function readStyle(node, objectStack) {
  const styleObject = pushParseAndPop({}, STYLE_PARSERS, node, objectStack, this);
  if (!styleObject) {
    return null;
  }
  let fillStyle = (
    /** @type {Fill} */
    "fillStyle" in styleObject ? styleObject["fillStyle"] : DEFAULT_FILL_STYLE
  );
  const fill = (
    /** @type {boolean|undefined} */
    styleObject["fill"]
  );
  if (fill !== void 0 && !fill) {
    fillStyle = null;
  }
  let imageStyle;
  if ("imageStyle" in styleObject) {
    if (styleObject["imageStyle"] != DEFAULT_NO_IMAGE_STYLE) {
      imageStyle = /** @type {import("../style/Image.js").default} */
      styleObject["imageStyle"];
    }
  } else {
    imageStyle = DEFAULT_IMAGE_STYLE;
  }
  const textStyle = (
    /** @type {Text} */
    "textStyle" in styleObject ? styleObject["textStyle"] : DEFAULT_TEXT_STYLE
  );
  const strokeStyle = (
    /** @type {Stroke} */
    "strokeStyle" in styleObject ? styleObject["strokeStyle"] : DEFAULT_STROKE_STYLE
  );
  const outline = (
    /** @type {boolean|undefined} */
    styleObject["outline"]
  );
  if (outline !== void 0 && !outline) {
    return [new Style_default({
      geometry: function(feature) {
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        if (type === "GeometryCollection") {
          const collection = (
            /** @type {import("../geom/GeometryCollection").default} */
            geometry
          );
          return new GeometryCollection_default(collection.getGeometriesArrayRecursive().filter(function(geometry2) {
            const type2 = geometry2.getType();
            return type2 !== "Polygon" && type2 !== "MultiPolygon";
          }));
        }
        if (type !== "Polygon" && type !== "MultiPolygon") {
          return geometry;
        }
      },
      fill: fillStyle,
      image: imageStyle,
      stroke: strokeStyle,
      text: textStyle,
      zIndex: void 0
      // FIXME
    }), new Style_default({
      geometry: function(feature) {
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        if (type === "GeometryCollection") {
          const collection = (
            /** @type {import("../geom/GeometryCollection").default} */
            geometry
          );
          return new GeometryCollection_default(collection.getGeometriesArrayRecursive().filter(function(geometry2) {
            const type2 = geometry2.getType();
            return type2 === "Polygon" || type2 === "MultiPolygon";
          }));
        }
        if (type === "Polygon" || type === "MultiPolygon") {
          return geometry;
        }
      },
      fill: fillStyle,
      stroke: null,
      zIndex: void 0
      // FIXME
    })];
  }
  return [new Style_default({
    fill: fillStyle,
    image: imageStyle,
    stroke: strokeStyle,
    text: textStyle,
    zIndex: void 0
    // FIXME
  })];
}
function setCommonGeometryProperties(multiGeometry, geometries) {
  const ii = geometries.length;
  const extrudes = new Array(geometries.length);
  const tessellates = new Array(geometries.length);
  const altitudeModes = new Array(geometries.length);
  let hasExtrude, hasTessellate, hasAltitudeMode;
  hasExtrude = false;
  hasTessellate = false;
  hasAltitudeMode = false;
  for (let i = 0; i < ii; ++i) {
    const geometry = geometries[i];
    extrudes[i] = geometry.get("extrude");
    tessellates[i] = geometry.get("tessellate");
    altitudeModes[i] = geometry.get("altitudeMode");
    hasExtrude = hasExtrude || extrudes[i] !== void 0;
    hasTessellate = hasTessellate || tessellates[i] !== void 0;
    hasAltitudeMode = hasAltitudeMode || altitudeModes[i];
  }
  if (hasExtrude) {
    multiGeometry.set("extrude", extrudes);
  }
  if (hasTessellate) {
    multiGeometry.set("tessellate", tessellates);
  }
  if (hasAltitudeMode) {
    multiGeometry.set("altitudeMode", altitudeModes);
  }
}
var DATA_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "displayName": makeObjectPropertySetter(readString),
  "value": makeObjectPropertySetter(readString)
});
function dataParser(node, objectStack) {
  const name = node.getAttribute("name");
  parseNode(DATA_PARSERS, node, objectStack);
  const featureObject = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  if (name && featureObject.displayName) {
    featureObject[name] = {
      value: featureObject.value,
      displayName: featureObject.displayName,
      toString: function() {
        return featureObject.value;
      }
    };
  } else if (name !== null) {
    featureObject[name] = featureObject.value;
  } else if (featureObject.displayName !== null) {
    featureObject[featureObject.displayName] = featureObject.value;
  }
  delete featureObject["value"];
}
var EXTENDED_DATA_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Data": dataParser,
  "SchemaData": schemaDataParser
});
function extendedDataParser(node, objectStack) {
  parseNode(EXTENDED_DATA_PARSERS, node, objectStack);
}
function regionParser(node, objectStack) {
  parseNode(REGION_PARSERS, node, objectStack);
}
var PAIR_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Style": makeObjectPropertySetter(readStyle),
  "key": makeObjectPropertySetter(readString),
  "styleUrl": makeObjectPropertySetter(readStyleURL)
});
function pairDataParser(node, objectStack) {
  const pairObject = pushParseAndPop({}, PAIR_PARSERS, node, objectStack, this);
  if (!pairObject) {
    return;
  }
  const key = (
    /** @type {string|undefined} */
    pairObject["key"]
  );
  if (key && key == "normal") {
    const styleUrl = (
      /** @type {string|undefined} */
      pairObject["styleUrl"]
    );
    if (styleUrl) {
      objectStack[objectStack.length - 1] = styleUrl;
    }
    const style = (
      /** @type {Style} */
      pairObject["Style"]
    );
    if (style) {
      objectStack[objectStack.length - 1] = style;
    }
  }
}
function placemarkStyleMapParser(node, objectStack) {
  const styleMapValue = readStyleMapValue.call(this, node, objectStack);
  if (!styleMapValue) {
    return;
  }
  const placemarkObject = objectStack[objectStack.length - 1];
  if (Array.isArray(styleMapValue)) {
    placemarkObject["Style"] = styleMapValue;
  } else if (typeof styleMapValue === "string") {
    placemarkObject["styleUrl"] = styleMapValue;
  } else {
    throw new Error("`styleMapValue` has an unknown type");
  }
}
var SCHEMA_DATA_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "SimpleData": simpleDataParser
});
function schemaDataParser(node, objectStack) {
  parseNode(SCHEMA_DATA_PARSERS, node, objectStack);
}
function simpleDataParser(node, objectStack) {
  const name = node.getAttribute("name");
  if (name !== null) {
    const data = readString(node);
    const featureObject = (
      /** @type {Object} */
      objectStack[objectStack.length - 1]
    );
    featureObject[name] = data;
  }
}
var LAT_LON_ALT_BOX_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "altitudeMode": makeObjectPropertySetter(readString),
  "minAltitude": makeObjectPropertySetter(readDecimal),
  "maxAltitude": makeObjectPropertySetter(readDecimal),
  "north": makeObjectPropertySetter(readDecimal),
  "south": makeObjectPropertySetter(readDecimal),
  "east": makeObjectPropertySetter(readDecimal),
  "west": makeObjectPropertySetter(readDecimal)
});
function latLonAltBoxParser(node, objectStack) {
  const object = pushParseAndPop({}, LAT_LON_ALT_BOX_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const regionObject = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const extent = [parseFloat(object["west"]), parseFloat(object["south"]), parseFloat(object["east"]), parseFloat(object["north"])];
  regionObject["extent"] = extent;
  regionObject["altitudeMode"] = object["altitudeMode"];
  regionObject["minAltitude"] = parseFloat(object["minAltitude"]);
  regionObject["maxAltitude"] = parseFloat(object["maxAltitude"]);
}
var LOD_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "minLodPixels": makeObjectPropertySetter(readDecimal),
  "maxLodPixels": makeObjectPropertySetter(readDecimal),
  "minFadeExtent": makeObjectPropertySetter(readDecimal),
  "maxFadeExtent": makeObjectPropertySetter(readDecimal)
});
function lodParser(node, objectStack) {
  const object = pushParseAndPop({}, LOD_PARSERS, node, objectStack);
  if (!object) {
    return;
  }
  const lodObject = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  lodObject["minLodPixels"] = parseFloat(object["minLodPixels"]);
  lodObject["maxLodPixels"] = parseFloat(object["maxLodPixels"]);
  lodObject["minFadeExtent"] = parseFloat(object["minFadeExtent"]);
  lodObject["maxFadeExtent"] = parseFloat(object["maxFadeExtent"]);
}
var INNER_BOUNDARY_IS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  // KML spec only allows one LinearRing  per innerBoundaryIs, but Google Earth
  // allows multiple, so we parse multiple here too.
  "LinearRing": makeArrayPusher(readFlatLinearRing)
});
function innerBoundaryIsParser(node, objectStack) {
  const innerBoundaryFlatLinearRings = pushParseAndPop(
    /** @type {Array<Array<number>>} */
    [],
    INNER_BOUNDARY_IS_PARSERS,
    node,
    objectStack
  );
  if (innerBoundaryFlatLinearRings.length > 0) {
    const flatLinearRings = (
      /** @type {Array<Array<number>>} */
      objectStack[objectStack.length - 1]
    );
    flatLinearRings.push(...innerBoundaryFlatLinearRings);
  }
}
var OUTER_BOUNDARY_IS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "LinearRing": makeReplacer(readFlatLinearRing)
});
function outerBoundaryIsParser(node, objectStack) {
  const flatLinearRing = pushParseAndPop(void 0, OUTER_BOUNDARY_IS_PARSERS, node, objectStack);
  if (flatLinearRing) {
    const flatLinearRings = (
      /** @type {Array<Array<number>>} */
      objectStack[objectStack.length - 1]
    );
    flatLinearRings[0] = flatLinearRing;
  }
}
function linkParser(node, objectStack) {
  parseNode(LINK_PARSERS2, node, objectStack);
}
function whenParser(node, objectStack) {
  const gxTrackObject = (
    /** @type {GxTrackObject} */
    objectStack[objectStack.length - 1]
  );
  const whens = gxTrackObject.whens;
  const s = getAllTextContent(node, false);
  const when = Date.parse(s);
  whens.push(isNaN(when) ? 0 : when);
}
function writeColorTextNode(node, color) {
  const rgba = asArray(color);
  const opacity = rgba.length == 4 ? rgba[3] : 1;
  const abgr = [opacity * 255, rgba[2], rgba[1], rgba[0]];
  for (let i = 0; i < 4; ++i) {
    const hex = Math.floor(
      /** @type {number} */
      abgr[i]
    ).toString(16);
    abgr[i] = hex.length == 1 ? "0" + hex : hex;
  }
  writeStringTextNode(node, abgr.join(""));
}
function writeCoordinatesTextNode(node, coordinates, objectStack) {
  const context = objectStack[objectStack.length - 1];
  const layout = context["layout"];
  const stride = context["stride"];
  let dimension;
  if (layout == "XY" || layout == "XYM") {
    dimension = 2;
  } else if (layout == "XYZ" || layout == "XYZM") {
    dimension = 3;
  } else {
    throw new Error("Invalid geometry layout");
  }
  const ii = coordinates.length;
  let text = "";
  if (ii > 0) {
    text += coordinates[0];
    for (let d = 1; d < dimension; ++d) {
      text += "," + coordinates[d];
    }
    for (let i = stride; i < ii; i += stride) {
      text += " " + coordinates[i];
      for (let d = 1; d < dimension; ++d) {
        text += "," + coordinates[i + d];
      }
    }
  }
  writeStringTextNode(node, text);
}
var EXTENDEDDATA_NODE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "Data": makeChildAppender(writeDataNode),
  "value": makeChildAppender(writeDataNodeValue),
  "displayName": makeChildAppender(writeDataNodeName)
});
function writeDataNode(node, pair, objectStack) {
  node.setAttribute("name", pair.name);
  const context = {
    node
  };
  const value = pair.value;
  if (typeof value == "object") {
    if (value !== null && value.displayName) {
      pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value.displayName], objectStack, ["displayName"]);
    }
    if (value !== null && value.value) {
      pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value.value], objectStack, ["value"]);
    }
  } else {
    pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value], objectStack, ["value"]);
  }
}
function writeDataNodeName(node, name) {
  writeCDATASection(node, name);
}
function writeDataNodeValue(node, value) {
  writeStringTextNode(node, value);
}
var DOCUMENT_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "Placemark": makeChildAppender(writePlacemark)
});
var DOCUMENT_NODE_FACTORY = function(value, objectStack, nodeName) {
  const parentNode = objectStack[objectStack.length - 1].node;
  return createElementNS(parentNode.namespaceURI, "Placemark");
};
function writeDocument(node, features, objectStack) {
  const context = {
    node
  };
  pushSerializeAndPop(context, DOCUMENT_SERIALIZERS, DOCUMENT_NODE_FACTORY, features, objectStack, void 0, this);
}
var DATA_NODE_FACTORY = makeSimpleNodeFactory("Data");
function writeExtendedData(node, namesAndValues, objectStack) {
  const context = {
    node
  };
  const names = namesAndValues.names;
  const values = namesAndValues.values;
  const length = names.length;
  for (let i = 0; i < length; i++) {
    pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, DATA_NODE_FACTORY, [{
      name: names[i],
      value: values[i]
    }], objectStack);
  }
}
var ICON_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["href"], makeStructureNS(GX_NAMESPACE_URIS, ["x", "y", "w", "h"]));
var ICON_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "href": makeChildAppender(writeStringTextNode)
}, makeStructureNS(GX_NAMESPACE_URIS, {
  "x": makeChildAppender(writeDecimalTextNode),
  "y": makeChildAppender(writeDecimalTextNode),
  "w": makeChildAppender(writeDecimalTextNode),
  "h": makeChildAppender(writeDecimalTextNode)
}));
var GX_NODE_FACTORY = function(value, objectStack, nodeName) {
  return createElementNS(GX_NAMESPACE_URIS[0], "gx:" + nodeName);
};
function writeIcon(node, icon, objectStack) {
  const context = {
    node
  };
  const parentNode = objectStack[objectStack.length - 1].node;
  let orderedKeys = ICON_SEQUENCE[parentNode.namespaceURI];
  let values = makeSequence(icon, orderedKeys);
  pushSerializeAndPop(context, ICON_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
  orderedKeys = ICON_SEQUENCE[GX_NAMESPACE_URIS[0]];
  values = makeSequence(icon, orderedKeys);
  pushSerializeAndPop(context, ICON_SERIALIZERS, GX_NODE_FACTORY, values, objectStack, orderedKeys);
}
var ICON_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["scale", "heading", "Icon", "color", "hotSpot"]);
var ICON_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "Icon": makeChildAppender(writeIcon),
  "color": makeChildAppender(writeColorTextNode),
  "heading": makeChildAppender(writeDecimalTextNode),
  "hotSpot": makeChildAppender(writeVec2),
  "scale": makeChildAppender(writeScaleTextNode)
});
function writeIconStyle(node, style, objectStack) {
  const context = {
    node
  };
  const properties = {};
  const src = style.getSrc();
  const size = style.getSize();
  const iconImageSize = style.getImageSize();
  const iconProperties = {
    "href": src
  };
  if (size) {
    iconProperties["w"] = size[0];
    iconProperties["h"] = size[1];
    const anchor = style.getAnchor();
    const origin = style.getOrigin();
    if (origin && iconImageSize && origin[0] !== 0 && origin[1] !== size[1]) {
      iconProperties["x"] = origin[0];
      iconProperties["y"] = iconImageSize[1] - (origin[1] + size[1]);
    }
    if (anchor && (anchor[0] !== size[0] / 2 || anchor[1] !== size[1] / 2)) {
      const hotSpot = {
        x: anchor[0],
        xunits: "pixels",
        y: size[1] - anchor[1],
        yunits: "pixels"
      };
      properties["hotSpot"] = hotSpot;
    }
  }
  properties["Icon"] = iconProperties;
  let scale = style.getScaleArray()[0];
  let imageSize = size;
  if (imageSize === null) {
    imageSize = DEFAULT_IMAGE_STYLE_SIZE;
  }
  if (imageSize.length == 2) {
    const resizeScale = scaleForSize(imageSize);
    scale = scale / resizeScale;
  }
  if (scale !== 1) {
    properties["scale"] = scale;
  }
  const rotation = style.getRotation();
  if (rotation !== 0) {
    properties["heading"] = rotation;
  }
  const color = style.getColor();
  if (color) {
    properties["color"] = color;
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = ICON_STYLE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, ICON_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
var LABEL_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["color", "scale"]);
var LABEL_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeChildAppender(writeColorTextNode),
  "scale": makeChildAppender(writeScaleTextNode)
});
function writeLabelStyle(node, style, objectStack) {
  const context = {
    node
  };
  const properties = {};
  const fill = style.getFill();
  if (fill) {
    properties["color"] = fill.getColor();
  }
  const scale = style.getScale();
  if (scale && scale !== 1) {
    properties["scale"] = scale;
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = LABEL_STYLE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, LABEL_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
var LINE_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["color", "width"]);
var LINE_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeChildAppender(writeColorTextNode),
  "width": makeChildAppender(writeDecimalTextNode)
});
function writeLineStyle(node, style, objectStack) {
  const context = {
    node
  };
  const properties = {
    "color": style.getColor(),
    "width": Number(style.getWidth()) || 1
  };
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = LINE_STYLE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, LINE_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
var GEOMETRY_TYPE_TO_NODENAME = {
  "Point": "Point",
  "LineString": "LineString",
  "LinearRing": "LinearRing",
  "Polygon": "Polygon",
  "MultiPoint": "MultiGeometry",
  "MultiLineString": "MultiGeometry",
  "MultiPolygon": "MultiGeometry",
  "GeometryCollection": "MultiGeometry"
};
var GEOMETRY_NODE_FACTORY = function(value, objectStack, nodeName) {
  if (value) {
    const parentNode = objectStack[objectStack.length - 1].node;
    return createElementNS(parentNode.namespaceURI, GEOMETRY_TYPE_TO_NODENAME[
      /** @type {import("../geom/Geometry.js").default} */
      value.getType()
    ]);
  }
};
var POINT_NODE_FACTORY = makeSimpleNodeFactory("Point");
var LINE_STRING_NODE_FACTORY = makeSimpleNodeFactory("LineString");
var LINEAR_RING_NODE_FACTORY = makeSimpleNodeFactory("LinearRing");
var POLYGON_NODE_FACTORY = makeSimpleNodeFactory("Polygon");
var MULTI_GEOMETRY_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "LineString": makeChildAppender(writePrimitiveGeometry),
  "Point": makeChildAppender(writePrimitiveGeometry),
  "Polygon": makeChildAppender(writePolygon),
  "GeometryCollection": makeChildAppender(writeMultiGeometry)
});
function writeMultiGeometry(node, geometry, objectStack) {
  const context = {
    node
  };
  const type = geometry.getType();
  let geometries = [];
  let factory;
  if (type === "GeometryCollection") {
    geometry.getGeometriesArrayRecursive().forEach(function(geometry2) {
      const type2 = geometry2.getType();
      if (type2 === "MultiPoint") {
        geometries = geometries.concat(
          /** @type {MultiPoint} */
          geometry2.getPoints()
        );
      } else if (type2 === "MultiLineString") {
        geometries = geometries.concat(
          /** @type {MultiLineString} */
          geometry2.getLineStrings()
        );
      } else if (type2 === "MultiPolygon") {
        geometries = geometries.concat(
          /** @type {MultiPolygon} */
          geometry2.getPolygons()
        );
      } else if (type2 === "Point" || type2 === "LineString" || type2 === "Polygon") {
        geometries.push(geometry2);
      } else {
        throw new Error("Unknown geometry type");
      }
    });
    factory = GEOMETRY_NODE_FACTORY;
  } else if (type === "MultiPoint") {
    geometries = /** @type {MultiPoint} */
    geometry.getPoints();
    factory = POINT_NODE_FACTORY;
  } else if (type === "MultiLineString") {
    geometries = /** @type {MultiLineString} */
    geometry.getLineStrings();
    factory = LINE_STRING_NODE_FACTORY;
  } else if (type === "MultiPolygon") {
    geometries = /** @type {MultiPolygon} */
    geometry.getPolygons();
    factory = POLYGON_NODE_FACTORY;
  } else {
    throw new Error("Unknown geometry type");
  }
  pushSerializeAndPop(context, MULTI_GEOMETRY_SERIALIZERS, factory, geometries, objectStack);
}
var BOUNDARY_IS_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "LinearRing": makeChildAppender(writePrimitiveGeometry)
});
function writeBoundaryIs(node, linearRing, objectStack) {
  const context = {
    node
  };
  pushSerializeAndPop(context, BOUNDARY_IS_SERIALIZERS, LINEAR_RING_NODE_FACTORY, [linearRing], objectStack);
}
var PLACEMARK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "ExtendedData": makeChildAppender(writeExtendedData),
  "MultiGeometry": makeChildAppender(writeMultiGeometry),
  "LineString": makeChildAppender(writePrimitiveGeometry),
  "LinearRing": makeChildAppender(writePrimitiveGeometry),
  "Point": makeChildAppender(writePrimitiveGeometry),
  "Polygon": makeChildAppender(writePolygon),
  "Style": makeChildAppender(writeStyle),
  "address": makeChildAppender(writeStringTextNode),
  "description": makeChildAppender(writeStringTextNode),
  "name": makeChildAppender(writeStringTextNode),
  "open": makeChildAppender(writeBooleanTextNode),
  "phoneNumber": makeChildAppender(writeStringTextNode),
  "styleUrl": makeChildAppender(writeStringTextNode),
  "visibility": makeChildAppender(writeBooleanTextNode)
});
var PLACEMARK_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["name", "open", "visibility", "address", "phoneNumber", "description", "styleUrl", "Style"]);
var EXTENDEDDATA_NODE_FACTORY = makeSimpleNodeFactory("ExtendedData");
function writePlacemark(node, feature, objectStack) {
  const context = {
    node
  };
  if (feature.getId()) {
    node.setAttribute(
      "id",
      /** @type {string} */
      feature.getId()
    );
  }
  const properties = feature.getProperties();
  const filter = {
    "address": 1,
    "description": 1,
    "name": 1,
    "open": 1,
    "phoneNumber": 1,
    "styleUrl": 1,
    "visibility": 1
  };
  filter[feature.getGeometryName()] = 1;
  const keys = Object.keys(properties || {}).sort().filter(function(v2) {
    return !filter[v2];
  });
  const styleFunction = feature.getStyleFunction();
  if (styleFunction) {
    const styles = styleFunction(feature, 0);
    if (styles) {
      const styleArray = Array.isArray(styles) ? styles : [styles];
      let pointStyles = styleArray;
      if (feature.getGeometry()) {
        pointStyles = styleArray.filter(function(style) {
          const geometry2 = style.getGeometryFunction()(feature);
          if (geometry2) {
            const type = geometry2.getType();
            if (type === "GeometryCollection") {
              return (
                /** @type {GeometryCollection} */
                geometry2.getGeometriesArrayRecursive().filter(function(geometry3) {
                  const type2 = geometry3.getType();
                  return type2 === "Point" || type2 === "MultiPoint";
                }).length
              );
            }
            return type === "Point" || type === "MultiPoint";
          }
        });
        "Point";
      }
      if (this.writeStyles_) {
        let lineStyles = styleArray;
        let polyStyles = styleArray;
        if (feature.getGeometry()) {
          lineStyles = styleArray.filter(function(style) {
            const geometry2 = style.getGeometryFunction()(feature);
            if (geometry2) {
              const type = geometry2.getType();
              if (type === "GeometryCollection") {
                return (
                  /** @type {GeometryCollection} */
                  geometry2.getGeometriesArrayRecursive().filter(function(geometry3) {
                    const type2 = geometry3.getType();
                    return type2 === "LineString" || type2 === "MultiLineString";
                  }).length
                );
              }
              return type === "LineString" || type === "MultiLineString";
            }
          });
          polyStyles = styleArray.filter(function(style) {
            const geometry2 = style.getGeometryFunction()(feature);
            if (geometry2) {
              const type = geometry2.getType();
              if (type === "GeometryCollection") {
                return (
                  /** @type {GeometryCollection} */
                  geometry2.getGeometriesArrayRecursive().filter(function(geometry3) {
                    const type2 = geometry3.getType();
                    return type2 === "Polygon" || type2 === "MultiPolygon";
                  }).length
                );
              }
              return type === "Polygon" || type === "MultiPolygon";
            }
          });
        }
        properties["Style"] = {
          pointStyles,
          lineStyles,
          polyStyles
        };
      }
      if (pointStyles.length && properties["name"] === void 0) {
        const textStyle = pointStyles[0].getText();
        if (textStyle) {
          properties["name"] = textStyle.getText();
        }
      }
    }
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = PLACEMARK_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
  if (keys.length > 0) {
    const sequence = makeSequence(properties, keys);
    const namesAndValues = {
      names: keys,
      values: sequence
    };
    pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, EXTENDEDDATA_NODE_FACTORY, [namesAndValues], objectStack);
  }
  const options = (
    /** @type {import("./Feature.js").WriteOptions} */
    objectStack[0]
  );
  let geometry = feature.getGeometry();
  if (geometry) {
    geometry = transformGeometryWithOptions(geometry, true, options);
  }
  pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, GEOMETRY_NODE_FACTORY, [geometry], objectStack);
}
var PRIMITIVE_GEOMETRY_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["extrude", "tessellate", "altitudeMode", "coordinates"]);
var PRIMITIVE_GEOMETRY_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "extrude": makeChildAppender(writeBooleanTextNode),
  "tessellate": makeChildAppender(writeBooleanTextNode),
  "altitudeMode": makeChildAppender(writeStringTextNode),
  "coordinates": makeChildAppender(writeCoordinatesTextNode)
});
function writePrimitiveGeometry(node, geometry, objectStack) {
  const flatCoordinates = geometry.getFlatCoordinates();
  const context = {
    node
  };
  context["layout"] = geometry.getLayout();
  context["stride"] = geometry.getStride();
  const properties = geometry.getProperties();
  properties.coordinates = flatCoordinates;
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = PRIMITIVE_GEOMETRY_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, PRIMITIVE_GEOMETRY_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
var POLY_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["color", "fill", "outline"]);
var POLYGON_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "outerBoundaryIs": makeChildAppender(writeBoundaryIs),
  "innerBoundaryIs": makeChildAppender(writeBoundaryIs)
});
var INNER_BOUNDARY_NODE_FACTORY = makeSimpleNodeFactory("innerBoundaryIs");
var OUTER_BOUNDARY_NODE_FACTORY = makeSimpleNodeFactory("outerBoundaryIs");
function writePolygon(node, polygon, objectStack) {
  const linearRings = polygon.getLinearRings();
  const outerRing = linearRings.shift();
  const context = {
    node
  };
  pushSerializeAndPop(context, POLYGON_SERIALIZERS, INNER_BOUNDARY_NODE_FACTORY, linearRings, objectStack);
  pushSerializeAndPop(context, POLYGON_SERIALIZERS, OUTER_BOUNDARY_NODE_FACTORY, [outerRing], objectStack);
}
var POLY_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "color": makeChildAppender(writeColorTextNode),
  "fill": makeChildAppender(writeBooleanTextNode),
  "outline": makeChildAppender(writeBooleanTextNode)
});
function writePolyStyle(node, style, objectStack) {
  const context = {
    node
  };
  const fill = style.getFill();
  const stroke = style.getStroke();
  const properties = {
    "color": fill ? fill.getColor() : void 0,
    "fill": fill ? void 0 : false,
    "outline": stroke ? void 0 : false
  };
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = POLY_STYLE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, POLY_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
function writeScaleTextNode(node, scale) {
  writeDecimalTextNode(node, Math.round(scale * 1e6) / 1e6);
}
var STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS2, ["IconStyle", "LabelStyle", "LineStyle", "PolyStyle"]);
var STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS2, {
  "IconStyle": makeChildAppender(writeIconStyle),
  "LabelStyle": makeChildAppender(writeLabelStyle),
  "LineStyle": makeChildAppender(writeLineStyle),
  "PolyStyle": makeChildAppender(writePolyStyle)
});
function writeStyle(node, styles, objectStack) {
  const context = {
    node
  };
  const properties = {};
  if (styles.pointStyles.length) {
    const textStyle = styles.pointStyles[0].getText();
    if (textStyle) {
      properties["LabelStyle"] = textStyle;
    }
    const imageStyle = styles.pointStyles[0].getImage();
    if (imageStyle && typeof /** @type {?} */
    imageStyle.getSrc === "function") {
      properties["IconStyle"] = imageStyle;
    }
  }
  if (styles.lineStyles.length) {
    const strokeStyle = styles.lineStyles[0].getStroke();
    if (strokeStyle) {
      properties["LineStyle"] = strokeStyle;
    }
  }
  if (styles.polyStyles.length) {
    const strokeStyle = styles.polyStyles[0].getStroke();
    if (strokeStyle && !properties["LineStyle"]) {
      properties["LineStyle"] = strokeStyle;
    }
    properties["PolyStyle"] = styles.polyStyles[0];
  }
  const parentNode = objectStack[objectStack.length - 1].node;
  const orderedKeys = STYLE_SEQUENCE[parentNode.namespaceURI];
  const values = makeSequence(properties, orderedKeys);
  pushSerializeAndPop(context, STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
function writeVec2(node, vec2) {
  node.setAttribute("x", String(vec2.x));
  node.setAttribute("y", String(vec2.y));
  node.setAttribute("xunits", vec2.xunits);
  node.setAttribute("yunits", vec2.yunits);
}

// ../../node_modules/ol/format/GML32.js
var GML32 = class extends GML3_default {
  /**
   * @param {import("./GMLBase.js").Options} [options] Optional configuration object.
   */
  constructor(options) {
    options = options ? options : {};
    super(options);
    this.schemaLocation = options.schemaLocation ? options.schemaLocation : this.namespace + " http://schemas.opengis.net/gml/3.2.1/gml.xsd";
  }
  /**
   * @param {Node} node Node.
   * @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
   * @param {Array<*>} objectStack Node stack.
   * @override
   */
  writeGeometryElement(node, geometry, objectStack) {
    const context = objectStack[objectStack.length - 1];
    objectStack[objectStack.length - 1] = Object.assign({
      multiCurve: true,
      multiSurface: true
    }, context);
    super.writeGeometryElement(node, geometry, objectStack);
  }
};
GML32.prototype.namespace = "http://www.opengis.net/gml/3.2";
GML32.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "pos": makeReplacer(GML3_default.prototype.readFlatPos),
    "posList": makeReplacer(GML3_default.prototype.readFlatPosList),
    "coordinates": makeReplacer(GML2_default.prototype.readFlatCoordinates)
  }
};
GML32.prototype.FLAT_LINEAR_RINGS_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "interior": GML3_default.prototype.interiorParser,
    "exterior": GML3_default.prototype.exteriorParser
  }
};
GML32.prototype.GEOMETRY_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "Point": makeReplacer(GMLBase_default.prototype.readPoint),
    "MultiPoint": makeReplacer(GMLBase_default.prototype.readMultiPoint),
    "LineString": makeReplacer(GMLBase_default.prototype.readLineString),
    "MultiLineString": makeReplacer(GMLBase_default.prototype.readMultiLineString),
    "LinearRing": makeReplacer(GMLBase_default.prototype.readLinearRing),
    "Polygon": makeReplacer(GMLBase_default.prototype.readPolygon),
    "MultiPolygon": makeReplacer(GMLBase_default.prototype.readMultiPolygon),
    "Surface": makeReplacer(GML32.prototype.readSurface),
    "MultiSurface": makeReplacer(GML3_default.prototype.readMultiSurface),
    "Curve": makeReplacer(GML32.prototype.readCurve),
    "MultiCurve": makeReplacer(GML3_default.prototype.readMultiCurve),
    "Envelope": makeReplacer(GML32.prototype.readEnvelope)
  }
};
GML32.prototype.MULTICURVE_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "curveMember": makeArrayPusher(GML3_default.prototype.curveMemberParser),
    "curveMembers": makeArrayPusher(GML3_default.prototype.curveMemberParser)
  }
};
GML32.prototype.MULTISURFACE_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "surfaceMember": makeArrayPusher(GML3_default.prototype.surfaceMemberParser),
    "surfaceMembers": makeArrayPusher(GML3_default.prototype.surfaceMemberParser)
  }
};
GML32.prototype.CURVEMEMBER_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "LineString": makeArrayPusher(GMLBase_default.prototype.readLineString),
    "Curve": makeArrayPusher(GML3_default.prototype.readCurve)
  }
};
GML32.prototype.SURFACEMEMBER_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "Polygon": makeArrayPusher(GMLBase_default.prototype.readPolygon),
    "Surface": makeArrayPusher(GML3_default.prototype.readSurface)
  }
};
GML32.prototype.SURFACE_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "patches": makeReplacer(GML3_default.prototype.readPatch)
  }
};
GML32.prototype.CURVE_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "segments": makeReplacer(GML3_default.prototype.readSegment)
  }
};
GML32.prototype.ENVELOPE_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "lowerCorner": makeArrayPusher(GML3_default.prototype.readFlatPosList),
    "upperCorner": makeArrayPusher(GML3_default.prototype.readFlatPosList)
  }
};
GML32.prototype.PATCHES_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "PolygonPatch": makeReplacer(GML3_default.prototype.readPolygonPatch)
  }
};
GML32.prototype.SEGMENTS_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "LineStringSegment": makeArrayExtender(GML3_default.prototype.readLineStringSegment)
  }
};
GML32.prototype.MULTIPOINT_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "pointMember": makeArrayPusher(GMLBase_default.prototype.pointMemberParser),
    "pointMembers": makeArrayPusher(GMLBase_default.prototype.pointMemberParser)
  }
};
GML32.prototype.MULTILINESTRING_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "lineStringMember": makeArrayPusher(GMLBase_default.prototype.lineStringMemberParser),
    "lineStringMembers": makeArrayPusher(GMLBase_default.prototype.lineStringMemberParser)
  }
};
GML32.prototype.MULTIPOLYGON_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "polygonMember": makeArrayPusher(GMLBase_default.prototype.polygonMemberParser),
    "polygonMembers": makeArrayPusher(GMLBase_default.prototype.polygonMemberParser)
  }
};
GML32.prototype.POINTMEMBER_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "Point": makeArrayPusher(GMLBase_default.prototype.readFlatCoordinatesFromNode)
  }
};
GML32.prototype.LINESTRINGMEMBER_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "LineString": makeArrayPusher(GMLBase_default.prototype.readLineString)
  }
};
GML32.prototype.POLYGONMEMBER_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "Polygon": makeArrayPusher(GMLBase_default.prototype.readPolygon)
  }
};
GML32.prototype.RING_PARSERS = {
  "http://www.opengis.net/gml/3.2": {
    "LinearRing": makeReplacer(GMLBase_default.prototype.readFlatLinearRing),
    "Ring": makeReplacer(GML32.prototype.readFlatCurveRing)
  }
};
GML32.prototype.RING_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "exterior": makeChildAppender(GML3_default.prototype.writeRing),
    "interior": makeChildAppender(GML3_default.prototype.writeRing)
  }
};
GML32.prototype.ENVELOPE_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "lowerCorner": makeChildAppender(writeStringTextNode),
    "upperCorner": makeChildAppender(writeStringTextNode)
  }
};
GML32.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "surfaceMember": makeChildAppender(GML3_default.prototype.writeSurfaceOrPolygonMember),
    "polygonMember": makeChildAppender(GML3_default.prototype.writeSurfaceOrPolygonMember)
  }
};
GML32.prototype.POINTMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "pointMember": makeChildAppender(GML3_default.prototype.writePointMember)
  }
};
GML32.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "lineStringMember": makeChildAppender(GML3_default.prototype.writeLineStringOrCurveMember),
    "curveMember": makeChildAppender(GML3_default.prototype.writeLineStringOrCurveMember)
  }
};
GML32.prototype.GEOMETRY_SERIALIZERS = {
  "http://www.opengis.net/gml/3.2": {
    "Curve": makeChildAppender(GML3_default.prototype.writeCurveOrLineString),
    "MultiCurve": makeChildAppender(GML3_default.prototype.writeMultiCurveOrLineString),
    "Point": makeChildAppender(GML32.prototype.writePoint),
    "MultiPoint": makeChildAppender(GML3_default.prototype.writeMultiPoint),
    "LineString": makeChildAppender(GML3_default.prototype.writeCurveOrLineString),
    "MultiLineString": makeChildAppender(GML3_default.prototype.writeMultiCurveOrLineString),
    "LinearRing": makeChildAppender(GML3_default.prototype.writeLinearRing),
    "Polygon": makeChildAppender(GML3_default.prototype.writeSurfaceOrPolygon),
    "MultiPolygon": makeChildAppender(GML3_default.prototype.writeMultiSurfaceOrPolygon),
    "Surface": makeChildAppender(GML3_default.prototype.writeSurfaceOrPolygon),
    "MultiSurface": makeChildAppender(GML3_default.prototype.writeMultiSurfaceOrPolygon),
    "Envelope": makeChildAppender(GML3_default.prototype.writeEnvelope)
  }
};
var GML32_default = GML32;

// ../../node_modules/ol/format/WFS.js
var FEATURE_COLLECTION_PARSERS = {
  "http://www.opengis.net/gml": {
    "boundedBy": makeObjectPropertySetter(GMLBase_default.prototype.readExtentElement, "bounds")
  },
  "http://www.opengis.net/wfs/2.0": {
    "member": makeArrayPusher(GMLBase_default.prototype.readFeaturesInternal)
  }
};
var TRANSACTION_SUMMARY_PARSERS = {
  "http://www.opengis.net/wfs": {
    "totalInserted": makeObjectPropertySetter(readPositiveInteger),
    "totalUpdated": makeObjectPropertySetter(readPositiveInteger),
    "totalDeleted": makeObjectPropertySetter(readPositiveInteger)
  },
  "http://www.opengis.net/wfs/2.0": {
    "totalInserted": makeObjectPropertySetter(readPositiveInteger),
    "totalUpdated": makeObjectPropertySetter(readPositiveInteger),
    "totalDeleted": makeObjectPropertySetter(readPositiveInteger)
  }
};
var TRANSACTION_RESPONSE_PARSERS = {
  "http://www.opengis.net/wfs": {
    "TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
    "InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
  },
  "http://www.opengis.net/wfs/2.0": {
    "TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
    "InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
  }
};
var QUERY_SERIALIZERS = {
  "http://www.opengis.net/wfs": {
    "PropertyName": makeChildAppender(writeStringTextNode)
  },
  "http://www.opengis.net/wfs/2.0": {
    "PropertyName": makeChildAppender(writeStringTextNode)
  }
};
var TRANSACTION_SERIALIZERS = {
  "http://www.opengis.net/wfs": {
    "Insert": makeChildAppender(writeFeature),
    "Update": makeChildAppender(writeUpdate),
    "Delete": makeChildAppender(writeDelete),
    "Property": makeChildAppender(writeProperty),
    "Native": makeChildAppender(writeNative)
  },
  "http://www.opengis.net/wfs/2.0": {
    "Insert": makeChildAppender(writeFeature),
    "Update": makeChildAppender(writeUpdate),
    "Delete": makeChildAppender(writeDelete),
    "Property": makeChildAppender(writeProperty),
    "Native": makeChildAppender(writeNative)
  }
};
var FEATURE_PREFIX = "feature";
var XMLNS = "http://www.w3.org/2000/xmlns/";
var OGCNS = {
  "2.0.0": "http://www.opengis.net/ogc/1.1",
  "1.1.0": "http://www.opengis.net/ogc",
  "1.0.0": "http://www.opengis.net/ogc"
};
var WFSNS = {
  "2.0.0": "http://www.opengis.net/wfs/2.0",
  "1.1.0": "http://www.opengis.net/wfs",
  "1.0.0": "http://www.opengis.net/wfs"
};
var FESNS = {
  "2.0.0": "http://www.opengis.net/fes/2.0",
  "1.1.0": "http://www.opengis.net/fes",
  "1.0.0": "http://www.opengis.net/fes"
};
var GML_FORMATS = {
  "2.0.0": GML32_default,
  "1.1.0": GML3_default,
  "1.0.0": GML2_default
};
function readTransactionSummary(node, objectStack) {
  return pushParseAndPop({}, TRANSACTION_SUMMARY_PARSERS, node, objectStack);
}
var OGC_FID_PARSERS = {
  "http://www.opengis.net/ogc": {
    "FeatureId": makeArrayPusher(function(node, objectStack) {
      return node.getAttribute("fid");
    })
  },
  "http://www.opengis.net/ogc/1.1": {
    "FeatureId": makeArrayPusher(function(node, objectStack) {
      return node.getAttribute("fid");
    })
  }
};
function fidParser(node, objectStack) {
  parseNode(OGC_FID_PARSERS, node, objectStack);
}
var INSERT_RESULTS_PARSERS = {
  "http://www.opengis.net/wfs": {
    "Feature": fidParser
  },
  "http://www.opengis.net/wfs/2.0": {
    "Feature": fidParser
  }
};
function readInsertResults(node, objectStack) {
  return pushParseAndPop([], INSERT_RESULTS_PARSERS, node, objectStack);
}
function writeFeature(node, feature, objectStack) {
  const context = objectStack[objectStack.length - 1];
  const featureType = context["featureType"];
  const featureNS = context["featureNS"];
  const gmlVersion = context["gmlVersion"];
  const child = createElementNS(featureNS, featureType);
  node.appendChild(child);
  if (gmlVersion === 2) {
    GML2_default.prototype.writeFeatureElement(child, feature, objectStack);
  } else if (gmlVersion === 3) {
    GML3_default.prototype.writeFeatureElement(child, feature, objectStack);
  } else {
    GML32_default.prototype.writeFeatureElement(child, feature, objectStack);
  }
}
function writeOgcFidFilter(node, fid, objectStack) {
  const context = objectStack[objectStack.length - 1];
  const version = context["version"];
  const ns = OGCNS[version];
  const filter = createElementNS(ns, "Filter");
  const child = createElementNS(ns, "FeatureId");
  filter.appendChild(child);
  child.setAttribute(
    "fid",
    /** @type {string} */
    fid
  );
  node.appendChild(filter);
}
function getTypeName(featurePrefix, featureType) {
  featurePrefix = featurePrefix ? featurePrefix : FEATURE_PREFIX;
  const prefix = featurePrefix + ":";
  if (featureType.startsWith(prefix)) {
    return featureType;
  }
  return prefix + featureType;
}
function writeDelete(node, feature, objectStack) {
  const context = objectStack[objectStack.length - 1];
  assert(feature.getId() !== void 0, "Features must have an id set");
  const featureType = context["featureType"];
  const featurePrefix = context["featurePrefix"];
  const featureNS = context["featureNS"];
  const typeName = getTypeName(featurePrefix, featureType);
  node.setAttribute("typeName", typeName);
  node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
  const fid = feature.getId();
  if (fid !== void 0) {
    writeOgcFidFilter(node, fid, objectStack);
  }
}
function writeUpdate(node, feature, objectStack) {
  const context = objectStack[objectStack.length - 1];
  assert(feature.getId() !== void 0, "Features must have an id set");
  const version = context["version"];
  const featureType = context["featureType"];
  const featurePrefix = context["featurePrefix"];
  const featureNS = context["featureNS"];
  const typeName = getTypeName(featurePrefix, featureType);
  const geometryName = feature.getGeometryName();
  node.setAttribute("typeName", typeName);
  node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
  const fid = feature.getId();
  if (fid !== void 0) {
    const keys = feature.getKeys();
    const values = [];
    for (let i = 0, ii = keys.length; i < ii; i++) {
      const value = feature.get(keys[i]);
      if (value !== void 0) {
        let name = keys[i];
        if (value && typeof /** @type {?} */
        value.getSimplifiedGeometry === "function") {
          name = geometryName;
        }
        values.push({
          name,
          value
        });
      }
    }
    pushSerializeAndPop(
      /** @type {import("../xml.js").NodeStackItem} */
      {
        version,
        "gmlVersion": context["gmlVersion"],
        node,
        "hasZ": context["hasZ"],
        "srsName": context["srsName"]
      },
      TRANSACTION_SERIALIZERS,
      makeSimpleNodeFactory("Property"),
      values,
      objectStack
    );
    writeOgcFidFilter(node, fid, objectStack);
  }
}
function writeProperty(node, pair, objectStack) {
  const context = objectStack[objectStack.length - 1];
  const version = context["version"];
  const ns = WFSNS[version];
  const tagName = version === "2.0.0" ? "ValueReference" : "Name";
  const name = createElementNS(ns, tagName);
  const gmlVersion = context["gmlVersion"];
  node.appendChild(name);
  writeStringTextNode(name, pair.name);
  if (pair.value !== void 0 && pair.value !== null) {
    const value = createElementNS(ns, "Value");
    node.appendChild(value);
    if (pair.value && typeof /** @type {?} */
    pair.value.getSimplifiedGeometry === "function") {
      if (gmlVersion === 2) {
        GML2_default.prototype.writeGeometryElement(value, pair.value, objectStack);
      } else if (gmlVersion === 3) {
        GML3_default.prototype.writeGeometryElement(value, pair.value, objectStack);
      } else {
        GML32_default.prototype.writeGeometryElement(value, pair.value, objectStack);
      }
    } else {
      writeStringTextNode(value, pair.value);
    }
  }
}
function writeNative(node, nativeElement, objectStack) {
  if (nativeElement.vendorId) {
    node.setAttribute("vendorId", nativeElement.vendorId);
  }
  if (nativeElement.safeToIgnore !== void 0) {
    node.setAttribute("safeToIgnore", String(nativeElement.safeToIgnore));
  }
  if (nativeElement.value !== void 0) {
    writeStringTextNode(node, nativeElement.value);
  }
}
var GETFEATURE_SERIALIZERS = {
  "http://www.opengis.net/wfs": {
    "Query": makeChildAppender(writeQuery)
  },
  "http://www.opengis.net/wfs/2.0": {
    "Query": makeChildAppender(writeQuery)
  },
  "http://www.opengis.net/ogc": {
    "During": makeChildAppender(writeDuringFilter),
    "And": makeChildAppender(writeLogicalFilter),
    "Or": makeChildAppender(writeLogicalFilter),
    "Not": makeChildAppender(writeNotFilter),
    "BBOX": makeChildAppender(writeBboxFilter),
    "Contains": makeChildAppender(writeSpatialFilter),
    "Intersects": makeChildAppender(writeSpatialFilter),
    "Within": makeChildAppender(writeSpatialFilter),
    "DWithin": makeChildAppender(writeDWithinFilter),
    "PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
    "PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
    "PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsNull": makeChildAppender(writeIsNullFilter),
    "PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
    "PropertyIsLike": makeChildAppender(writeIsLikeFilter)
  },
  "http://www.opengis.net/fes/2.0": {
    "During": makeChildAppender(writeDuringFilter),
    "And": makeChildAppender(writeLogicalFilter),
    "Or": makeChildAppender(writeLogicalFilter),
    "Not": makeChildAppender(writeNotFilter),
    "BBOX": makeChildAppender(writeBboxFilter),
    "Contains": makeChildAppender(writeSpatialFilter),
    "Disjoint": makeChildAppender(writeSpatialFilter),
    "Intersects": makeChildAppender(writeSpatialFilter),
    "ResourceId": makeChildAppender(writeResourceIdFilter),
    "Within": makeChildAppender(writeSpatialFilter),
    "DWithin": makeChildAppender(writeDWithinFilter),
    "PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
    "PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
    "PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
    "PropertyIsNull": makeChildAppender(writeIsNullFilter),
    "PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
    "PropertyIsLike": makeChildAppender(writeIsLikeFilter)
  }
};
function writeQuery(node, featureType, objectStack) {
  const context = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const version = context["version"];
  const featurePrefix = context["featurePrefix"];
  const featureNS = context["featureNS"];
  const propertyNames = context["propertyNames"];
  const srsName = context["srsName"];
  let typeName;
  if (featurePrefix) {
    typeName = getTypeName(featurePrefix, featureType);
  } else {
    typeName = featureType;
  }
  let typeNameAttr;
  if (version === "2.0.0") {
    typeNameAttr = "typeNames";
  } else {
    typeNameAttr = "typeName";
  }
  node.setAttribute(typeNameAttr, typeName);
  if (srsName) {
    node.setAttribute("srsName", srsName);
  }
  if (featureNS) {
    node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
  }
  const item = (
    /** @type {import("../xml.js").NodeStackItem} */
    Object.assign({}, context)
  );
  item.node = node;
  pushSerializeAndPop(item, QUERY_SERIALIZERS, makeSimpleNodeFactory("PropertyName"), propertyNames, objectStack);
  const filter = context["filter"];
  if (filter) {
    const child = createElementNS(getFilterNS(version), "Filter");
    node.appendChild(child);
    writeFilterCondition(child, filter, objectStack);
  }
}
function writeFilterCondition(node, filter, objectStack) {
  const context = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const item = {
    node
  };
  Object.assign(item, {
    context
  });
  pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(filter.getTagName()), [filter], objectStack);
}
function writeBboxFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  parent["srsName"] = filter.srsName;
  const format = GML_FORMATS[version];
  writePropertyName(version, node, filter.geometryName);
  format.prototype.writeGeometryElement(node, filter.extent, objectStack);
}
function writeResourceIdFilter(node, filter, objectStack) {
  node.setAttribute(
    "rid",
    /** @type {string} */
    filter.rid
  );
}
function writeSpatialFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  parent["srsName"] = filter.srsName;
  const format = GML_FORMATS[version];
  writePropertyName(version, node, filter.geometryName);
  format.prototype.writeGeometryElement(node, filter.geometry, objectStack);
}
function writeDWithinFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  writeSpatialFilter(node, filter, objectStack);
  const distance = createElementNS(getFilterNS(version), "Distance");
  writeStringTextNode(distance, filter.distance.toString());
  if (version === "2.0.0") {
    distance.setAttribute("uom", filter.unit);
  } else {
    distance.setAttribute("units", filter.unit);
  }
  node.appendChild(distance);
}
function writeDuringFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  writeExpression(FESNS[version], "ValueReference", node, filter.propertyName);
  const timePeriod = createElementNS(GMLNS, "TimePeriod");
  node.appendChild(timePeriod);
  const begin = createElementNS(GMLNS, "begin");
  timePeriod.appendChild(begin);
  writeTimeInstant(begin, filter.begin);
  const end = createElementNS(GMLNS, "end");
  timePeriod.appendChild(end);
  writeTimeInstant(end, filter.end);
}
function writeLogicalFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const item = {
    node
  };
  Object.assign(item, {
    context
  });
  const conditions = filter.conditions;
  for (let i = 0, ii = conditions.length; i < ii; ++i) {
    const condition = conditions[i];
    pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
  }
}
function writeNotFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const item = {
    node
  };
  Object.assign(item, {
    context
  });
  const condition = filter.condition;
  pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
}
function writeComparisonFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  if (filter.matchCase !== void 0) {
    node.setAttribute("matchCase", filter.matchCase.toString());
  }
  writePropertyName(version, node, filter.propertyName);
  writeLiteral(version, node, "" + filter.expression);
}
function writeIsNullFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  writePropertyName(version, node, filter.propertyName);
}
function writeIsBetweenFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  const ns = getFilterNS(version);
  writePropertyName(version, node, filter.propertyName);
  const lowerBoundary = createElementNS(ns, "LowerBoundary");
  node.appendChild(lowerBoundary);
  writeLiteral(version, lowerBoundary, "" + filter.lowerBoundary);
  const upperBoundary = createElementNS(ns, "UpperBoundary");
  node.appendChild(upperBoundary);
  writeLiteral(version, upperBoundary, "" + filter.upperBoundary);
}
function writeIsLikeFilter(node, filter, objectStack) {
  const parent = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  const context = parent["context"];
  const version = context["version"];
  node.setAttribute("wildCard", filter.wildCard);
  node.setAttribute("singleChar", filter.singleChar);
  node.setAttribute("escapeChar", filter.escapeChar);
  if (filter.matchCase !== void 0) {
    node.setAttribute("matchCase", filter.matchCase.toString());
  }
  writePropertyName(version, node, filter.propertyName);
  writeLiteral(version, node, "" + filter.pattern);
}
function writeExpression(ns, tagName, node, value) {
  const property = createElementNS(ns, tagName);
  writeStringTextNode(property, value);
  node.appendChild(property);
}
function writeLiteral(version, node, value) {
  writeExpression(getFilterNS(version), "Literal", node, value);
}
function writePropertyName(version, node, value) {
  if (version === "2.0.0") {
    writeExpression(FESNS[version], "ValueReference", node, value);
  } else {
    writeExpression(OGCNS[version], "PropertyName", node, value);
  }
}
function writeTimeInstant(node, time) {
  const timeInstant = createElementNS(GMLNS, "TimeInstant");
  node.appendChild(timeInstant);
  const timePosition = createElementNS(GMLNS, "timePosition");
  timeInstant.appendChild(timePosition);
  writeStringTextNode(timePosition, time);
}
function getFilterNS(version) {
  let ns;
  if (version === "2.0.0") {
    ns = FESNS[version];
  } else {
    ns = OGCNS[version];
  }
  return ns;
}

// node_modules/pmtiles/dist/esm/index.js
var z = Object.defineProperty;
var b = Math.pow;
var l = (i, e) => z(i, "name", {
  value: e,
  configurable: true
});
var m = (i, e, t) => new Promise((r, n) => {
  var s = (u) => {
    try {
      a(t.next(u));
    } catch (c) {
      n(c);
    }
  }, o = (u) => {
    try {
      a(t.throw(u));
    } catch (c) {
      n(c);
    }
  }, a = (u) => u.done ? r(u.value) : Promise.resolve(u.value).then(s, o);
  a((t = t.apply(i, e)).next());
});
var re = l((i, e) => {
  let t = false, r = "", n = L.GridLayer.extend({
    createTile: l((s, o) => {
      let a = document.createElement("img"), u = new AbortController(), c = u.signal;
      return a.cancel = () => {
        u.abort();
      }, t || (i.getHeader().then((d) => {
        d.tileType === 1 ? console.error("Error: archive contains MVT vector tiles, but leafletRasterLayer is for displaying raster tiles. See https://github.com/protomaps/PMTiles/tree/main/js for details.") : d.tileType === 2 ? r = "image/png" : d.tileType === 3 ? r = "image/jpeg" : d.tileType === 4 ? r = "image/webp" : d.tileType === 5 && (r = "image/avif");
      }), t = true), i.getZxy(s.z, s.x, s.y, c).then((d) => {
        if (d) {
          let h = new Blob([d.data], {
            type: r
          }), p = window.URL.createObjectURL(h);
          a.src = p, a.cancel = void 0, o(void 0, a);
        }
      }).catch((d) => {
        if (d.name !== "AbortError") throw d;
      }), a;
    }, "createTile"),
    _removeTile: l(function(s) {
      let o = this._tiles[s];
      o && (o.el.cancel && o.el.cancel(), o.el.width = 0, o.el.height = 0, o.el.deleted = true, L.DomUtil.remove(o.el), delete this._tiles[s], this.fire("tileunload", {
        tile: o.el,
        coords: this._keyToTileCoords(s)
      }));
    }, "_removeTile")
  });
  return new n(e);
}, "leafletRasterLayer");
var j = l((i) => (e, t) => {
  if (t instanceof AbortController) return i(e, t);
  let r = new AbortController();
  return i(e, r).then((n) => t(void 0, n.data, n.cacheControl || "", n.expires || ""), (n) => t(n)).catch((n) => t(n)), {
    cancel: l(() => r.abort(), "cancel")
  };
}, "v3compat");
var T = class T2 {
  constructor(e) {
    this.tilev4 = l((e2, t) => m(this, null, function* () {
      if (e2.type === "json") {
        let p = e2.url.substr(10), y = this.tiles.get(p);
        if (y || (y = new x(p), this.tiles.set(p, y)), this.metadata) return {
          data: yield y.getTileJson(e2.url)
        };
        let f = yield y.getHeader();
        return (f.minLon >= f.maxLon || f.minLat >= f.maxLat) && console.error(`Bounds of PMTiles archive ${f.minLon},${f.minLat},${f.maxLon},${f.maxLat} are not valid.`), {
          data: {
            tiles: [`${e2.url}/{z}/{x}/{y}`],
            minzoom: f.minZoom,
            maxzoom: f.maxZoom,
            bounds: [f.minLon, f.minLat, f.maxLon, f.maxLat]
          }
        };
      }
      let r = new RegExp(/pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/), n = e2.url.match(r);
      if (!n) throw new Error("Invalid PMTiles protocol URL");
      let s = n[1], o = this.tiles.get(s);
      o || (o = new x(s), this.tiles.set(s, o));
      let a = n[2], u = n[3], c = n[4], d = yield o.getHeader(), h = yield o == null ? void 0 : o.getZxy(+a, +u, +c, t.signal);
      if (h) return {
        data: new Uint8Array(h.data),
        cacheControl: h.cacheControl,
        expires: h.expires
      };
      if (d.tileType === 1) {
        if (this.errorOnMissingTile) throw new Error("Tile not found.");
        return {
          data: new Uint8Array()
        };
      }
      return {
        data: null
      };
    }), "tilev4");
    this.tile = j(this.tilev4);
    this.tiles = /* @__PURE__ */ new Map(), this.metadata = (e == null ? void 0 : e.metadata) || false, this.errorOnMissingTile = (e == null ? void 0 : e.errorOnMissingTile) || false;
  }
  add(e) {
    this.tiles.set(e.source.getKey(), e);
  }
  get(e) {
    return this.tiles.get(e);
  }
};
l(T, "Protocol");
function w(i, e) {
  return (e >>> 0) * 4294967296 + (i >>> 0);
}
l(w, "toNum");
function F(i, e) {
  let t = e.buf, r = t[e.pos++], n = (r & 112) >> 4;
  if (r < 128 || (r = t[e.pos++], n |= (r & 127) << 3, r < 128) || (r = t[e.pos++], n |= (r & 127) << 10, r < 128) || (r = t[e.pos++], n |= (r & 127) << 17, r < 128) || (r = t[e.pos++], n |= (r & 127) << 24, r < 128) || (r = t[e.pos++], n |= (r & 1) << 31, r < 128)) return w(i, n);
  throw new Error("Expected varint not more than 10 bytes");
}
l(F, "readVarintRemainder");
function v(i) {
  let e = i.buf, t = e[i.pos++], r = t & 127;
  return t < 128 || (t = e[i.pos++], r |= (t & 127) << 7, t < 128) || (t = e[i.pos++], r |= (t & 127) << 14, t < 128) || (t = e[i.pos++], r |= (t & 127) << 21, t < 128) ? r : (t = e[i.pos], r |= (t & 15) << 28, F(r, i));
}
l(v, "readVarint");
function k(i, e, t, r) {
  if (r === 0) {
    t === 1 && (e[0] = i - 1 - e[0], e[1] = i - 1 - e[1]);
    let n = e[0];
    e[0] = e[1], e[1] = n;
  }
}
l(k, "rotate");
function N(i, e) {
  let t = b(2, i), r = e, n = e, s = e, o = [0, 0], a = 1;
  for (; a < t; ) r = 1 & s / 2, n = 1 & (s ^ r), k(a, o, r, n), o[0] += a * r, o[1] += a * n, s = s / 4, a *= 2;
  return [i, o[0], o[1]];
}
l(N, "idOnLevel");
var q = [0, 1, 5, 21, 85, 341, 1365, 5461, 21845, 87381, 349525, 1398101, 5592405, 22369621, 89478485, 357913941, 1431655765, 5726623061, 22906492245, 91625968981, 366503875925, 1466015503701, 5864062014805, 23456248059221, 93824992236885, 375299968947541, 1501199875790165];
function G(i, e, t) {
  if (i > 26) throw new Error("Tile zoom level exceeds max safe number limit (26)");
  if (e > b(2, i) - 1 || t > b(2, i) - 1) throw new Error("tile x/y outside zoom level bounds");
  let r = q[i], n = b(2, i), s = 0, o = 0, a = 0, u = [e, t], c = n / 2;
  for (; c > 0; ) s = (u[0] & c) > 0 ? 1 : 0, o = (u[1] & c) > 0 ? 1 : 0, a += c * c * (3 * s ^ o), k(c, u, s, o), c = c / 2;
  return r + a;
}
l(G, "zxyToTileId");
function ie(i) {
  let e = 0, t = 0;
  for (let r = 0; r < 27; r++) {
    let n = (1 << r) * (1 << r);
    if (e + n > i) return N(r, i - e);
    e += n;
  }
  throw new Error("Tile zoom level exceeds max safe number limit (26)");
}
l(ie, "tileIdToZxy");
var J = ((s) => (s[s.Unknown = 0] = "Unknown", s[s.None = 1] = "None", s[s.Gzip = 2] = "Gzip", s[s.Brotli = 3] = "Brotli", s[s.Zstd = 4] = "Zstd", s))(J || {});
function D(i, e) {
  return m(this, null, function* () {
    if (e === 1 || e === 0) return i;
    if (e === 2) {
      if (typeof globalThis.DecompressionStream == "undefined") return decompressSync(new Uint8Array(i));
      let t = new Response(i).body;
      if (!t) throw new Error("Failed to read response stream");
      let r = t.pipeThrough(new globalThis.DecompressionStream("gzip"));
      return new Response(r).arrayBuffer();
    }
    throw new Error("Compression method not supported");
  });
}
l(D, "defaultDecompress");
var O = ((o) => (o[o.Unknown = 0] = "Unknown", o[o.Mvt = 1] = "Mvt", o[o.Png = 2] = "Png", o[o.Jpeg = 3] = "Jpeg", o[o.Webp = 4] = "Webp", o[o.Avif = 5] = "Avif", o))(O || {});
function _(i) {
  return i === 1 ? ".mvt" : i === 2 ? ".png" : i === 3 ? ".jpg" : i === 4 ? ".webp" : i === 5 ? ".avif" : "";
}
l(_, "tileTypeExt");
var Y = 127;
function Q(i, e) {
  let t = 0, r = i.length - 1;
  for (; t <= r; ) {
    let n = r + t >> 1, s = e - i[n].tileId;
    if (s > 0) t = n + 1;
    else if (s < 0) r = n - 1;
    else return i[n];
  }
  return r >= 0 && (i[r].runLength === 0 || e - i[r].tileId < i[r].runLength) ? i[r] : null;
}
l(Q, "findTile");
var A = class A2 {
  constructor(e) {
    this.file = e;
  }
  getKey() {
    return this.file.name;
  }
  getBytes(e, t) {
    return m(this, null, function* () {
      return {
        data: yield this.file.slice(e, e + t).arrayBuffer()
      };
    });
  }
};
l(A, "FileSource");
var U = class U2 {
  constructor(e, t = new Headers()) {
    this.url = e, this.customHeaders = t, this.mustReload = false;
    let r = "";
    "navigator" in globalThis && (r = globalThis.navigator.userAgent || "");
    let n = r.indexOf("Windows") > -1, s = /Chrome|Chromium|Edg|OPR|Brave/.test(r);
    this.chromeWindowsNoCache = false, n && s && (this.chromeWindowsNoCache = true);
  }
  getKey() {
    return this.url;
  }
  setHeaders(e) {
    this.customHeaders = e;
  }
  getBytes(e, t, r, n) {
    return m(this, null, function* () {
      let s, o;
      r ? o = r : (s = new AbortController(), o = s.signal);
      let a = new Headers(this.customHeaders);
      a.set("range", `bytes=${e}-${e + t - 1}`);
      let u;
      this.mustReload ? u = "reload" : this.chromeWindowsNoCache && (u = "no-store");
      let c = yield fetch(this.url, {
        signal: o,
        cache: u,
        headers: a
      });
      if (e === 0 && c.status === 416) {
        let y = c.headers.get("Content-Range");
        if (!y || !y.startsWith("bytes */")) throw new Error("Missing content-length on 416 response");
        let f = +y.substr(8);
        c = yield fetch(this.url, {
          signal: o,
          cache: "reload",
          headers: {
            range: `bytes=0-${f - 1}`
          }
        });
      }
      let d = c.headers.get("Etag");
      if (d != null && d.startsWith("W/") && (d = null), c.status === 416 || n && d && d !== n) throw this.mustReload = true, new E(`Server returned non-matching ETag ${n} after one retry. Check browser extensions and servers for issues that may affect correct ETag headers.`);
      if (c.status >= 300) throw new Error(`Bad response code: ${c.status}`);
      let h = c.headers.get("Content-Length");
      if (c.status === 200 && (!h || +h > t)) throw s && s.abort(), new Error("Server returned no content-length header or content-length exceeding request. Check that your storage backend supports HTTP Byte Serving.");
      return {
        data: yield c.arrayBuffer(),
        etag: d || void 0,
        cacheControl: c.headers.get("Cache-Control") || void 0,
        expires: c.headers.get("Expires") || void 0
      };
    });
  }
};
l(U, "FetchSource");
var C = U;
function g(i, e) {
  let t = i.getUint32(e + 4, true), r = i.getUint32(e + 0, true);
  return t * b(2, 32) + r;
}
l(g, "getUint64");
function X(i, e) {
  let t = new DataView(i), r = t.getUint8(7);
  if (r > 3) throw new Error(`Archive is spec version ${r} but this library supports up to spec version 3`);
  return {
    specVersion: r,
    rootDirectoryOffset: g(t, 8),
    rootDirectoryLength: g(t, 16),
    jsonMetadataOffset: g(t, 24),
    jsonMetadataLength: g(t, 32),
    leafDirectoryOffset: g(t, 40),
    leafDirectoryLength: g(t, 48),
    tileDataOffset: g(t, 56),
    tileDataLength: g(t, 64),
    numAddressedTiles: g(t, 72),
    numTileEntries: g(t, 80),
    numTileContents: g(t, 88),
    clustered: t.getUint8(96) === 1,
    internalCompression: t.getUint8(97),
    tileCompression: t.getUint8(98),
    tileType: t.getUint8(99),
    minZoom: t.getUint8(100),
    maxZoom: t.getUint8(101),
    minLon: t.getInt32(102, true) / 1e7,
    minLat: t.getInt32(106, true) / 1e7,
    maxLon: t.getInt32(110, true) / 1e7,
    maxLat: t.getInt32(114, true) / 1e7,
    centerZoom: t.getUint8(118),
    centerLon: t.getInt32(119, true) / 1e7,
    centerLat: t.getInt32(123, true) / 1e7,
    etag: e
  };
}
l(X, "bytesToHeader");
function Z(i) {
  let e = {
    buf: new Uint8Array(i),
    pos: 0
  }, t = v(e), r = [], n = 0;
  for (let s = 0; s < t; s++) {
    let o = v(e);
    r.push({
      tileId: n + o,
      offset: 0,
      length: 0,
      runLength: 1
    }), n += o;
  }
  for (let s = 0; s < t; s++) r[s].runLength = v(e);
  for (let s = 0; s < t; s++) r[s].length = v(e);
  for (let s = 0; s < t; s++) {
    let o = v(e);
    o === 0 && s > 0 ? r[s].offset = r[s - 1].offset + r[s - 1].length : r[s].offset = o - 1;
  }
  return r;
}
l(Z, "deserializeIndex");
var R = class R2 extends Error {
};
l(R, "EtagMismatch");
var E = R;
function K(i, e) {
  return m(this, null, function* () {
    let t = yield i.getBytes(0, 16384);
    if (new DataView(t.data).getUint16(0, true) !== 19792) throw new Error("Wrong magic number for PMTiles archive");
    let n = t.data.slice(0, Y), s = X(n, t.etag), o = t.data.slice(s.rootDirectoryOffset, s.rootDirectoryOffset + s.rootDirectoryLength), a = `${i.getKey()}|${s.etag || ""}|${s.rootDirectoryOffset}|${s.rootDirectoryLength}`, u = Z(yield e(o, s.internalCompression));
    return [s, [a, u.length, u]];
  });
}
l(K, "getHeaderAndRoot");
function I(i, e, t, r, n) {
  return m(this, null, function* () {
    let s = yield i.getBytes(t, r, void 0, n.etag), o = yield e(s.data, n.internalCompression), a = Z(o);
    if (a.length === 0) throw new Error("Empty directory is invalid");
    return a;
  });
}
l(I, "getDirectory");
var H = class H2 {
  constructor(e = 100, t = true, r = D) {
    this.cache = /* @__PURE__ */ new Map(), this.maxCacheEntries = e, this.counter = 1, this.decompress = r;
  }
  getHeader(e) {
    return m(this, null, function* () {
      let t = e.getKey(), r = this.cache.get(t);
      if (r) return r.lastUsed = this.counter++, r.data;
      let n = yield K(e, this.decompress);
      return n[1] && this.cache.set(n[1][0], {
        lastUsed: this.counter++,
        data: n[1][2]
      }), this.cache.set(t, {
        lastUsed: this.counter++,
        data: n[0]
      }), this.prune(), n[0];
    });
  }
  getDirectory(e, t, r, n) {
    return m(this, null, function* () {
      let s = `${e.getKey()}|${n.etag || ""}|${t}|${r}`, o = this.cache.get(s);
      if (o) return o.lastUsed = this.counter++, o.data;
      let a = yield I(e, this.decompress, t, r, n);
      return this.cache.set(s, {
        lastUsed: this.counter++,
        data: a
      }), this.prune(), a;
    });
  }
  prune() {
    if (this.cache.size > this.maxCacheEntries) {
      let e = 1 / 0, t;
      this.cache.forEach((r, n) => {
        r.lastUsed < e && (e = r.lastUsed, t = n);
      }), t && this.cache.delete(t);
    }
  }
  invalidate(e) {
    return m(this, null, function* () {
      this.cache.delete(e.getKey());
    });
  }
};
l(H, "ResolvedValueCache");
var M = class M2 {
  constructor(e = 100, t = true, r = D) {
    this.cache = /* @__PURE__ */ new Map(), this.invalidations = /* @__PURE__ */ new Map(), this.maxCacheEntries = e, this.counter = 1, this.decompress = r;
  }
  getHeader(e) {
    return m(this, null, function* () {
      let t = e.getKey(), r = this.cache.get(t);
      if (r) return r.lastUsed = this.counter++, yield r.data;
      let n = new Promise((s, o) => {
        K(e, this.decompress).then((a) => {
          a[1] && this.cache.set(a[1][0], {
            lastUsed: this.counter++,
            data: Promise.resolve(a[1][2])
          }), s(a[0]), this.prune();
        }).catch((a) => {
          o(a);
        });
      });
      return this.cache.set(t, {
        lastUsed: this.counter++,
        data: n
      }), n;
    });
  }
  getDirectory(e, t, r, n) {
    return m(this, null, function* () {
      let s = `${e.getKey()}|${n.etag || ""}|${t}|${r}`, o = this.cache.get(s);
      if (o) return o.lastUsed = this.counter++, yield o.data;
      let a = new Promise((u, c) => {
        I(e, this.decompress, t, r, n).then((d) => {
          u(d), this.prune();
        }).catch((d) => {
          c(d);
        });
      });
      return this.cache.set(s, {
        lastUsed: this.counter++,
        data: a
      }), a;
    });
  }
  prune() {
    if (this.cache.size >= this.maxCacheEntries) {
      let e = 1 / 0, t;
      this.cache.forEach((r, n) => {
        r.lastUsed < e && (e = r.lastUsed, t = n);
      }), t && this.cache.delete(t);
    }
  }
  invalidate(e) {
    return m(this, null, function* () {
      let t = e.getKey();
      if (this.invalidations.get(t)) return yield this.invalidations.get(t);
      this.cache.delete(e.getKey());
      let r = new Promise((n, s) => {
        this.getHeader(e).then((o) => {
          n(), this.invalidations.delete(t);
        }).catch((o) => {
          s(o);
        });
      });
      this.invalidations.set(t, r);
    });
  }
};
l(M, "SharedPromiseCache");
var P = M;
var B = class B2 {
  constructor(e, t, r) {
    typeof e == "string" ? this.source = new C(e) : this.source = e, r ? this.decompress = r : this.decompress = D, t ? this.cache = t : this.cache = new P();
  }
  getHeader() {
    return m(this, null, function* () {
      return yield this.cache.getHeader(this.source);
    });
  }
  getZxyAttempt(e, t, r, n) {
    return m(this, null, function* () {
      let s = G(e, t, r), o = yield this.cache.getHeader(this.source);
      if (e < o.minZoom || e > o.maxZoom) return;
      let a = o.rootDirectoryOffset, u = o.rootDirectoryLength;
      for (let c = 0; c <= 3; c++) {
        let d = yield this.cache.getDirectory(this.source, a, u, o), h = Q(d, s);
        if (h) {
          if (h.runLength > 0) {
            let p = yield this.source.getBytes(o.tileDataOffset + h.offset, h.length, n, o.etag);
            return {
              data: yield this.decompress(p.data, o.tileCompression),
              cacheControl: p.cacheControl,
              expires: p.expires
            };
          }
          a = o.leafDirectoryOffset + h.offset, u = h.length;
        } else return;
      }
      throw new Error("Maximum directory depth exceeded");
    });
  }
  getZxy(e, t, r, n) {
    return m(this, null, function* () {
      try {
        return yield this.getZxyAttempt(e, t, r, n);
      } catch (s) {
        if (s instanceof E) return this.cache.invalidate(this.source), yield this.getZxyAttempt(e, t, r, n);
        throw s;
      }
    });
  }
  getMetadataAttempt() {
    return m(this, null, function* () {
      let e = yield this.cache.getHeader(this.source), t = yield this.source.getBytes(e.jsonMetadataOffset, e.jsonMetadataLength, void 0, e.etag), r = yield this.decompress(t.data, e.internalCompression), n = new TextDecoder("utf-8");
      return JSON.parse(n.decode(r));
    });
  }
  getMetadata() {
    return m(this, null, function* () {
      try {
        return yield this.getMetadataAttempt();
      } catch (e) {
        if (e instanceof E) return this.cache.invalidate(this.source), yield this.getMetadataAttempt();
        throw e;
      }
    });
  }
  getTileJson(e) {
    return m(this, null, function* () {
      let t = yield this.getHeader(), r = yield this.getMetadata(), n = _(t.tileType);
      return {
        tilejson: "3.0.0",
        scheme: "xyz",
        tiles: [`${e}/{z}/{x}/{y}${n}`],
        vector_layers: r.vector_layers,
        attribution: r.attribution,
        description: r.description,
        name: r.name,
        version: r.version,
        bounds: [t.minLon, t.minLat, t.maxLon, t.maxLat],
        center: [t.centerLon, t.centerLat, t.centerZoom],
        minzoom: t.minZoom,
        maxzoom: t.maxZoom
      };
    });
  }
};
l(B, "PMTiles");
var x = B;

// node_modules/ol-pmtiles/dist/esm/index.js
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __spreadValues = (a, b2) => {
  for (var prop in b2 || (b2 = {})) if (__hasOwnProp.call(b2, prop)) __defNormalProp(a, prop, b2[prop]);
  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b2)) {
    if (__propIsEnum.call(b2, prop)) __defNormalProp(a, prop, b2[prop]);
  }
  return a;
};
var __name = (target, value) => __defProp(target, "name", {
  value,
  configurable: true
});
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var _PMTilesRasterSource = class _PMTilesRasterSource2 extends DataTile_default {
  constructor(options) {
    super(__spreadValues(__spreadValues({}, options), {
      state: "loading"
    }));
    this.loadImage = __name((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", () => reject(new Error("load failed")));
        img.src = src;
      });
    }, "loadImage");
    const p = new x(options.url);
    p.getHeader().then((h) => {
      const projection = options.projection === void 0 ? "EPSG:3857" : options.projection;
      this.tileGrid = options.tileGrid || createXYZ({
        extent: extentFromProjection(projection),
        maxResolution: options.maxResolution,
        minZoom: h.minZoom,
        maxZoom: h.maxZoom,
        tileSize: options.tileSize
      });
      this.setLoader((z2, x2, y) => __async(this, null, function* () {
        const response = yield p.getZxy(z2, x2, y);
        if (!response) {
          return new Uint8Array();
        }
        const src = URL.createObjectURL(new Blob([response.data]));
        const image = yield this.loadImage(src);
        URL.revokeObjectURL(src);
        return image;
      }));
      this.setState("ready");
    });
  }
};
__name(_PMTilesRasterSource, "PMTilesRasterSource");
var PMTilesRasterSource = _PMTilesRasterSource;
var _PMTilesVectorSource = class _PMTilesVectorSource2 extends VectorTile_default {
  constructor(options) {
    super(__spreadValues(__spreadValues({}, options), {
      state: "loading",
      url: "pmtiles://{z}/{x}/{y}",
      format: options.format || new MVT_default()
    }));
    this.tileLoadFunction = __name((tile, url) => {
      const vtile = tile;
      const re2 = new RegExp(/pmtiles:\/\/(\d+)\/(\d+)\/(\d+)/);
      const result = url.match(re2);
      if (!(result && result.length >= 4)) {
        throw Error("Could not parse tile URL");
      }
      const z2 = +result[1];
      const x2 = +result[2];
      const y = +result[3];
      vtile.setLoader((extent, resolution, projection) => {
        this.pmtiles_.getZxy(z2, x2, y).then((tile_result) => {
          if (tile_result) {
            const format = vtile.getFormat();
            vtile.setFeatures(format.readFeatures(tile_result.data, {
              extent,
              featureProjection: projection
            }));
            vtile.setState(TileState_default.LOADED);
          } else {
            vtile.setFeatures([]);
            vtile.setState(TileState_default.EMPTY);
          }
        }).catch((err) => {
          vtile.setFeatures([]);
          vtile.setState(TileState_default.ERROR);
        });
      });
    }, "tileLoadFunction");
    this.pmtiles_ = new x(options.url);
    this.pmtiles_.getHeader().then((h) => {
      const projection = options.projection || "EPSG:3857";
      const extent = options.extent || extentFromProjection(projection);
      this.tileGrid = options.tileGrid || createXYZ({
        extent,
        maxResolution: options.maxResolution,
        maxZoom: options.maxZoom !== void 0 ? options.maxZoom : h.maxZoom,
        minZoom: h.minZoom,
        tileSize: options.tileSize || 512
      });
      this.setTileLoadFunction(this.tileLoadFunction);
      this.setState("ready");
    });
  }
};
__name(_PMTilesVectorSource, "PMTilesVectorSource");
var PMTilesVectorSource = _PMTilesVectorSource;
export {
  PMTilesRasterSource,
  PMTilesVectorSource
};
//# sourceMappingURL=ol-pmtiles.js.map
