import {
  padNumber
} from "./chunk-YKLFYZ2P.js";
import {
  abstract
} from "./chunk-JL7CNLN5.js";
import {
  extend
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/xml.js
var XML_SCHEMA_INSTANCE_URI = "http://www.w3.org/2001/XMLSchema-instance";
function createElementNS(namespaceURI, qualifiedName) {
  return getDocument().createElementNS(namespaceURI, qualifiedName);
}
function getAllTextContent(node, normalizeWhitespace) {
  return getAllTextContent_(node, normalizeWhitespace, []).join("");
}
function getAllTextContent_(node, normalizeWhitespace, accumulator) {
  if (node.nodeType == Node.CDATA_SECTION_NODE || node.nodeType == Node.TEXT_NODE) {
    if (normalizeWhitespace) {
      accumulator.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""));
    } else {
      accumulator.push(node.nodeValue);
    }
  } else {
    let n;
    for (n = node.firstChild; n; n = n.nextSibling) {
      getAllTextContent_(n, normalizeWhitespace, accumulator);
    }
  }
  return accumulator;
}
function isDocument(object) {
  return "documentElement" in object;
}
function getAttributeNS(node, namespaceURI, name) {
  return node.getAttributeNS(namespaceURI, name) || "";
}
function parse(xml) {
  return new DOMParser().parseFromString(xml, "application/xml");
}
function makeArrayExtender(valueReader, thisArg) {
  return (
    /**
     * @param {Node} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, objectStack) {
      const value = valueReader.call(thisArg ?? this, node, objectStack);
      if (value !== void 0) {
        const array = (
          /** @type {Array<*>} */
          objectStack[objectStack.length - 1]
        );
        extend(array, value);
      }
    }
  );
}
function makeArrayPusher(valueReader, thisArg) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, objectStack) {
      const value = valueReader.call(thisArg ?? this, node, objectStack);
      if (value !== void 0) {
        const array = (
          /** @type {Array<*>} */
          objectStack[objectStack.length - 1]
        );
        array.push(value);
      }
    }
  );
}
function makeReplacer(valueReader, thisArg) {
  return (
    /**
     * @param {Node} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, objectStack) {
      const value = valueReader.call(thisArg ?? this, node, objectStack);
      if (value !== void 0) {
        objectStack[objectStack.length - 1] = value;
      }
    }
  );
}
function makeObjectPropertyPusher(valueReader, property, thisArg) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, objectStack) {
      const value = valueReader.call(thisArg ?? this, node, objectStack);
      if (value !== void 0) {
        const object = (
          /** @type {!Object} */
          objectStack[objectStack.length - 1]
        );
        const name = property !== void 0 ? property : node.localName;
        let array;
        if (name in object) {
          array = object[name];
        } else {
          array = [];
          object[name] = array;
        }
        array.push(value);
      }
    }
  );
}
function makeObjectPropertySetter(valueReader, property, thisArg) {
  return (
    /**
     * @param {Element} node Node.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, objectStack) {
      const value = valueReader.call(thisArg ?? this, node, objectStack);
      if (value !== void 0) {
        const object = (
          /** @type {!Object} */
          objectStack[objectStack.length - 1]
        );
        const name = property !== void 0 ? property : node.localName;
        object[name] = value;
      }
    }
  );
}
function makeChildAppender(nodeWriter, thisArg) {
  return (
    /**
     * @param {Element} node Node.
     * @param {*} value Value to be written.
     * @param {Array<*>} objectStack Object stack.
     * @this {*}
     */
    function(node, value, objectStack) {
      nodeWriter.call(thisArg ?? this, node, value, objectStack);
      const parent = (
        /** @type {NodeStackItem} */
        objectStack[objectStack.length - 1]
      );
      const parentNode = parent.node;
      parentNode.appendChild(node);
    }
  );
}
function makeArraySerializer(nodeWriter, thisArg) {
  let serializersNS, nodeFactory;
  return function(node, value, objectStack) {
    if (serializersNS === void 0) {
      serializersNS = {};
      const serializers = {};
      serializers[node.localName] = nodeWriter;
      serializersNS[node.namespaceURI] = serializers;
      nodeFactory = makeSimpleNodeFactory(node.localName);
    }
    serialize(serializersNS, nodeFactory, value, objectStack);
  };
}
function makeSimpleNodeFactory(fixedNodeName, fixedNamespaceURI) {
  return (
    /**
     * @param {*} value Value.
     * @param {Array<*>} objectStack Object stack.
     * @param {string} [newNodeName] Node name.
     * @return {Node} Node.
     */
    function(value, objectStack, newNodeName) {
      const context = (
        /** @type {NodeStackItem} */
        objectStack[objectStack.length - 1]
      );
      const node = context.node;
      let nodeName = fixedNodeName;
      if (nodeName === void 0) {
        nodeName = newNodeName;
      }
      const namespaceURI = fixedNamespaceURI !== void 0 ? fixedNamespaceURI : node.namespaceURI;
      return createElementNS(
        namespaceURI,
        /** @type {string} */
        nodeName
      );
    }
  );
}
var OBJECT_PROPERTY_NODE_FACTORY = makeSimpleNodeFactory();
function makeSequence(object, orderedKeys) {
  const length = orderedKeys.length;
  const sequence = new Array(length);
  for (let i = 0; i < length; ++i) {
    sequence[i] = object[orderedKeys[i]];
  }
  return sequence;
}
function makeStructureNS(namespaceURIs, structure, structureNS) {
  structureNS = structureNS !== void 0 ? structureNS : {};
  let i, ii;
  for (i = 0, ii = namespaceURIs.length; i < ii; ++i) {
    structureNS[namespaceURIs[i]] = structure;
  }
  return structureNS;
}
function parseNode(parsersNS, node, objectStack, thisArg) {
  let n;
  for (n = node.firstElementChild; n; n = n.nextElementSibling) {
    const parsers = parsersNS[n.namespaceURI];
    if (parsers !== void 0) {
      const parser = parsers[n.localName];
      if (parser !== void 0) {
        parser.call(thisArg, n, objectStack);
      }
    }
  }
}
function pushParseAndPop(object, parsersNS, node, objectStack, thisArg) {
  objectStack.push(object);
  parseNode(parsersNS, node, objectStack, thisArg);
  return (
    /** @type {T} */
    objectStack.pop()
  );
}
function serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg) {
  const length = (keys !== void 0 ? keys : values).length;
  let value, node;
  for (let i = 0; i < length; ++i) {
    value = values[i];
    if (value !== void 0) {
      node = nodeFactory.call(thisArg, value, objectStack, keys !== void 0 ? keys[i] : void 0);
      if (node !== void 0) {
        serializersNS[node.namespaceURI][node.localName].call(thisArg, node, value, objectStack);
      }
    }
  }
}
function pushSerializeAndPop(object, serializersNS, nodeFactory, values, objectStack, keys, thisArg) {
  objectStack.push(object);
  serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg);
  return (
    /** @type {O|undefined} */
    objectStack.pop()
  );
}
var xmlSerializer_ = void 0;
function getXMLSerializer() {
  if (xmlSerializer_ === void 0 && typeof XMLSerializer !== "undefined") {
    xmlSerializer_ = new XMLSerializer();
  }
  return xmlSerializer_;
}
var document_ = void 0;
function getDocument() {
  if (document_ === void 0 && typeof document !== "undefined") {
    document_ = document.implementation.createDocument("", "", null);
  }
  return document_;
}

