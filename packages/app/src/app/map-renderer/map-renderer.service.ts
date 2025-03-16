import { ElementRef, Injectable, Signal, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { IZsMapPrintState, SearchFunction } from '@zskarte/types';
import { CsvMapLayer, GeoAdminMapLayer, GeoJSONMapLayer, WMSMapLayer } from '@zskarte/types';
import { Feature, Geolocation as OlGeolocation } from 'ol';
import DrawHole from 'ol-ext/interaction/DrawHole';
import { FeatureLike } from 'ol/Feature';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { Attribution, ScaleLine } from 'ol/control';
import { LineString, Point, Polygon } from 'ol/geom';
import { Draw, Interaction, defaults } from 'ol/interaction';
import { Layer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';
import { BehaviorSubject, Observable, Subject, combineLatest, concatMap, takeUntil } from 'rxjs';
import { areArraysEqual } from '../helper/array';
import { formatArea, formatLength } from '../helper/coordinates';
import { debounce } from '../helper/debounce';
import { DrawElementHelper } from '../helper/draw-element-helper';
import { GeoadminService } from '../map-layer/geoadmin/geoadmin.service';
import { GeoJSONService } from '../map-layer/geojson/geojson.service';
import { WmsService } from '../map-layer/wms/wms.service';
import { DEFAULT_COORDINATES, DEFAULT_ZOOM } from '../session/default-map-values';
import { I18NService } from '../state/i18n.service';
import { ZsMapSources } from '../state/map-sources';
import { ZsMapStateService } from '../state/state.service';
import { SyncService } from '../sync/sync.service';
import { ZsMapBaseDrawElement } from './elements/base/base-draw-element';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { ZsMapBaseLayer } from './layers/base-layer';
import { MapModifyService } from './map-modify.service';
import { MapOverlayService } from './map-overlay.service';
import { MapPrintService } from './map-print.service';
import { MapSelectService } from './map-select.service';

export const LAYER_Z_INDEX_CURRENT_LOCATION = 1000000;
export const LAYER_Z_INDEX_NAVIGATION_LAYER = 1000001;
export const LAYER_Z_INDEX_DEVICE_TRACKING = 1000002;
export const LAYER_Z_INDEX_PRINT_DIMENSIONS = 1000100;

@Injectable({
  providedIn: 'root',
})
export class MapRendererService {
  public i18n = inject(I18NService);
  private _sync = inject(SyncService);
  private geoAdminService = inject(GeoadminService);
  private wmsService = inject(WmsService);
  private geoJSONService = inject(GeoJSONService);

  private _ngUnsubscribe = new Subject<void>();
  private _map!: OlMap;
  private _view!: OlView;
  private _scaleLine!: ScaleLine;
  private _attribution!: Attribution;
  private _geolocation!: OlGeolocation;
  private _mapInteractions!: Interaction[];
  private _mapLayer: Layer = new Layer({
    zIndex: 0,
  });
  private _navigationLayer!: VectorLayer<VectorSource>;
  private _deviceTrackingLayer!: VectorLayer<VectorSource>;
  private _devicePositionFlag!: Feature;
  private _devicePositionFlagLocation!: Point;
  public isDevicePositionFlagVisible = false;
  private _positionFlag!: Feature;
  private _positionFlagLocation!: Point;

  private _layerCache: Record<string, ZsMapBaseLayer> = {};
  private _allLayers: VectorLayer<VectorSource>[] = [];

  private _currentDrawInteraction: Draw | undefined;
  private _mapLayerCache: Map<string, Layer> = new Map();

  private _currentSketch: FeatureLike | undefined;
  private _drawHole!: DrawHole;
  private _currentSketchSize = new BehaviorSubject<string | null>(null);
  private _mousePosition = new BehaviorSubject<number[]>([0, 0]);
  private existingCurrentLocations: VectorLayer<VectorSource<Feature<Point>>> | undefined;
  public connectionCount = new BehaviorSubject<number>(0);

  private _select = inject(MapSelectService);
  private _modify = inject(MapModifyService);
  private _overlay = inject(MapOverlayService);
  private _print = inject(MapPrintService);
  private _state = inject(ZsMapStateService);
  private _drawElementCache: Record<string, { layer: string | undefined; element: ZsMapBaseDrawElement }> = {};

  public terminate() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
    //as the service stay alive also if map page is leaved (and this function is callen), need to clear all now invalid caches and lists
    for (const layer of this._allLayers) {
      this._map.removeLayer(layer);
      layer.getSource()?.clear();
      layer.getRenderer()?.dispose();
      layer.setSource(null);
    }
    this._layerCache = {};
    this._allLayers = [];
    this._mapLayerCache = new Map();
    this._drawElementCache = {};
    this._mapLayer = new Layer({
      zIndex: 0,
    });
  }

  public initialize({
    mapElement,
    buttons,
  }: {
    mapElement: Signal<ElementRef>;
    buttons: {
      delete: Signal<MatButton>;
      rotate: Signal<MatButton>;
      copy: Signal<MatButton>;
      draw: Signal<MatButton>;
      close: Signal<MatButton>;
    };
  }) {
    this._state
      .observeShowCurrentLocation$()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((show) => {
        this.isDevicePositionFlagVisible = show;
        if (!this._deviceTrackingLayer) return;

        if (!show) {
          this._sync.publishCurrentLocation(undefined);
        }

        // only track if the position flag is visible
        this._deviceTrackingLayer.setVisible(this.isDevicePositionFlagVisible);
        this._geolocation.setTracking(this.isDevicePositionFlagVisible);

        this._geolocation.on('change', () => {
          const coordinates = this._geolocation.getPosition();
          if (!coordinates) return;
          const longLat = transform(coordinates, this._view.getProjection(), 'EPSG:4326');
          this._sync.publishCurrentLocation({ long: longLat[0], lat: longLat[1] });
        });

        this._geolocation.once('change:position', () => {
          const coordinates = this._geolocation.getPosition();

          this._devicePositionFlagLocation = coordinates ? new Point(coordinates) : new Point([0, 0]);

          this._devicePositionFlag.setGeometry(this._devicePositionFlagLocation);
          this._devicePositionFlag.changed();
        });
      });

    this._state
      .observeCurrentMapCenter$()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((coordinates) => {
        if (coordinates?.[0] && coordinates?.[1] && this._map) {
          this._map.getView().animate({
            center: transform(coordinates, 'EPSG:4326', 'EPSG:3857'),
            zoom: 14,
          });
        }
      });

    this._sync
      .observeConnections()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((connections) => {
        this.connectionCount.next(connections.length);
        if (this.existingCurrentLocations) {
          this._map.removeLayer(this.existingCurrentLocations);
        }
        const currentLocationFeatures: Feature<Point>[] = [];
        for (const connection of connections) {
          const currentLocation = connection.currentLocation;
          if (!currentLocation) continue;

          const coordinates = transform([currentLocation.long, currentLocation.lat], 'EPSG:4326', 'EPSG:3857');
          const locationFlag = new Feature({
            geometry: new Point(coordinates),
          });

          locationFlag.setStyle(
            new Style({
              image: new Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: 'assets/img/person_pin.svg',
                scale: 2.5,
              }),
            }),
          );

          currentLocationFeatures.push(locationFlag);
        }

        if (currentLocationFeatures.length === 0) return;

        const navigationSource = new VectorSource({
          features: currentLocationFeatures,
        });
        this.existingCurrentLocations = new VectorLayer({
          source: navigationSource,
        });
        this.existingCurrentLocations.setZIndex(LAYER_Z_INDEX_CURRENT_LOCATION);
        this._map.addLayer(this.existingCurrentLocations);
      });

    this._view = new OlView({
      center: DEFAULT_COORDINATES, // will be overwritten once session is loaded via display state
      zoom: DEFAULT_ZOOM, // will be overwritten once session is loaded via display state
    });

    this._mapInteractions = [
      this._select.initialize({
        _state: this._state,
        _renderer: this,
        _modify: this._modify,
        _overlay: this._overlay,
      }),
      this._modify.initialize({
        _state: this._state,
        _renderer: this,
        _select: this._select,
        _overlay: this._overlay,
      }),
    ];

    this._scaleLine = new ScaleLine({
      units: 'metric',
      bar: true,
      steps: 4,
      text: true,
      minWidth: 140,
    });

    this._attribution = new Attribution({
      collapsible: false,
    });

    this._map = new OlMap({
      target: mapElement().nativeElement,
      view: this._view,
      controls: [this._scaleLine, this._attribution],
      interactions: defaults({
        doubleClickZoom: false,
        pinchRotate: true,
        shiftDragZoom: false,
      }).extend(this._mapInteractions),
    });

    this._geolocation = new OlGeolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: this._view.getProjection(),
    });

    const _coords = this._geolocation.getPosition();
    this._positionFlagLocation = _coords ? new Point(_coords) : new Point([0, 0]);
    this._positionFlag = new Feature({
      geometry: this._positionFlagLocation,
    });

    this._positionFlag.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/place.png',
          scale: 0.15,
        }),
      }),
    );

    const navigationSource = new VectorSource({
      features: [this._positionFlag],
    });
    this._navigationLayer = new VectorLayer({
      source: navigationSource,
    });
    this._navigationLayer.setZIndex(LAYER_Z_INDEX_NAVIGATION_LAYER);

    this._map.addLayer(this._navigationLayer);

    this._map.on('singleclick', (event) => {
      if (this._map.hasFeatureAtPixel(event.pixel)) {
        const feature = this._map.forEachFeatureAtPixel(event.pixel, (feature) => feature, { hitTolerance: 10 });
        if (feature === this._positionFlag && !this._state.isReadOnly()) {
          this._overlay.setFlagButtonPosition(this._positionFlagLocation.getCoordinates());
          this._overlay.toggleFlagButtons(true);
        } else {
          this._overlay.toggleFlagButtons(false);
        }
      } else {
        this._overlay.toggleFlagButtons(false);
      }
    });

    this._devicePositionFlagLocation = _coords ? new Point(_coords) : new Point([0, 0]);
    this._devicePositionFlag = new Feature({
      geometry: this._devicePositionFlagLocation,
    });
    this._devicePositionFlag.setStyle(
      new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      }),
    );

    const deviceTrackingSource = new VectorSource({
      features: [this._devicePositionFlag],
    });
    this._deviceTrackingLayer = new VectorLayer({
      source: deviceTrackingSource,
      visible: false,
    });
    this._deviceTrackingLayer.setZIndex(LAYER_Z_INDEX_DEVICE_TRACKING);
    this._map.addLayer(this._deviceTrackingLayer);

    this._map.on('moveend', () => {
      this._state.setMapCenter(this._view.getCenter() || [0, 0]);
    });

    this._map.on('pointermove', (event) => {
      this._mousePosition.next(event.pixel);
      this._state.setCoordinates(event.coordinate);
      let sketchSize: string | null = null;
      this._map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
        if (feature) {
          const geom = feature.getGeometry();
          if (geom instanceof Polygon) {
            sketchSize = formatArea(geom);
          } else if (geom instanceof LineString) {
            sketchSize = formatLength(geom);
          }
        }
      });
      this._currentSketchSize.next(sketchSize);
    });

    const debouncedZoomSave = debounce(() => {
      this._state.setMapZoom(this._view.getZoom() ?? 10);
    }, 500);

    this._view.on('change:resolution', () => {
      debouncedZoomSave();
    });

    this._state
      .observeMapCenter()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((center) => {
        if (!areArraysEqual(this._view.getCenter() || [0, 0], center)) {
          if (!center[0] && !center[1]) {
            center = DEFAULT_COORDINATES;
          }
          this._view.setCenter(center);
        }
      });

    this._state
      .observeMapZoom()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((zoom) => {
        if (this._view.getZoom() !== zoom) {
          if (!zoom) {
            zoom = DEFAULT_ZOOM;
          }
          this._view.setZoom(zoom);
        }
      });

    this._state
      .observeDPI()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((dpi) => {
        this._scaleLine.setDpi(dpi);
      });

    this._map.addLayer(this._mapLayer);

    this._state
      .observeElementToDraw()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((element) => {
        if (element) {
          const interaction = DrawElementHelper.createDrawHandlerForType(element, this._state);
          interaction.on('drawstart', (event) => {
            this._currentSketch = event.feature;
          });
          interaction.on('drawend', () => {
            this._currentSketch = undefined;
            this._state.cancelDrawing();
          });
          this._currentDrawInteraction = interaction;
          this._map.addInteraction(this._currentDrawInteraction);
        } else {
          if (this._currentDrawInteraction) {
            this._map.removeInteraction(this._currentDrawInteraction);
          }
          this._currentDrawInteraction = undefined;
        }
      });

    this._state
      .observeMapSource()
      .pipe(
        takeUntil(this._ngUnsubscribe),
        concatMap(async (source) => {
          this._map.removeLayer(this._mapLayer);
          this._mapLayer = await ZsMapSources.get(source);
          this._map.getLayers().insertAt(0, this._mapLayer);
        }),
      )
      .subscribe();

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
            this._allLayers.push(layer.getOlLayer());
            this._map.addLayer(layer.getOlLayer());
          }
        }
      });

    this._map.getLayers().on(['add', 'remove'], () => {
      this._state.updatePrintState((draft: IZsMapPrintState) => {
        draft.attributions = this._map
          .getAllLayers()
          .filter((layer) => layer.isVisible())
          .flatMap((layer) => layer.getAttributions(this._view));
      });
    });

    this._state
      .observeSelectedMapLayers$()
      .pipe(
        takeUntil(this._ngUnsubscribe),
        concatMap(async (mapLayers) => {
          const cacheNames = Array.from(this._mapLayerCache.keys());
          mapLayers = mapLayers.filter((el) => !cacheNames.includes(el.fullId));
          for (const mapLayer of mapLayers) {
            let olLayers: Layer[];
            if (!mapLayer.source) {
              olLayers = await this.geoAdminService.createGeoAdminLayer(mapLayer as GeoAdminMapLayer);
            } else if (mapLayer.type === 'wmts') {
              olLayers = await this.wmsService.createWMTSLayer(mapLayer);
            } else if (mapLayer.type === 'wms') {
              olLayers = await this.wmsService.createWMSLayer(mapLayer as WMSMapLayer);
            } else if (mapLayer.type === 'wms_custom') {
              olLayers = await this.wmsService.createWMSCustomLayer(mapLayer as WMSMapLayer);
            } else if (mapLayer.type === 'geojson') {
              olLayers = await this.geoJSONService.createGeoJSONLayer(mapLayer as GeoJSONMapLayer);
            } else if (mapLayer.type === 'csv') {
              olLayers = await this.geoJSONService.createCsvLayer(mapLayer as CsvMapLayer);
            } else {
              console.error('unknown layer type', mapLayer.type, 'for source', mapLayer.source, mapLayer);
              continue;
            }
            olLayers.forEach((olLayer, index) => {
              this._map.addLayer(olLayer);
              const name = index > 0 ? `${mapLayer.fullId}:${index}` : mapLayer.fullId;
              this._mapLayerCache.set(name, olLayer);
              let searchFunc: SearchFunction;
              if (
                (mapLayer.type === 'geojson' || mapLayer.type === 'csv') &&
                (mapLayer as GeoJSONMapLayer).searchable
              ) {
                searchFunc = (searchText: string, maxResultCount?: number) => {
                  return Promise.resolve(
                    this.geoJSONService.search(
                      searchText,
                      mapLayer as GeoJSONMapLayer,
                      (olLayer.getSource() as VectorSource).getFeatures(),
                      maxResultCount,
                    ),
                  );
                };
                this._state.addSearch(searchFunc, mapLayer.label, (mapLayer as GeoJSONMapLayer).searchMaxResultCount);
              }

              // observe mapLayer changes
              this._state.observeMapLayers$(mapLayer.fullId).subscribe({
                next: (updatedLayer) => {
                  if (updatedLayer) {
                    olLayer.setZIndex(updatedLayer.zIndex);
                    olLayer.setOpacity(updatedLayer.opacity);
                    olLayer.setVisible(!updatedLayer.hidden && updatedLayer.opacity !== 0);
                  }
                },
                complete: () => {
                  this._map.removeLayer(olLayer);
                  if (searchFunc) {
                    this._state.removeSearch(searchFunc);
                  }
                  this._mapLayerCache.delete(name);
                },
              });
            });
          }
        }),
      )
      .subscribe(() => {
        //real handling is done in concatMap as this can handle async correctly (wait for finish before next is started)
      });

    this._state
      .observePositionFlag()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((positionFlag) => {
        this._navigationLayer.setVisible(positionFlag.isVisible);
        this._positionFlagLocation.setCoordinates(positionFlag.coordinates);
        this._positionFlag.changed();
      });

    this._print.initialize({
      renderer: this,
    });

    this._initDrawHole();

    this._overlay.initialize({
      _renderer: this,
      _select: this._select,
      buttons,
    });

    combineLatest([
      this._state.observeDrawElements(),
      this._state.observeHiddenSymbols(),
      this._state.observeHiddenFeatureTypes(),
    ]).subscribe(([drawElements, hiddenSymbols, hiddenFeatureTypes]) => {
      const activeLayer = this._state.getActiveLayer();
      if (!activeLayer || !this._state.getLayer(activeLayer.getId())) {
        return;
      }
      // Filter out hidden elements
      drawElements = drawElements.filter((element) => {
        const feature = element.getOlFeature();
        const filterType = element.elementState?.type as string;
        const hidden = hiddenSymbols.includes(feature?.get('sig')?.id) || hiddenFeatureTypes.includes(filterType);
        return !hidden;
      });

      for (const element of drawElements) {
        if (!this._drawElementCache[element.getId()]) {
          this._drawElementCache[element.getId()] = {
            element,
            layer: undefined,
          };
          element
            .observeLayer()
            .pipe(takeUntil(element.observeUnsubscribe()))
            .subscribe((layer) => {
              const cache = this._drawElementCache[element.getId()];
              const feature = element.getOlFeature();
              if (cache.layer) {
                const cachedLayer = this._state.getLayer(cache.layer);
                if (cachedLayer) {
                  cachedLayer.removeOlFeature(feature);
                }
              }
              cache.layer = layer;
              const newLayer = this._state.getLayer(layer ?? '');
              newLayer?.addOlFeature(feature);
            });
        }
      }

      // Removed old elements
      for (const element of Object.values(this._drawElementCache)) {
        if (drawElements.every((e) => e.getId() !== element.element.getId())) {
          // New elements do not contain element from cache
          this._state.getLayer(element.layer ?? '')?.removeOlFeature(element.element.getOlFeature());
          delete this._drawElementCache[element.element.getId()];
        }
      }
    });
  }

  private _initDrawHole() {
    this._drawHole = new DrawHole({
      layers: this._allLayers,
      type: 'Polygon',
    });
    this._drawHole.setActive(false);
    this._map.addInteraction(this._drawHole);

    this._drawHole.on('drawend', () => {
      this._state.setDrawHoleMode(false);
    });

    this._state
      .observeDrawHoleMode()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((drawHoleMode) => {
        this._drawHole.setActive(drawHoleMode);
      });
  }

  public getFeatureInsideCluster(feature?: FeatureLike) {
    if (feature?.get(ZsMapOLFeatureProps.IS_DRAW_ELEMENT)) {
      return feature;
    }
    const features = feature?.get('features');
    if (features?.length > 0) {
      return features[0];
    }
    return feature;
  }

  public getCachedDrawElement(id: string) {
    return this._drawElementCache[id];
  }

  public observeMousePosition(): Observable<number[]> {
    return this._mousePosition.asObservable();
  }

  public observeCurrentSketchSize(): Observable<string | null> {
    return this._currentSketchSize.asObservable();
  }

  public getView(): OlView {
    return this._view;
  }

  public getMap(): OlMap {
    return this._map;
  }

  public getLayers(): VectorLayer<VectorSource>[] {
    return this._allLayers;
  }

  public getMapInteractions(): Interaction[] {
    return this._mapInteractions;
  }

  public getScaleLine(): ScaleLine {
    return this._scaleLine;
  }
}
