import {
  Projection_default,
  addCoordinateTransforms,
  addEquivalentProjections,
  addProjection,
  createSafeCoordinateTransform,
  get,
  get2
} from "./chunk-QPOUXWMH.js";
import "./chunk-VE7TNJGX.js";
import "./chunk-IHYRLUFT.js";
import "./chunk-YKLFYZ2P.js";
import "./chunk-MEYD4SA6.js";
import "./chunk-3IATBWUD.js";
import {
  __async
} from "./chunk-NJ4VOZBH.js";

// ../../node_modules/ol/proj/proj4.js
var registered = null;
function isRegistered() {
  return !!registered;
}
function unregister() {
  registered = null;
}
function register(proj4) {
  registered = proj4;
  const projCodes = Object.keys(proj4.defs);
  const len = projCodes.length;
  let i, j;
  for (i = 0; i < len; ++i) {
    const code = projCodes[i];
    if (!get(code)) {
      const def = proj4.defs(code);
      let units = (
        /** @type {import("./Units.js").Units} */
        def.units
      );
      if (!units && def.projName === "longlat") {
        units = "degrees";
      }
      addProjection(new Projection_default({
        code,
        axisOrientation: def.axis,
        metersPerUnit: def.to_meter,
        units
      }));
    }
  }
  for (i = 0; i < len; ++i) {
    const code1 = projCodes[i];
    const proj1 = get(code1);
    for (j = 0; j < len; ++j) {
      const code2 = projCodes[j];
      const proj2 = get(code2);
      if (!get2(code1, code2)) {
        if (proj4.defs[code1] === proj4.defs[code2]) {
          addEquivalentProjections([proj1, proj2]);
        } else {
          const transform = proj4(code1, code2);
          addCoordinateTransforms(proj1, proj2, createSafeCoordinateTransform(proj1, proj2, transform.forward), createSafeCoordinateTransform(proj2, proj1, transform.inverse));
        }
      }
    }
  }
}
var epsgLookup = function(code) {
  return __async(this, null, function* () {
    const response = yield fetch(`https://epsg.io/${code}.proj4`);
    if (!response.ok) {
      throw new Error(`Unexpected response from epsg.io: ${response.status}`);
    }
    return response.text();
  });
};
function setEPSGLookup(func) {
  epsgLookup = func;
}
function getEPSGLookup() {
  return epsgLookup;
}
function fromEPSGCode(code) {
  return __async(this, null, function* () {
    if (typeof code === "string") {
      code = parseInt(code.split(":").pop(), 10);
    }
    const proj4 = registered;
    if (!proj4) {
      throw new Error("Proj4 must be registered first with register(proj4)");
    }
    const epsgCode = "EPSG:" + code;
    if (proj4.defs(epsgCode)) {
      return get(epsgCode);
    }
    proj4.defs(epsgCode, yield epsgLookup(code));
    register(proj4);
    return get(epsgCode);
  });
}
function epsgLookupMapTiler(key) {
  return function(code) {
    return __async(this, null, function* () {
      const response = yield fetch(`https://api.maptiler.com/coordinates/search/code:${code}.json?transformations=true&exports=true&key=${key}`);
      if (!response.ok) {
        throw new Error(`Unexpected response from maptiler.com: ${response.status}`);
      }
      return response.json().then((json) => {
        const results = json["results"];
        if (results?.length > 0) {
          const result = results.filter((r) => r["id"]?.["authority"] === "EPSG" && r["id"]?.["code"] === code)[0];
          if (result) {
            const transforms = result["transformations"];
            if (transforms?.length > 0) {
              const defaultTransform = result["default_transformation"];
              if (transforms.filter((t) => t["id"]?.["authority"] === defaultTransform?.["authority"] && t["id"]?.["code"] === defaultTransform?.["code"] && t["grids"]?.length === 0).length > 0) {
                return result["exports"]?.["proj4"];
              }
              const transform = transforms.filter((t) => t["grids"]?.length === 0 && t["target_crs"]?.["authority"] === "EPSG" && t["target_crs"]?.["code"] === 4326 && t["deprecated"] === false && t["usable"] === true).sort((t1, t2) => t1["accuracy"] - t2["accuracy"])[0]?.["exports"]?.["proj4"];
              if (transform) {
                return transform;
              }
            }
            return result["exports"]?.["proj4"];
          }
        }
      });
    });
  };
}
export {
  epsgLookupMapTiler,
  fromEPSGCode,
  getEPSGLookup,
  isRegistered,
  register,
  setEPSGLookup,
  unregister
};
//# sourceMappingURL=ol_proj_proj4.js.map
