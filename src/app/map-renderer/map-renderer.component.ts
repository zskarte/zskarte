import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { PreferencesService } from '../preferences.service';
import { CLUSTER_LAYER_ZINDEX } from '../drawlayer/drawlayer.component';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { defaults } from 'ol/interaction';
import { StateService } from '../state/state.service';
import { ZsMapStateSource } from '../state/interfaces';
import OlTileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import IconAnchorUnits from 'ol/style/IconAnchorUnits';

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.css'],
})
export class MapRendererComponent implements OnInit {
  @ViewChild('mapLoader', { static: false }) loader: ElementRef;

  public map: OlMap;
  public positionFlagLocation: Point = new Point([0, 0]);
  public positionFlag: Feature = new Feature({
    geometry: this.positionFlagLocation,
  });
  public navigationSource = new VectorSource({
    features: [this.positionFlag],
  });
  public navigationLayer = new VectorLayer({
    source: this.navigationSource,
  });

  constructor(
    private _preferences: PreferencesService,
    private _state: StateService
  ) {
    this.positionFlag.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: IconAnchorUnits.FRACTION,
          anchorYUnits: IconAnchorUnits.FRACTION,
          src: 'assets/img/place.png',
          scale: 0.5,
        }),
      })
    );
  }

  public ngOnInit(): void {
    this.navigationLayer.setZIndex(CLUSTER_LAYER_ZINDEX + 1);

    this.map = new OlMap({
      target: 'map',
      view: new OlView({
        center: [0, 0],
        zoom: 1,
      }),
      controls: [],
      interactions: defaults({
        doubleClickZoom: false,
        pinchRotate: false,
        shiftDragZoom: false,
      }),
      // controls: [mousePositionControl]
    });
    this.map.addLayer(this.navigationLayer);

    this._state.observeMapSource().subscribe((source) => {
      switch (source) {
        case ZsMapStateSource.GEO_ADMIN_SWISS_IMAGE:
          break;
        case ZsMapStateSource.OPEN_STREET_MAP:
        default:
          console.log('test', 'load open street map source');
          this.map.addLayer(
            new OlTileLayer({
              source: new OSM(),
            })
          );
          break;
      }
    });
  }
}
