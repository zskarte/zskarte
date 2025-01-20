import {
  Select_default
} from "./chunk-4UWZLQX7.js";
import {
  Draw_default
} from "./chunk-LW6TLTIF.js";
import "./chunk-5TEGD4TJ.js";
import "./chunk-QNDF4Y3D.js";
import "./chunk-L2CV7KJD.js";
import "./chunk-Y6NY3J2U.js";
import "./chunk-CB43P2IO.js";
import "./chunk-PGKZJFAO.js";
import "./chunk-37JEKLY7.js";
import "./chunk-6MWGMXNZ.js";
import "./chunk-3XNX3BQI.js";
import {
  MultiPolygon_default
} from "./chunk-NRWZHYJK.js";
import "./chunk-4POCNJOL.js";
import "./chunk-GK7HTIGR.js";
import "./chunk-SVNYXP6R.js";
import "./chunk-UA3ZW3R6.js";
import "./chunk-V3CLUJMF.js";
import "./chunk-TDOEFV4W.js";
import "./chunk-6L3PZKOC.js";
import "./chunk-HZ5K3CAR.js";
import "./chunk-3JTXEXYF.js";
import "./chunk-CZ5OJR36.js";
import "./chunk-QX64YE7P.js";
import "./chunk-ROPZLQH3.js";
import "./chunk-6EYMMMQV.js";
import "./chunk-TXTFX4RY.js";
import "./chunk-2RIYM3D5.js";
import "./chunk-EA4JZPIY.js";
import "./chunk-JHWQPIRE.js";
import "./chunk-JNDXFVRB.js";
import "./chunk-QVNGVDO5.js";
import "./chunk-QABMMYJI.js";
import "./chunk-73LIRBW3.js";
import "./chunk-AIKGHEYG.js";
import "./chunk-PTY4IMKO.js";
import "./chunk-GA2V7BR7.js";
import "./chunk-FJKL6GEV.js";
import {
  LinearRing_default,
  Polygon_default
} from "./chunk-CPUVTREV.js";
import "./chunk-MXU547EQ.js";
import "./chunk-SUHIIPIP.js";
import "./chunk-V4YYR2FE.js";
import "./chunk-BYB6RSDC.js";
import "./chunk-S6ZHCVSZ.js";
import "./chunk-5DM6XDPZ.js";
import "./chunk-IRDKPWWT.js";
import "./chunk-MCYH4ZL5.js";
import "./chunk-QPOUXWMH.js";
import "./chunk-VE7TNJGX.js";
import "./chunk-IHYRLUFT.js";
import "./chunk-YKLFYZ2P.js";
import "./chunk-X7DDFSZC.js";
import "./chunk-MEYD4SA6.js";
import "./chunk-3IATBWUD.js";
import "./chunk-JL7CNLN5.js";
import "./chunk-LBIH33AC.js";
import "./chunk-NJ4VOZBH.js";

