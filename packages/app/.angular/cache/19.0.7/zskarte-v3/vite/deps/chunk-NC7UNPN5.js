import {
  XML_default,
  makeArrayPusher,
  makeObjectPropertyPusher,
  makeObjectPropertySetter,
  makeStructureNS,
  pushParseAndPop,
  readBooleanString,
  readDecimal,
  readDecimalString,
  readHref,
  readNonNegativeIntegerString,
  readPositiveInteger,
  readString
} from "./chunk-DC4OT5QG.js";
import {
  compareVersions
} from "./chunk-YKLFYZ2P.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/format/WMSCapabilities.js
var NAMESPACE_URIS = [null, "http://www.opengis.net/wms"];
function isV13(objectStack) {
  return compareVersions(objectStack[0].version, "1.3") >= 0;
}
var PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Service": makeObjectPropertySetter(readService),
  "Capability": makeObjectPropertySetter(readCapability)
});
var COMMON_CAPABILITY_PARSERS = {
  "Request": makeObjectPropertySetter(readRequest),
  "Exception": makeObjectPropertySetter(readException),
  "Layer": makeObjectPropertySetter(readCapabilityLayer)
};
var CAPABILITY_PARSERS = makeStructureNS(NAMESPACE_URIS, __spreadProps(__spreadValues({}, COMMON_CAPABILITY_PARSERS), {
  "UserDefinedSymbolization": makeObjectPropertySetter(readUserDefinedSymbolization)
}));
var CAPABILITY_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS, COMMON_CAPABILITY_PARSERS);
var WMSCapabilities = class extends XML_default {
  constructor() {
    super();
    this.version = void 0;
  }
  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(node) {
    this.version = node.getAttribute("version").trim();
    const wmsCapabilityObject = pushParseAndPop({
      "version": this.version
    }, PARSERS, node, []);
    return wmsCapabilityObject ? wmsCapabilityObject : null;
  }
};
var COMMON_SERVICE_PARSERS = {
  "Name": makeObjectPropertySetter(readString),
  "Title": makeObjectPropertySetter(readString),
  "Abstract": makeObjectPropertySetter(readString),
  "KeywordList": makeObjectPropertySetter(readKeywordList),
  "OnlineResource": makeObjectPropertySetter(readHref),
  "ContactInformation": makeObjectPropertySetter(readContactInformation),
  "Fees": makeObjectPropertySetter(readString),
  "AccessConstraints": makeObjectPropertySetter(readString)
};
var SERVICE_PARSERS = makeStructureNS(NAMESPACE_URIS, COMMON_SERVICE_PARSERS);
var SERVICE_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS, __spreadProps(__spreadValues({}, COMMON_SERVICE_PARSERS), {
  "LayerLimit": makeObjectPropertySetter(readPositiveInteger),
  "MaxWidth": makeObjectPropertySetter(readPositiveInteger),
  "MaxHeight": makeObjectPropertySetter(readPositiveInteger)
}));
var CONTACT_INFORMATION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ContactPersonPrimary": makeObjectPropertySetter(readContactPersonPrimary),
  "ContactPosition": makeObjectPropertySetter(readString),
  "ContactAddress": makeObjectPropertySetter(readContactAddress),
  "ContactVoiceTelephone": makeObjectPropertySetter(readString),
  "ContactFacsimileTelephone": makeObjectPropertySetter(readString),
  "ContactElectronicMailAddress": makeObjectPropertySetter(readString)
});
var CONTACT_PERSON_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "ContactPerson": makeObjectPropertySetter(readString),
  "ContactOrganization": makeObjectPropertySetter(readString)
});
var CONTACT_ADDRESS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "AddressType": makeObjectPropertySetter(readString),
  "Address": makeObjectPropertySetter(readString),
  "City": makeObjectPropertySetter(readString),
  "StateOrProvince": makeObjectPropertySetter(readString),
  "PostCode": makeObjectPropertySetter(readString),
  "Country": makeObjectPropertySetter(readString)
});
var EXCEPTION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Format": makeArrayPusher(readString)
});
var COMMON_LAYER_PARSERS = {
  "Name": makeObjectPropertySetter(readString),
  "Title": makeObjectPropertySetter(readString),
  "Abstract": makeObjectPropertySetter(readString),
  "KeywordList": makeObjectPropertySetter(readKeywordList),
  "BoundingBox": makeObjectPropertyPusher(readBoundingBox),
  "Dimension": makeObjectPropertyPusher(readDimension),
  "Attribution": makeObjectPropertySetter(readAttribution),
  "AuthorityURL": makeObjectPropertyPusher(readAuthorityURL),
  "Identifier": makeObjectPropertyPusher(readString),
  "MetadataURL": makeObjectPropertyPusher(readMetadataURL),
  "DataURL": makeObjectPropertyPusher(readFormatOnlineresource),
  "FeatureListURL": makeObjectPropertyPusher(readFormatOnlineresource),
  "Style": makeObjectPropertyPusher(readStyle),
  "Layer": makeObjectPropertyPusher(readLayer)
};
var LAYER_PARSERS = makeStructureNS(NAMESPACE_URIS, __spreadProps(__spreadValues({}, COMMON_LAYER_PARSERS), {
  "SRS": makeObjectPropertyPusher(readString),
  "Extent": makeObjectPropertySetter(readExtent),
  "ScaleHint": makeObjectPropertyPusher(readScaleHint),
  "LatLonBoundingBox": makeObjectPropertySetter((node, objectStack) => readBoundingBox(node, objectStack, false)),
  "Layer": makeObjectPropertyPusher(readLayer)
}));
var LAYER_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS, __spreadProps(__spreadValues({}, COMMON_LAYER_PARSERS), {
  "CRS": makeObjectPropertyPusher(readString),
  "EX_GeographicBoundingBox": makeObjectPropertySetter(readEXGeographicBoundingBox),
  "MinScaleDenominator": makeObjectPropertySetter(readDecimal),
  "MaxScaleDenominator": makeObjectPropertySetter(readDecimal),
  "Layer": makeObjectPropertyPusher(readLayer)
}));
var ATTRIBUTION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Title": makeObjectPropertySetter(readString),
  "OnlineResource": makeObjectPropertySetter(readHref),
  "LogoURL": makeObjectPropertySetter(readSizedFormatOnlineresource)
});
var EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "westBoundLongitude": makeObjectPropertySetter(readDecimal),
  "eastBoundLongitude": makeObjectPropertySetter(readDecimal),
  "southBoundLatitude": makeObjectPropertySetter(readDecimal),
  "northBoundLatitude": makeObjectPropertySetter(readDecimal)
});
var REQUEST_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "GetCapabilities": makeObjectPropertySetter(readOperationType),
  "GetMap": makeObjectPropertySetter(readOperationType),
  "GetFeatureInfo": makeObjectPropertySetter(readOperationType)
});
var OPERATIONTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Format": makeObjectPropertyPusher(readString),
  "DCPType": makeObjectPropertyPusher(readDCPType)
});
var DCPTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "HTTP": makeObjectPropertySetter(readHTTP)
});
var HTTP_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Get": makeObjectPropertySetter(readFormatOnlineresource),
  "Post": makeObjectPropertySetter(readFormatOnlineresource)
});
var STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Name": makeObjectPropertySetter(readString),
  "Title": makeObjectPropertySetter(readString),
  "Abstract": makeObjectPropertySetter(readString),
  "LegendURL": makeObjectPropertyPusher(readSizedFormatOnlineresource),
  "StyleSheetURL": makeObjectPropertySetter(readFormatOnlineresource),
  "StyleURL": makeObjectPropertySetter(readFormatOnlineresource)
});
var FORMAT_ONLINERESOURCE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Format": makeObjectPropertySetter(readString),
  "OnlineResource": makeObjectPropertySetter(readHref)
});
var KEYWORDLIST_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  "Keyword": makeArrayPusher(readString)
});
function readAttribution(node, objectStack) {
  return pushParseAndPop({}, ATTRIBUTION_PARSERS, node, objectStack);
}
function readUserDefinedSymbolization(node, objectStack) {
  return {
    "SupportSLD": !!readBooleanString(node.getAttribute("UserDefinedSymbolization")),
    "UserLayer": !!readBooleanString(node.getAttribute("UserLayer")),
    "UserStyle": !!readBooleanString(node.getAttribute("UserStyle")),
    "RemoteWFS": !!readBooleanString(node.getAttribute("RemoteWFS"))
  };
}
function readBoundingBox(node, objectStack, withCrs = true) {
  const extent = [readDecimalString(node.getAttribute("minx")), readDecimalString(node.getAttribute("miny")), readDecimalString(node.getAttribute("maxx")), readDecimalString(node.getAttribute("maxy"))];
  const resolutions = [readDecimalString(node.getAttribute("resx")), readDecimalString(node.getAttribute("resy"))];
  const result = {
    extent,
    res: resolutions
  };
  if (!withCrs) {
    return result;
  }
  if (isV13(objectStack)) {
    result.crs = node.getAttribute("CRS");
  } else {
    result.srs = node.getAttribute("SRS");
  }
  return result;
}
function readEXGeographicBoundingBox(node, objectStack) {
  const geographicBoundingBox = pushParseAndPop({}, EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS, node, objectStack);
  if (!geographicBoundingBox) {
    return void 0;
  }
  const westBoundLongitude = (
    /** @type {number|undefined} */
    geographicBoundingBox["westBoundLongitude"]
  );
  const southBoundLatitude = (
    /** @type {number|undefined} */
    geographicBoundingBox["southBoundLatitude"]
  );
  const eastBoundLongitude = (
    /** @type {number|undefined} */
    geographicBoundingBox["eastBoundLongitude"]
  );
  const northBoundLatitude = (
    /** @type {number|undefined} */
    geographicBoundingBox["northBoundLatitude"]
  );
  if (westBoundLongitude === void 0 || southBoundLatitude === void 0 || eastBoundLongitude === void 0 || northBoundLatitude === void 0) {
    return void 0;
  }
  return [westBoundLongitude, southBoundLatitude, eastBoundLongitude, northBoundLatitude];
}
function readCapability(node, objectStack) {
  return pushParseAndPop({}, isV13(objectStack) ? CAPABILITY_PARSERS_V13 : CAPABILITY_PARSERS, node, objectStack);
}
function readService(node, objectStack) {
  return pushParseAndPop({}, isV13(objectStack) ? SERVICE_PARSERS_V13 : SERVICE_PARSERS, node, objectStack);
}
function readContactInformation(node, objectStack) {
  return pushParseAndPop({}, CONTACT_INFORMATION_PARSERS, node, objectStack);
}
function readContactPersonPrimary(node, objectStack) {
  return pushParseAndPop({}, CONTACT_PERSON_PARSERS, node, objectStack);
}
function readContactAddress(node, objectStack) {
  return pushParseAndPop({}, CONTACT_ADDRESS_PARSERS, node, objectStack);
}
function readException(node, objectStack) {
  return pushParseAndPop([], EXCEPTION_PARSERS, node, objectStack);
}
function readCapabilityLayer(node, objectStack) {
  const layerObject = pushParseAndPop({}, isV13(objectStack) ? LAYER_PARSERS_V13 : LAYER_PARSERS, node, objectStack);
  if (layerObject["Layer"] === void 0) {
    return Object.assign(layerObject, readLayer(node, objectStack));
  }
  return layerObject;
}
function readLayer(node, objectStack) {
  const v13 = isV13(objectStack);
  const parentLayerObject = (
    /**  @type {!Object<string,*>} */
    objectStack[objectStack.length - 1]
  );
  const layerObject = pushParseAndPop({}, v13 ? LAYER_PARSERS_V13 : LAYER_PARSERS, node, objectStack);
  if (!layerObject) {
    return void 0;
  }
  let queryable = readBooleanString(node.getAttribute("queryable"));
  if (queryable === void 0) {
    queryable = parentLayerObject["queryable"];
  }
  layerObject["queryable"] = queryable !== void 0 ? queryable : false;
  let cascaded = readNonNegativeIntegerString(node.getAttribute("cascaded"));
  if (cascaded === void 0) {
    cascaded = parentLayerObject["cascaded"];
  }
  layerObject["cascaded"] = cascaded;
  let opaque = readBooleanString(node.getAttribute("opaque"));
  if (opaque === void 0) {
    opaque = parentLayerObject["opaque"];
  }
  layerObject["opaque"] = opaque !== void 0 ? opaque : false;
  let noSubsets = readBooleanString(node.getAttribute("noSubsets"));
  if (noSubsets === void 0) {
    noSubsets = parentLayerObject["noSubsets"];
  }
  layerObject["noSubsets"] = noSubsets !== void 0 ? noSubsets : false;
  let fixedWidth = readDecimalString(node.getAttribute("fixedWidth"));
  if (!fixedWidth) {
    fixedWidth = parentLayerObject["fixedWidth"];
  }
  layerObject["fixedWidth"] = fixedWidth;
  let fixedHeight = readDecimalString(node.getAttribute("fixedHeight"));
  if (!fixedHeight) {
    fixedHeight = parentLayerObject["fixedHeight"];
  }
  layerObject["fixedHeight"] = fixedHeight;
  const addKeys = ["Style", "AuthorityURL"];
  if (v13) {
    addKeys.push("CRS");
  } else {
    addKeys.push("SRS", "Dimension");
  }
  addKeys.forEach(function(key) {
    if (key in parentLayerObject) {
      const childValue = layerObject[key] || [];
      layerObject[key] = childValue.concat(parentLayerObject[key]);
    }
  });
  const replaceKeys = ["BoundingBox", "Attribution"];
  if (v13) {
    replaceKeys.push("Dimension", "EX_GeographicBoundingBox", "MinScaleDenominator", "MaxScaleDenominator");
  } else {
    replaceKeys.push("LatLonBoundingBox", "ScaleHint", "Extent");
  }
  replaceKeys.forEach(function(key) {
    if (!(key in layerObject)) {
      const parentValue = parentLayerObject[key];
      layerObject[key] = parentValue;
    }
  });
  return layerObject;
}
function readDimension(node, objectStack) {
  const dimensionObject = {
    "name": node.getAttribute("name"),
    "units": node.getAttribute("units"),
    "unitSymbol": node.getAttribute("unitSymbol")
  };
  if (isV13(objectStack)) {
    Object.assign(dimensionObject, {
      "default": node.getAttribute("default"),
      "multipleValues": readBooleanString(node.getAttribute("multipleValues")),
      "nearestValue": readBooleanString(node.getAttribute("nearestValue")),
      "current": readBooleanString(node.getAttribute("current")),
      "values": readString(node)
    });
  }
  return dimensionObject;
}
function readExtent(node, objectStack) {
  return {
    "name": node.getAttribute("name"),
    "default": node.getAttribute("default"),
    "nearestValue": readBooleanString(node.getAttribute("nearestValue"))
  };
}
function readScaleHint(node, objectStack) {
  return {
    "min": readDecimalString(node.getAttribute("min")),
    "max": readDecimalString(node.getAttribute("max"))
  };
}
function readFormatOnlineresource(node, objectStack) {
  return pushParseAndPop({}, FORMAT_ONLINERESOURCE_PARSERS, node, objectStack);
}
function readRequest(node, objectStack) {
  return pushParseAndPop({}, REQUEST_PARSERS, node, objectStack);
}
function readDCPType(node, objectStack) {
  return pushParseAndPop({}, DCPTYPE_PARSERS, node, objectStack);
}
function readHTTP(node, objectStack) {
  return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}