// ../../node_modules/ol/format/xsd.js
function readBoolean(node) {
  const s = getAllTextContent(node, false);
  return readBooleanString(s);
}
function readBooleanString(string) {
  const m = /^\s*(true|1)|(false|0)\s*$/.exec(string);
  if (m) {
    return m[1] !== void 0 || false;
  }
  return void 0;
}
function readDateTime(node) {
  const s = getAllTextContent(node, false);
  const dateTime = Date.parse(s);
  return isNaN(dateTime) ? void 0 : dateTime / 1e3;
}
function readDecimal(node) {
  const s = getAllTextContent(node, false);
  return readDecimalString(s);
}
function readDecimalString(string) {
  const m = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(string);
  if (m) {
    return parseFloat(m[1]);
  }
  return void 0;
}
function readPositiveInteger(node) {
  const s = getAllTextContent(node, false);
  return readNonNegativeIntegerString(s);
}
function readNonNegativeIntegerString(string) {
  const m = /^\s*(\d+)\s*$/.exec(string);
  if (m) {
    return parseInt(m[1], 10);
  }
  return void 0;
}
function readString(node) {
  return getAllTextContent(node, false).trim();
}
function writeBooleanTextNode(node, bool) {
  writeStringTextNode(node, bool ? "1" : "0");
}
function writeCDATASection(node, string) {
  node.appendChild(getDocument().createCDATASection(string));
}
function writeDateTimeTextNode(node, dateTime) {
  const date = new Date(dateTime * 1e3);
  const string = date.getUTCFullYear() + "-" + padNumber(date.getUTCMonth() + 1, 2) + "-" + padNumber(date.getUTCDate(), 2) + "T" + padNumber(date.getUTCHours(), 2) + ":" + padNumber(date.getUTCMinutes(), 2) + ":" + padNumber(date.getUTCSeconds(), 2) + "Z";
  node.appendChild(getDocument().createTextNode(string));
}
function writeDecimalTextNode(node, decimal) {
  const string = decimal.toPrecision();
  node.appendChild(getDocument().createTextNode(string));
}
function writeNonNegativeIntegerTextNode(node, nonNegativeInteger) {
  const string = nonNegativeInteger.toString();
  node.appendChild(getDocument().createTextNode(string));
}
function writeStringTextNode(node, string) {
  node.appendChild(getDocument().createTextNode(string));
}