// node_modules/ol-ext/interaction/DrawHole.js
var ol_interaction_DrawHole = class olinteractionDrawHole extends Draw_default {
  constructor(options) {
    options = options || {};
    var _geometryFn = function(coordinates, geometry) {
      var coord = coordinates[0].pop();
      if (!this.getPolygon() || this.getPolygon().intersectsCoordinate(coord)) {
        this.lastOKCoord = [coord[0], coord[1]];
      }
      coordinates[0].push([this.lastOKCoord[0], this.lastOKCoord[1]]);
      if (geometry) {
        geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
      } else {
        geometry = new Polygon_default(coordinates);
      }
      return geometry;
    };
    var geomFn = options.geometryFunction;
    if (geomFn) {
      options.geometryFunction = function(c, g, p) {
        g = _geometryFn.bind(this)(c, g);
        return geomFn.bind(this)(c, g, p);
      };
    } else {
      options.geometryFunction = _geometryFn;
    }
    options.type = "Polygon";
    super(options);
    this._select = new Select_default({
      style: options.style
    });
    this._select.setActive(false);
    if (options.layers) {
      if (typeof options.layers === "function") {
        this.layers_ = options.layers;
      } else if (options.layers.indexOf) {
        this.layers_ = function(l) {
          return options.layers.indexOf(l) >= 0;
        };
      }
    }
    if (typeof options.featureFilter === "function") {
      this._features = options.featureFilter;
    } else if (options.featureFilter) {
      var features = options.featureFilter;
      this._features = function(f) {
        if (features.indexOf) {
          return !!features[features.indexOf(f)];
        } else {
          return !!features.item(features.getArray().indexOf(f));
        }
      };
    } else {
      this._features = function() {
        return true;
      };
    }
    this.on("drawstart", this._startDrawing.bind(this));
    this.on("drawend", this._finishDrawing.bind(this));
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    if (this.getMap()) this.getMap().removeInteraction(this._select);
    if (map) map.addInteraction(this._select);
    super.setMap.call(this, map);
  }
  /**
   * Activate/deactivate the interaction
   * @param {boolean}
   * @api stable
   */
  setActive(b) {
    if (this._select) this._select.getFeatures().clear();
    super.setActive.call(this, b);
  }
  /**
   * Remove last point of the feature currently being drawn
   * (test if points to remove before).
   */
  removeLastPoint() {
    if (this._feature && this._feature.getGeometry().getCoordinates()[0].length > 2) {
      super.removeLastPoint.call(this);
    }
  }
  /**
   * Get the current polygon to hole
   * @return {ol.Feature}
   */
  getPolygon() {
    return this._polygon;
  }
  /**
   * Get current feature to add a hole and start drawing
   * @param {ol_interaction_Draw.Event} e
   * @private
   */
  _startDrawing(e) {
    var map = this.getMap();
    this._feature = e.feature;
    var coord = e.feature.getGeometry().getCoordinates()[0][0];
    this._current = null;
    map.forEachFeatureAtPixel(map.getPixelFromCoordinate(coord), function(feature, layer) {
      if (!this._current && this._features(feature, layer)) {
        var poly = feature.getGeometry();
        if (poly.getType() === "Polygon" && poly.intersectsCoordinate(coord)) {
          this._polygonIndex = false;
          this._polygon = poly;
          this._current = feature;
        } else if (poly.getType() === "MultiPolygon" && poly.intersectsCoordinate(coord)) {
          for (var i = 0, p; p = poly.getPolygon(i); i++) {
            if (p.intersectsCoordinate(coord)) {
              this._polygonIndex = i;
              this._polygon = p;
              this._current = feature;
              break;
            }
          }
        }
      }
    }.bind(this), {
      layerFilter: this.layers_
    });
    this._select.getFeatures().clear();
    if (!this._current) {
      this.setActive(false);
      this.setActive(true);
    } else {
      this._select.getFeatures().push(this._current);
    }
  }
  /**
   * Stop drawing and add the sketch feature to the target feature.
   * @param {ol_interaction_Draw.Event} e
   * @private
   */
  _finishDrawing(e) {
    e.hole = e.feature;
    e.feature = this._select.getFeatures().item(0);
    this.dispatchEvent({
      type: "modifystart",
      features: [this._current]
    });
    var c = e.hole.getGeometry().getCoordinates()[0];
    if (c.length > 3) {
      if (this._polygonIndex !== false) {
        var geom = e.feature.getGeometry();
        var newGeom = new MultiPolygon_default([]);
        for (var i = 0, pi; pi = geom.getPolygon(i); i++) {
          if (i === this._polygonIndex) {
            pi.appendLinearRing(new LinearRing_default(c));
            newGeom.appendPolygon(pi);
          } else {
            newGeom.appendPolygon(pi);
          }
        }
        e.feature.setGeometry(newGeom);
      } else {
        this.getPolygon().appendLinearRing(new LinearRing_default(c));
      }
    }
    this.dispatchEvent({
      type: "modifyend",
      features: [this._current]
    });
    this._feature = null;
    this._select.getFeatures().clear();
  }
  /**
   * Function that is called when a geometry's coordinates are updated.
   * @param {Array<ol.coordinate>} coordinates
   * @param {ol_geom_Polygon} geometry
   * @return {ol_geom_Polygon}
   * @private
   */
  _geometryFn(coordinates, geometry) {
    var coord = coordinates[0].pop();
    if (!this.getPolygon() || this.getPolygon().intersectsCoordinate(coord)) {
      this.lastOKCoord = [coord[0], coord[1]];
    }
    coordinates[0].push([this.lastOKCoord[0], this.lastOKCoord[1]]);
    if (geometry) {
      geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
    } else {
      geometry = new Polygon_default(coordinates);
    }
    return geometry;
  }
};
var DrawHole_default = ol_interaction_DrawHole;
export {
  DrawHole_default as default
};
//# sourceMappingURL=ol-ext_interaction_DrawHole.js.map