function readOperationType(node, objectStack) {
  return pushParseAndPop({}, OPERATIONTYPE_PARSERS, node, objectStack);
}
function readSizedFormatOnlineresource(node, objectStack) {
  const formatOnlineresource = readFormatOnlineresource(node, objectStack);
  if (formatOnlineresource) {
    const size = [readNonNegativeIntegerString(node.getAttribute("width")), readNonNegativeIntegerString(node.getAttribute("height"))];
    formatOnlineresource["size"] = size;
    return formatOnlineresource;
  }
  return void 0;
}
function readAuthorityURL(node, objectStack) {
  const authorityObject = readFormatOnlineresource(node, objectStack);
  if (authorityObject) {
    authorityObject["name"] = node.getAttribute("name");
    return authorityObject;
  }
  return void 0;
}
function readMetadataURL(node, objectStack) {
  const metadataObject = readFormatOnlineresource(node, objectStack);
  if (metadataObject) {
    metadataObject["type"] = node.getAttribute("type");
    return metadataObject;
  }
  return void 0;
}
function readStyle(node, objectStack) {
  return pushParseAndPop({}, STYLE_PARSERS, node, objectStack);
}
function readKeywordList(node, objectStack) {
  return pushParseAndPop([], KEYWORDLIST_PARSERS, node, objectStack);
}
var WMSCapabilities_default = WMSCapabilities;

export {
  WMSCapabilities_default
};
//# sourceMappingURL=chunk-NC7UNPN5.js.map
