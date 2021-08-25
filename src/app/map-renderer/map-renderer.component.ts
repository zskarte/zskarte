import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PreferencesService } from '../preferences.service';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { defaults } from 'ol/interaction';
import { StateService } from '../state/state.service';
import { ZsMapStateSource } from '../state/interfaces';
import OlTileLayer from 'ol/layer/Tile';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ZsMapSources } from '../state/map-sources';
import { ZsMapBaseLayer } from '../state/base-layer';

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.css'],
})
export class MapRendererComponent implements OnInit, OnDestroy {
  // @ViewChild('mapLoader', { static: false }) loader: ElementRef;
  private _ngUnsubscribe = new Subject();
  private _map: OlMap;
  private _mapLayer = new OlTileLayer({
    zIndex: 0,
  });
  private _layerCache: Record<string, ZsMapBaseLayer> = {};

  constructor(
    private _preferences: PreferencesService,
    private _state: StateService
  ) {
    // this.positionFlag.setStyle(
    //   new Style({
    //     image: new Icon({
    //       anchor: [0.5, 1],
    //       anchorXUnits: IconAnchorUnits.FRACTION,
    //       anchorYUnits: IconAnchorUnits.FRACTION,
    //       src: 'assets/img/place.png',
    //       scale: 0.5,
    //     }),
    //   })
    // );
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  public ngOnInit(): void {
    this._map = new OlMap({
      target: 'map',
      view: new OlView({
        center: [849861.97, 5905812.55], // TODO
        zoom: 16, // TODO
      }),
      controls: [],
      interactions: defaults({
        doubleClickZoom: false,
        pinchRotate: false,
        shiftDragZoom: false,
      }),
    });

    this._map.on('click', (event) => {
      const layer = this._state.getActiveLayer();
      console.log('map clicked', event.coordinate, layer);
      if (layer) {
        layer.testAddPoint(event.coordinate);
      }
    });

    this._map.addLayer(this._mapLayer);

    this._state
      .observeMapSource()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((source) => {
        this._mapLayer.setSource(ZsMapSources.get(source));
      });

    this._state
      .observeMapOpacity()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((opacity) => {
        this._mapLayer.setOpacity(opacity);
      });

    this._state
      .observeLayers()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((layers) => {
        for (const layer of layers) {
          if (!this._layerCache[layer.getId()]) {
            this._layerCache[layer.getId()] = layer;
            this._map.addLayer(layer.olLayer);
          }
        }
      });
  }
}