// ../../node_modules/ol/format/XML.js
var XML = class {
  /**
   * Read the source document.
   *
   * @param {Document|Element|string} source The XML source.
   * @return {Object|null} An object representing the source.
   * @api
   */
  read(source) {
    if (!source) {
      return null;
    }
    if (typeof source === "string") {
      const doc = parse(source);
      return this.readFromDocument(doc);
    }
    if (isDocument(source)) {
      return this.readFromDocument(
        /** @type {Document} */
        source
      );
    }
    return this.readFromNode(
      /** @type {Element} */
      source
    );
  }
  /**
   * @param {Document} doc Document.
   * @return {Object|null} Object
   */
  readFromDocument(doc) {
    for (let n = doc.firstChild; n; n = n.nextSibling) {
      if (n.nodeType == Node.ELEMENT_NODE) {
        return this.readFromNode(
          /** @type {Element} */
          n
        );
      }
    }
    return null;
  }
  /**
   * @abstract
   * @param {Element} node Node.
   * @return {Object|null} Object
   */
  readFromNode(node) {
    abstract();
  }
};
var XML_default = XML;

// ../../node_modules/ol/format/xlink.js
var NAMESPACE_URI = "http://www.w3.org/1999/xlink";
function readHref(node) {
  return node.getAttributeNS(NAMESPACE_URI, "href");
}

export {
  XML_SCHEMA_INSTANCE_URI,
  createElementNS,
  getAllTextContent,
  isDocument,
  getAttributeNS,
  parse,
  makeArrayExtender,
  makeArrayPusher,
  makeReplacer,
  makeObjectPropertyPusher,
  makeObjectPropertySetter,
  makeChildAppender,
  makeArraySerializer,
  makeSimpleNodeFactory,
  OBJECT_PROPERTY_NODE_FACTORY,
  makeSequence,
  makeStructureNS,
  parseNode,
  pushParseAndPop,
  pushSerializeAndPop,
  getXMLSerializer,
  readBoolean,
  readBooleanString,
  readDateTime,
  readDecimal,
  readDecimalString,
  readPositiveInteger,
  readNonNegativeIntegerString,
  readString,
  writeBooleanTextNode,
  writeCDATASection,
  writeDateTimeTextNode,
  writeDecimalTextNode,
  writeNonNegativeIntegerTextNode,
  writeStringTextNode,
  XML_default,
  readHref
};
//# sourceMappingURL=chunk-DC4OT5QG.js.map
