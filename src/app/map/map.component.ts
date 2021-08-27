import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { transform } from 'ol/proj';
import {SharedStateService, SidebarContext} from '../shared-state.service';
import { Layer } from '../layers/layer';
import { coordinatesProjection, mercatorProjection } from '../projections';
import Feature from 'ol/Feature';
import { I18NService } from '../i18n.service';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import { ScaleLine, defaults as defaultControls } from 'ol/control';
import { PreferencesService } from '../preferences.service';
import { CLUSTER_LAYER_ZINDEX } from '../drawlayer/drawlayer.component';
import { defaults } from 'ol/interaction';
import {MatSidenav} from "@angular/material/sidenav";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  @ViewChild('maploader', { static: false }) loader: ElementRef;

  map: OlMap = null;
  layer: Layer;
  currentSessionId: string;

  positionFlagLocation: Point = new Point([0, 0]);
  positionFlag: Feature = new Feature({
    geometry: this.positionFlagLocation,
  });
  navigationSource = new VectorSource({
    features: [this.positionFlag],
  });
  navigationLayer = new VectorLayer({
    source: this.navigationSource,
  });

  SidebarContext = SidebarContext;

  scaleControl = () => {
    return new ScaleLine({
      units: 'metric',
      bar: true,
      steps: 4,
      text: true,
      minWidth: 140,
    });
  };

  constructor(
    public sharedState: SharedStateService,
    private preferences: PreferencesService,
    public i18n: I18NService
  ) {
    this.positionFlag.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/place.png',
          scale: 0.5,
        }),
      })
    );
  }

  ngOnInit() {
    this.navigationLayer.setZIndex(CLUSTER_LAYER_ZINDEX + 1);
    const viewPort = this.preferences.getViewPortForSession(
      this.currentSessionId
    );
    window.addEventListener('beforeunload', (event) => {
      // Save zoom level and position before leaving (to recover when re-entering)
      if (this.currentSessionId) {
        this.preferences.setViewPortForSession(this.currentSessionId, {
          coordinates: this.map.getView().getCenter(),
          zoomLevel: this.map.getView().getZoom(),
        });
      }
    });
    this.map = new OlMap({
      target: 'map',
      view: new OlView({
        center: viewPort.coordinates,
        zoom: viewPort.zoomLevel,
      }),
      controls: [this.scaleControl()],
      interactions: defaults({
        doubleClickZoom: false,
        rotate: false,
        pinchRotate: false,
        shiftDragZoom: false,
      }),
    });
    this.map.addLayer(this.navigationLayer);
    this.sharedState.session.subscribe((s) => {
      if (s && s.uuid !== this.currentSessionId) {
        this.currentSessionId = s.uuid;
        const viewPort = this.preferences.getViewPortForSession(
          this.currentSessionId
        );
        this.map.getView().setCenter(viewPort.coordinates);
        this.map.getView().setZoom(viewPort.zoomLevel);
      }
    });
    this.sharedState.currentCoordinate.subscribe((coordinate) => {
      if (coordinate != null) {
        const c = coordinate.mercator
          ? [coordinate.lon, coordinate.lat]
          : transform(
              [coordinate.lon, coordinate.lat],
              coordinatesProjection,
              mercatorProjection
            );
        this.positionFlagLocation.setCoordinates(c);
        this.positionFlag.changed();
        this.navigationLayer.setVisible(true);
        if (coordinate.center) {
          setTimeout(() => {
            this.map.getView().animate({ center: c });
          }, 100);
        }
      } else {
        this.navigationLayer.setVisible(false);
      }
    });
    this.sharedState.addAdditionalLayer.subscribe((layer) => {
      if (layer != null) {
        this.map.addLayer(layer);
        this.sharedState.didChangeLayer();
      }
    });
    this.sharedState.removeAdditionalLayer.subscribe((layer) => {
      if (layer != null) {
        this.map.removeLayer(layer);
        this.sharedState.didChangeLayer();
      }
    });

    this.sharedState.currentLayer.subscribe((layer) => {
      if (layer != null) {
        if (this.layer != null) {
          this.map.removeLayer(this.layer.olLayer);
        }
        this.map.getLayers().insertAt(0, layer.olLayer);
        this.layer = layer;

        this.sharedState.didChangeLayer();
      }
    });

    this.sharedState.selectedFeatures.subscribe((selectedFeatures) => {
      selectedFeatures.forEach(feature => {
        this.map.removeLayer(feature.layer);
        this.map.addLayer(feature.layer);
      });
    });

    this.sharedState.showMapLoader.subscribe((show) => {
      if (this.loader) {
        if (show) {
          this.loader.nativeElement.classList.add('show');
        } else {
          this.loader.nativeElement.classList.remove('show');
        }
      }
    });
  }

  zoomIn(): void {
    this.sharedState.zoom.next(1);
  }

  zoomOut(): void {
    this.sharedState.zoom.next(-1);
  }
}
