import {
  XML_default,
  makeArrayPusher,
  makeObjectPropertyPusher,
  makeObjectPropertySetter,
  makeStructureNS,
  pushParseAndPop,
  readDecimal,
  readHref,
  readPositiveInteger,
  readString
} from "./chunk-DC4OT5QG.js";
import {
  boundingExtent
} from "./chunk-IHYRLUFT.js";

// ../../node_modules/ol/format/OWS.js
var NAMESPACE_URIS = [null, "http://www.opengis.net/ows/1.1"];
var PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ServiceIdentification": makeObjectPropertySetter(readServiceIdentification),
  "ServiceProvider": makeObjectPropertySetter(readServiceProvider),
  "OperationsMetadata": makeObjectPropertySetter(readOperationsMetadata)
});
var OWS = class extends XML_default {
  constructor() {
    super();
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(node) {
    const owsObject = pushParseAndPop({}, PARSERS, node, []);
    return owsObject ? owsObject : null;
  }
};
var ADDRESS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "DeliveryPoint": makeObjectPropertySetter(readString),
  "City": makeObjectPropertySetter(readString),
  "AdministrativeArea": makeObjectPropertySetter(readString),
  "PostalCode": makeObjectPropertySetter(readString),
  "Country": makeObjectPropertySetter(readString),
  "ElectronicMailAddress": makeObjectPropertySetter(readString)
});
var ALLOWED_VALUES_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Value": makeObjectPropertyPusher(readValue)
});
var CONSTRAINT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "AllowedValues": makeObjectPropertySetter(readAllowedValues)
});
var CONTACT_INFO_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Phone": makeObjectPropertySetter(readPhone),
  "Address": makeObjectPropertySetter(readAddress)
});
var DCP_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "HTTP": makeObjectPropertySetter(readHttp)
});
var HTTP_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Get": makeObjectPropertyPusher(readGet),
  "Post": void 0
  // TODO
});
var OPERATION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "DCP": makeObjectPropertySetter(readDcp)
});
var OPERATIONS_METADATA_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Operation": readOperation
});
var PHONE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Voice": makeObjectPropertySetter(readString),
  "Facsimile": makeObjectPropertySetter(readString)
});
var REQUEST_METHOD_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Constraint": makeObjectPropertyPusher(readConstraint)
});
var SERVICE_CONTACT_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "IndividualName": makeObjectPropertySetter(readString),
  "PositionName": makeObjectPropertySetter(readString),
  "ContactInfo": makeObjectPropertySetter(readContactInfo)
});
var SERVICE_IDENTIFICATION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Abstract": makeObjectPropertySetter(readString),
  "AccessConstraints": makeObjectPropertySetter(readString),
  "Fees": makeObjectPropertySetter(readString),
  "Title": makeObjectPropertySetter(readString),
  "ServiceTypeVersion": makeObjectPropertySetter(readString),
  "ServiceType": makeObjectPropertySetter(readString)
});
var SERVICE_PROVIDER_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ProviderName": makeObjectPropertySetter(readString),
  "ProviderSite": makeObjectPropertySetter(readHref),
  "ServiceContact": makeObjectPropertySetter(readServiceContact)
});
function readAddress(node, objectStack) {
  return pushParseAndPop({}, ADDRESS_PARSERS, node, objectStack);
}
function readAllowedValues(node, objectStack) {
  return pushParseAndPop({}, ALLOWED_VALUES_PARSERS, node, objectStack);
}
function readConstraint(node, objectStack) {
  const name = node.getAttribute("name");
  if (!name) {
    return void 0;
  }
  return pushParseAndPop({
    "name": name
  }, CONSTRAINT_PARSERS, node, objectStack);
}
function readContactInfo(node, objectStack) {
  return pushParseAndPop({}, CONTACT_INFO_PARSERS, node, objectStack);
}
function readDcp(node, objectStack) {
  return pushParseAndPop({}, DCP_PARSERS, node, objectStack);
}
function readGet(node, objectStack) {
  const href = readHref(node);
  if (!href) {
    return void 0;
  }
  return pushParseAndPop({
    "href": href
  }, REQUEST_METHOD_PARSERS, node, objectStack);
}
function readHttp(node, objectStack) {
  return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}
