import { Injectable } from '@angular/core';
import { Collection, Feature } from 'ol';
import { Geometry, Polygon } from 'ol/geom';
import Draw, { createBox } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { IZsGlobalSearchConfig } from '../../../../types';
import { ZsMapStateService } from '../state/state.service';
import { LAYER_Z_INDEX_SEARCH_AREA_LAYER, MapRendererService } from './map-renderer.service';
import { Fill, Style } from 'ol/style';
import { ModifyRectangle } from './modify-rectangle.interaction';
import { boundingExtent } from 'ol/extent';
import { fromExtent } from 'ol/geom/Polygon';

const worldExtent = [
  [-180, -90],
  [180, -90],
  [180, 90],
  [-180, 90],
  [-180, -90],
];

@Injectable({
  providedIn: 'root',
})
export class MapSearchAreaService {
  private _renderer!: MapRendererService;
  private _state!: ZsMapStateService;

  private _worldCoordinates!: number[][];
  private _searchAreaOverlayFeature!: Feature<Polygon>;
  private _overlaySource!: VectorSource;
  private _overlayLayer!: VectorLayer<VectorSource>;
  private _draw!: Draw;
  private _modify!: ModifyRectangle;

  initialize({
    renderer,
    state,
  }: {
    renderer: MapRendererService;
    state: ZsMapStateService;
  }) {
    this._renderer = renderer;
    this._state = state;

    this._worldCoordinates = worldExtent.map((coord) => fromLonLat(coord));
    this._searchAreaOverlayFeature = new Feature(new Polygon([this._worldCoordinates]));

    this._overlaySource = new VectorSource({
      features: [this._searchAreaOverlayFeature as Feature<Geometry>],
    });
    this._overlayLayer = new VectorLayer({
      source: this._overlaySource,
      style: new Style({
        fill: new Fill({ color: 'rgba(0, 0, 0, 0.5)' }),
      }),
    });
    this._overlayLayer.setZIndex(LAYER_Z_INDEX_SEARCH_AREA_LAYER);
    this._overlayLayer.setVisible(false);
    this._renderer.getMap().addLayer(this._overlayLayer);

    this._state.observeSearchConfig().subscribe((searchconfig: IZsGlobalSearchConfig) => {
      this._overlayLayer.setVisible(searchconfig.filterByArea);
      if (searchconfig.area) {
        const overlayGeometry = this._searchAreaOverlayFeature.getGeometry();
        if (overlayGeometry) {
          const extentPoly = fromExtent(searchconfig.area);
          overlayGeometry.setCoordinates([this._worldCoordinates, extentPoly.getCoordinates()[0]]);
        }
      }
    });

    const updateSearchAreaOverlayFeature = (markedGeometry: Polygon) => {
      const overlayGeometry = this._searchAreaOverlayFeature.getGeometry();
      if (overlayGeometry) {
        overlayGeometry.setCoordinates([this._worldCoordinates, markedGeometry.getCoordinates()[0]]);
      }
    };

    this._draw = new Draw({
      source: this._overlaySource,
      type: 'Circle',
      geometryFunction: createBox(),
    });

    this._draw.on('drawend', (event) => {
      const feature = event.feature;
      updateSearchAreaOverlayFeature(feature.getGeometry() as Polygon);
      setTimeout(() => {
        this._overlaySource.removeFeature(feature);
      }, 0);
    });

    this._modify = new ModifyRectangle({
      features: new Collection([this._searchAreaOverlayFeature]),
    });
  }

  public activateAreaEdit() {
    //disable normal map manipulation interactions
    this._renderer.getMapInteractions().forEach((i) => {
      i.setActive(false);
    });
    this._renderer.getMap().addInteraction(this._draw);
    this._renderer.getMap().addInteraction(this._modify);
  }

  public deactivateAreaEdit() {
    this._modify.cancel();
    this._renderer.getMap().removeInteraction(this._draw);
    this._renderer.getMap().removeInteraction(this._modify);

    //reenable normal map manipulation interactions
    this._renderer.getMapInteractions().forEach((i) => {
      i.setActive(true);
    });
  }

  public getSearchAreaOverlayFeature() {
    return this._searchAreaOverlayFeature;
  }

  public getSearchAreaExtent() {
    const geometry = this._searchAreaOverlayFeature.getGeometry();
    if (geometry && geometry.getCoordinates().length === 2) {
      //only return the inner rectangle if any
      return boundingExtent(geometry.getCoordinates()[1]);
    }
    return null;
  }
}
