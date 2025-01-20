import {
  Vector_default
} from "./chunk-5TEGD4TJ.js";
import {
  Feature_default
} from "./chunk-3XNX3BQI.js";
import {
  Interaction_default,
  never,
  shiftKeyOnly,
  singleClick
} from "./chunk-UA3ZW3R6.js";
import {
  CollectionEventType_default,
  Collection_default
} from "./chunk-6L3PZKOC.js";
import {
  createEditingStyle
} from "./chunk-QX64YE7P.js";
import {
  Event_default,
  TRUE
} from "./chunk-X7DDFSZC.js";
import {
  clear
} from "./chunk-MEYD4SA6.js";
import {
  getUid
} from "./chunk-JL7CNLN5.js";
import {
  extend
} from "./chunk-LBIH33AC.js";

// ../../node_modules/ol/interaction/Select.js
var SelectEventType = {
  /**
   * Triggered when feature(s) has been (de)selected.
   * @event SelectEvent#select
   * @api
   */
  SELECT: "select"
};
var SelectEvent = class extends Event_default {
  /**
   * @param {SelectEventType} type The event type.
   * @param {Array<import("../Feature.js").default>} selected Selected features.
   * @param {Array<import("../Feature.js").default>} deselected Deselected features.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Associated
   *     {@link module:ol/MapBrowserEvent~MapBrowserEvent}.
   */
  constructor(type, selected, deselected, mapBrowserEvent) {
    super(type);
    this.selected = selected;
    this.deselected = deselected;
    this.mapBrowserEvent = mapBrowserEvent;
  }
};
var originalFeatureStyles = {};
var Select = class _Select extends Interaction_default {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();
    this.on;
    this.once;
    this.un;
    options = options ? options : {};
    this.boundAddFeature_ = this.addFeature_.bind(this);
    this.boundRemoveFeature_ = this.removeFeature_.bind(this);
    this.condition_ = options.condition ? options.condition : singleClick;
    this.addCondition_ = options.addCondition ? options.addCondition : never;
    this.removeCondition_ = options.removeCondition ? options.removeCondition : never;
    this.toggleCondition_ = options.toggleCondition ? options.toggleCondition : shiftKeyOnly;
    this.multi_ = options.multi ? options.multi : false;
    this.filter_ = options.filter ? options.filter : TRUE;
    this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;
    this.style_ = options.style !== void 0 ? options.style : getDefaultStyleFunction();
    this.features_ = options.features || new Collection_default();
    let layerFilter;
    if (options.layers) {
      if (typeof options.layers === "function") {
        layerFilter = options.layers;
      } else {
        const layers = options.layers;
        layerFilter = function(layer) {
          return layers.includes(layer);
        };
      }
    } else {
      layerFilter = TRUE;
    }
    this.layerFilter_ = layerFilter;
    this.featureLayerAssociation_ = {};
  }
  /**
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("../layer/Layer.js").default} layer Layer.
   * @private
   */
  addFeatureLayerAssociation_(feature, layer) {
    this.featureLayerAssociation_[getUid(feature)] = layer;
  }
  /**
   * Get the selected features.
   * @return {Collection<Feature>} Features collection.
   * @api
   */
  getFeatures() {
    return this.features_;
  }
  /**
   * Returns the Hit-detection tolerance.
   * @return {number} Hit tolerance in pixels.
   * @api
   */
  getHitTolerance() {
    return this.hitTolerance_;
  }
  /**
   * Returns the associated {@link module:ol/layer/Vector~VectorLayer vector layer} of
   * a selected feature.
   * @param {import("../Feature.js").default} feature Feature
   * @return {import('../layer/Vector.js').default} Layer.
   * @api
   */
  getLayer(feature) {
    return (
      /** @type {import('../layer/Vector.js').default} */
      this.featureLayerAssociation_[getUid(feature)]
    );
  }
  /**
   * Hit-detection tolerance. Pixels inside the radius around the given position
   * will be checked for features.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @api
   */
  setHitTolerance(hitTolerance) {
    this.hitTolerance_ = hitTolerance;
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {import("../Map.js").default|null} map Map.
   * @api
   * @override
   */
  setMap(map) {
    const currentMap = this.getMap();
    if (currentMap && this.style_) {
      this.features_.forEach(this.restorePreviousStyle_.bind(this));
    }
    super.setMap(map);
    if (map) {
      this.features_.addEventListener(CollectionEventType_default.ADD, this.boundAddFeature_);
      this.features_.addEventListener(CollectionEventType_default.REMOVE, this.boundRemoveFeature_);
      if (this.style_) {
        this.features_.forEach(this.applySelectedStyle_.bind(this));
      }
    } else {
      this.features_.removeEventListener(CollectionEventType_default.ADD, this.boundAddFeature_);
      this.features_.removeEventListener(CollectionEventType_default.REMOVE, this.boundRemoveFeature_);
    }
  }
  /**
   * @param {import("../Collection.js").CollectionEvent<Feature>} evt Event.
   * @private
   */
  addFeature_(evt) {
    const feature = evt.element;
    if (this.style_) {
      this.applySelectedStyle_(feature);
    }
    if (!this.getLayer(feature)) {
      const layer = (
        /** @type {VectorLayer} */
        this.getMap().getAllLayers().find(function(layer2) {
          if (layer2 instanceof Vector_default && layer2.getSource() && layer2.getSource().hasFeature(feature)) {
            return layer2;
          }
        })
      );
      if (layer) {
        this.addFeatureLayerAssociation_(feature, layer);
      }
    }
  }
  /**
   * @param {import("../Collection.js").CollectionEvent<Feature>} evt Event.
   * @private
   */
  removeFeature_(evt) {
    if (this.style_) {
      this.restorePreviousStyle_(evt.element);
    }
  }
  /**
   * @return {import("../style/Style.js").StyleLike|null} Select style.
   */
  getStyle() {
    return this.style_;
  }
  /**
   * @param {Feature} feature Feature
   * @private
   */
  applySelectedStyle_(feature) {
    const key = getUid(feature);
    if (!(key in originalFeatureStyles)) {
      originalFeatureStyles[key] = feature.getStyle();
    }
    feature.setStyle(this.style_);
  }
  /**
   * @param {Feature} feature Feature
   * @private
   */
  restorePreviousStyle_(feature) {
    const interactions = this.getMap().getInteractions().getArray();
    for (let i = interactions.length - 1; i >= 0; --i) {
      const interaction = interactions[i];
      if (interaction !== this && interaction instanceof _Select && interaction.getStyle() && interaction.getFeatures().getArray().lastIndexOf(feature) !== -1) {
        feature.setStyle(interaction.getStyle());
        return;
      }
    }
    const key = getUid(feature);
    feature.setStyle(originalFeatureStyles[key]);
    delete originalFeatureStyles[key];
  }
  /**
   * @param {Feature} feature Feature.
   * @private
   */
  removeFeatureLayerAssociation_(feature) {
    delete this.featureLayerAssociation_[getUid(feature)];
  }
  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} and may change the
   * selected state of features.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @override
   */
  handleEvent(mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
      return true;
    }
    const add = this.addCondition_(mapBrowserEvent);
    const remove = this.removeCondition_(mapBrowserEvent);
    const toggle = this.toggleCondition_(mapBrowserEvent);
    const set = !add && !remove && !toggle;
    const map = mapBrowserEvent.map;
    const features = this.getFeatures();
    const deselected = [];
    const selected = [];
    if (set) {
      clear(this.featureLayerAssociation_);
      map.forEachFeatureAtPixel(
        mapBrowserEvent.pixel,
        /**
         * @param {import("../Feature.js").FeatureLike} feature Feature.
         * @param {import("../layer/Layer.js").default} layer Layer.
         * @return {boolean|undefined} Continue to iterate over the features.
         */
        (feature, layer) => {
          if (!(feature instanceof Feature_default) || !this.filter_(feature, layer)) {
            return;
          }
          this.addFeatureLayerAssociation_(feature, layer);
          selected.push(feature);
          return !this.multi_;
        },
        {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_
        }
      );
      for (let i = features.getLength() - 1; i >= 0; --i) {
        const feature = features.item(i);
        const index = selected.indexOf(feature);
        if (index > -1) {
          selected.splice(index, 1);
        } else {
          features.remove(feature);
          deselected.push(feature);
        }
      }
      if (selected.length !== 0) {
        features.extend(selected);
      }
    } else {
      map.forEachFeatureAtPixel(
        mapBrowserEvent.pixel,
        /**
         * @param {import("../Feature.js").FeatureLike} feature Feature.
         * @param {import("../layer/Layer.js").default} layer Layer.
         * @return {boolean|undefined} Continue to iterate over the features.
         */
        (feature, layer) => {
          if (!(feature instanceof Feature_default) || !this.filter_(feature, layer)) {
            return;
          }
          if ((add || toggle) && !features.getArray().includes(feature)) {
            this.addFeatureLayerAssociation_(feature, layer);
            selected.push(feature);
          } else if ((remove || toggle) && features.getArray().includes(feature)) {
            deselected.push(feature);
            this.removeFeatureLayerAssociation_(feature);
          }
          return !this.multi_;
        },
        {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_
        }
      );
      for (let j = deselected.length - 1; j >= 0; --j) {
        features.remove(deselected[j]);
      }
      features.extend(selected);
    }
    if (selected.length > 0 || deselected.length > 0) {
      this.dispatchEvent(new SelectEvent(SelectEventType.SELECT, selected, deselected, mapBrowserEvent));
    }
    return true;
  }
};
function getDefaultStyleFunction() {
  const styles = createEditingStyle();
  extend(styles["Polygon"], styles["LineString"]);
  extend(styles["GeometryCollection"], styles["LineString"]);
  return function(feature) {
    if (!feature.getGeometry()) {
      return null;
    }
    return styles[feature.getGeometry().getType()];
  };
}
var Select_default = Select;

export {
  Select_default
};
//# sourceMappingURL=chunk-4UWZLQX7.js.map