function readOperation(node, objectStack) {
  const name = node.getAttribute("name");
  const value = pushParseAndPop({}, OPERATION_PARSERS, node, objectStack);
  if (!value) {
    return void 0;
  }
  const object = (
    /** @type {Object} */
    objectStack[objectStack.length - 1]
  );
  object[name] = value;
}
function readOperationsMetadata(node, objectStack) {
  return pushParseAndPop({}, OPERATIONS_METADATA_PARSERS, node, objectStack);
}
function readPhone(node, objectStack) {
  return pushParseAndPop({}, PHONE_PARSERS, node, objectStack);
}
function readServiceIdentification(node, objectStack) {
  return pushParseAndPop({}, SERVICE_IDENTIFICATION_PARSERS, node, objectStack);
}
function readServiceContact(node, objectStack) {
  return pushParseAndPop({}, SERVICE_CONTACT_PARSERS, node, objectStack);
}
function readServiceProvider(node, objectStack) {
  return pushParseAndPop({}, SERVICE_PROVIDER_PARSERS, node, objectStack);
}
function readValue(node, objectStack) {
  return readString(node);
}
var OWS_default = OWS;

// ../../node_modules/ol/format/WMTSCapabilities.js
var NAMESPACE_URIS2 = [null, "http://www.opengis.net/wmts/1.0"];
var OWS_NAMESPACE_URIS = [null, "http://www.opengis.net/ows/1.1"];
var PARSERS2 = makeStructureNS(NAMESPACE_URIS2, {
  "Contents": makeObjectPropertySetter(readContents)
});
var WMTSCapabilities = class extends XML_default {
  constructor() {
    super();
    this.owsParser_ = new OWS_default();
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(node) {
    let version = node.getAttribute("version");
    if (version) {
      version = version.trim();
    }
    let WMTSCapabilityObject = this.owsParser_.readFromNode(node);
    if (!WMTSCapabilityObject) {
      return null;
    }
    WMTSCapabilityObject["version"] = version;
    WMTSCapabilityObject = pushParseAndPop(WMTSCapabilityObject, PARSERS2, node, []);
    return WMTSCapabilityObject ? WMTSCapabilityObject : null;
  }
};
var CONTENTS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Layer": makeObjectPropertyPusher(readLayer),
  "TileMatrixSet": makeObjectPropertyPusher(readTileMatrixSet)
});
var LAYER_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Style": makeObjectPropertyPusher(readStyle),
  "Format": makeObjectPropertyPusher(readString),
  "TileMatrixSetLink": makeObjectPropertyPusher(readTileMatrixSetLink),
  "Dimension": makeObjectPropertyPusher(readDimensions),
  "ResourceURL": makeObjectPropertyPusher(readResourceUrl)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
  "Title": makeObjectPropertySetter(readString),
  "Abstract": makeObjectPropertySetter(readString),
  "WGS84BoundingBox": makeObjectPropertySetter(readBoundingBox),
  "BoundingBox": makeObjectPropertyPusher(readBoundingBoxWithCrs),
  "Identifier": makeObjectPropertySetter(readString)
}));
var STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "LegendURL": makeObjectPropertyPusher(readLegendUrl)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
  "Title": makeObjectPropertySetter(readString),
  "Identifier": makeObjectPropertySetter(readString)
}));
var TMS_LINKS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "TileMatrixSet": makeObjectPropertySetter(readString),
  "TileMatrixSetLimits": makeObjectPropertySetter(readTileMatrixLimitsList)
});
var TMS_LIMITS_LIST_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "TileMatrixLimits": makeArrayPusher(readTileMatrixLimits)
});
var TMS_LIMITS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "TileMatrix": makeObjectPropertySetter(readString),
  "MinTileRow": makeObjectPropertySetter(readPositiveInteger),
  "MaxTileRow": makeObjectPropertySetter(readPositiveInteger),
  "MinTileCol": makeObjectPropertySetter(readPositiveInteger),
  "MaxTileCol": makeObjectPropertySetter(readPositiveInteger)
});
var DIMENSION_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "Default": makeObjectPropertySetter(readString),
  "Value": makeObjectPropertyPusher(readString)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
  "Identifier": makeObjectPropertySetter(readString)
}));
var WGS84_BBOX_READERS = makeStructureNS(OWS_NAMESPACE_URIS, {
  "LowerCorner": makeArrayPusher(readCoordinates),
  "UpperCorner": makeArrayPusher(readCoordinates)
});
var TMS_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "WellKnownScaleSet": makeObjectPropertySetter(readString),
  "TileMatrix": makeObjectPropertyPusher(readTileMatrix)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
  "SupportedCRS": makeObjectPropertySetter(readString),
  "Identifier": makeObjectPropertySetter(readString),
  "BoundingBox": makeObjectPropertySetter(readBoundingBox)
}));
var TM_PARSERS = makeStructureNS(NAMESPACE_URIS2, {
  "TopLeftCorner": makeObjectPropertySetter(readCoordinates),
  "ScaleDenominator": makeObjectPropertySetter(readDecimal),
  "TileWidth": makeObjectPropertySetter(readPositiveInteger),
  "TileHeight": makeObjectPropertySetter(readPositiveInteger),
  "MatrixWidth": makeObjectPropertySetter(readPositiveInteger),
  "MatrixHeight": makeObjectPropertySetter(readPositiveInteger)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
  "Identifier": makeObjectPropertySetter(readString)
}));
function readContents(node, objectStack) {
  return pushParseAndPop({}, CONTENTS_PARSERS, node, objectStack);
}
function readLayer(node, objectStack) {
  return pushParseAndPop({}, LAYER_PARSERS, node, objectStack);
}
function readTileMatrixSet(node, objectStack) {
  return pushParseAndPop({}, TMS_PARSERS, node, objectStack);
}
function readStyle(node, objectStack) {
  const style = pushParseAndPop({}, STYLE_PARSERS, node, objectStack);
  if (!style) {
    return void 0;
  }
  const isDefault = node.getAttribute("isDefault") === "true";
  style["isDefault"] = isDefault;
  return style;
}
function readTileMatrixSetLink(node, objectStack) {
  return pushParseAndPop({}, TMS_LINKS_PARSERS, node, objectStack);
}
function readDimensions(node, objectStack) {
  return pushParseAndPop({}, DIMENSION_PARSERS, node, objectStack);
}
function readResourceUrl(node, objectStack) {
  const format = node.getAttribute("format");
  const template = node.getAttribute("template");
  const resourceType = node.getAttribute("resourceType");
  const resource = {};
  if (format) {
    resource["format"] = format;
  }
  if (template) {
    resource["template"] = template;
  }
  if (resourceType) {
    resource["resourceType"] = resourceType;
  }
  return resource;
}
function readBoundingBox(node, objectStack) {
  const coordinates = pushParseAndPop([], WGS84_BBOX_READERS, node, objectStack);
  if (coordinates.length != 2) {
    return void 0;
  }
  return boundingExtent(coordinates);
}
function readBoundingBoxWithCrs(node, objectStack) {
  const crs = node.getAttribute("crs");
  const coordinates = pushParseAndPop([], WGS84_BBOX_READERS, node, objectStack);
  if (coordinates.length != 2) {
    return void 0;
  }
  return {
    extent: boundingExtent(coordinates),
    crs
  };
}
function readLegendUrl(node, objectStack) {
  const legend = {};
  legend["format"] = node.getAttribute("format");
  legend["href"] = readHref(node);
  return legend;
}
function readCoordinates(node, objectStack) {
  const coordinates = readString(node).split(/\s+/);
  if (!coordinates || coordinates.length != 2) {
    return void 0;
  }
  const x = +coordinates[0];
  const y = +coordinates[1];
  if (isNaN(x) || isNaN(y)) {
    return void 0;
  }
  return [x, y];
}
function readTileMatrix(node, objectStack) {
  return pushParseAndPop({}, TM_PARSERS, node, objectStack);
}
function readTileMatrixLimitsList(node, objectStack) {
  return pushParseAndPop([], TMS_LIMITS_LIST_PARSERS, node, objectStack);
}
function readTileMatrixLimits(node, objectStack) {
  return pushParseAndPop({}, TMS_LIMITS_PARSERS, node, objectStack);
}
var WMTSCapabilities_default = WMTSCapabilities;

export {
  WMTSCapabilities_default
};
//# sourceMappingURL=chunk-5Y3T7XVU.js.map
