import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { MatButton, MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { IZsMapPrintState, SearchFunction, Sign, ZsMapDrawElementStateType } from '@zskarte/types';
import { CsvMapLayer, GeoAdminMapLayer, GeoJSONMapLayer, WMSMapLayer } from '@zskarte/types';
import { Collection, Feature, Geolocation as OlGeolocation, Overlay } from 'ol';
import DrawHole from 'ol-ext/interaction/DrawHole';
import { FeatureLike } from 'ol/Feature';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { Attribution, ScaleLine } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { getCenter } from 'ol/extent';
import { LineString, Point, Polygon, SimpleGeometry } from 'ol/geom';
import { Draw, Interaction, Modify, Select, Translate, defaults } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import { Layer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { getPointResolution, transform } from 'ol/proj';
import TileSource from 'ol/source/Tile';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  concatMap,
  filter,
  firstValueFrom,
  map,
  skip,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { areArraysEqual } from '../helper/array';
import { formatArea, formatLength, indexOfPointInCoordinateGroup } from '../helper/coordinates';
import { debounce } from '../helper/debounce';
import { DrawElementHelper } from '../helper/draw-element-helper';
import { projectionByIndex } from '../helper/projections';
import { GeoadminService } from '../map-layer/geoadmin/geoadmin.service';
import { GeoJSONService } from '../map-layer/geojson/geojson.service';
import { WmsService } from '../map-layer/wms/wms.service';
import { DEFAULT_COORDINATES, DEFAULT_RESOLUTION, DEFAULT_ZOOM, MM_PER_INCHES } from '../session/default-map-values';
import { SessionService } from '../session/session.service';
import { I18NService } from '../state/i18n.service';
import { ZsMapSources } from '../state/map-sources';
import { ZsMapStateService } from '../state/state.service';
import { SyncService } from '../sync/sync.service';
import { DrawStyle } from './draw-style';
import { ZsMapBaseDrawElement } from './elements/base/base-draw-element';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { ZsMapBaseLayer } from './layers/base-layer';

const LAYER_Z_INDEX_CURRENT_LOCATION = 1000000;
const LAYER_Z_INDEX_NAVIGATION_LAYER = 1000001;
const LAYER_Z_INDEX_DEVICE_TRACKING = 1000002;
const LAYER_Z_INDEX_PRINT_DIMENSIONS = 1000100;

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, MatIcon, MatMiniFabButton, MatButtonModule],
})
export class MapRendererComponent implements AfterViewInit {
  private _state = inject(ZsMapStateService);
  private _sync = inject(SyncService);
  private _session = inject(SessionService);
  i18n = inject(I18NService);
  private geoAdminService = inject(GeoadminService);
  private dialog = inject(MatDialog);
  private wmsService = inject(WmsService);
  private geoJSONService = inject(GeoJSONService);

  readonly mapElement = viewChild.required<ElementRef>('mapElement');
  readonly deleteElement = viewChild.required<MatButton>('delete');
  readonly rotateElement = viewChild.required<MatButton>('rotate');
  readonly copyElement = viewChild.required<MatButton>('copy');
  readonly drawElement = viewChild.required<MatButton>('draw');
  readonly closeElement = viewChild.required<MatButton>('close');
  removeButton?: Overlay;
  rotateButton?: Overlay;
  copyButton?: Overlay;
  drawButton?: Overlay;
  closeButton?: Overlay;
  ROTATE_OFFSET_X = 30;
  ROTATE_OFFSET_Y = -30;

  private _ngUnsubscribe = new Subject<void>();
  private _map!: OlMap;
  private _view!: OlView;
  private _scaleLine!: ScaleLine;
  private _attribution!: Attribution;
  private _geolocation!: OlGeolocation;
  private _select!: Select;
  private _translate!: Translate;
  private _modify!: Modify;
  private _mapInteractions!: Interaction[];
  private _mapLayer: Layer = new Layer({
    zIndex: 0,
  });
  private _navigationLayer!: VectorLayer<VectorSource>;
  private _deviceTrackingLayer!: VectorLayer<VectorSource>;
  private _printDimensionLayer!: VectorLayer<VectorSource>;
  private _devicePositionFlag!: Feature;
  private _devicePositionFlagLocation!: Point;
  public isDevicePositionFlagVisible = false;
  private _positionFlag!: Feature;
  private _positionFlagLocation!: Point;
  private _printDimensionArea!: Feature<Polygon>;
  private _layerCache: Record<string, ZsMapBaseLayer> = {};
  private _allLayers: VectorLayer<VectorSource>[] = [];
  private _drawElementCache: Record<string, { layer: string | undefined; element: ZsMapBaseDrawElement }> = {};
  private _currentDrawInteraction: Draw | undefined;
  private _printAreaInteraction: Draw | undefined;
  private _printAreaPositionInteraction: Translate | undefined;
  private _mapLayerCache: Map<string, Layer> = new Map();
  private _modifyCache = new Collection<Feature>([]);
  private _currentSketch: FeatureLike | undefined;
  private _rotating = false;
  private _initialRotation = 0;
  private _drawHole!: DrawHole;
  private _mergeMode = false;
  private _disabledForPrint = false;
  public currentSketchSize = new BehaviorSubject<string | null>(null);
  public mousePosition = new BehaviorSubject<number[]>([0, 0]);
  public mouseProjection: Observable<string>;
  public selectedProjectionIndex = 0;
  public selectedFeature = new BehaviorSubject<Feature<SimpleGeometry> | undefined>(undefined);
  public selectedFeatureCoordinates: Observable<string>;
  public coordinates = new BehaviorSubject<number[]>([0, 0]);
  public isReadOnly = new BehaviorSubject<boolean>(false);
  public selectedVertexPoint = new BehaviorSubject<number[] | null>(null);
  private existingCurrentLocations: VectorLayer<VectorSource<Feature<Point>>> | undefined;
  public connectionCount = new BehaviorSubject<number>(0);
  public isOnline = new BehaviorSubject<boolean>(true);
  public canUndo = new BehaviorSubject<boolean>(false);
  public canRedo = new BehaviorSubject<boolean>(false);

  constructor() {
    const _state = this._state;

    _state
      .observeSelectedElement$()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((element) => {
        if (element) {
          this.selectedFeature.next(element.getOlFeature() as Feature<SimpleGeometry>);
        } else {
          this.selectedFeature.next(undefined);
          this.toggleEditButtons(false);
        }
      });
    this.selectedFeatureCoordinates = this.selectedFeature.pipe(
      map((feature) => {
        const coords = this.getFeatureCoordinates(feature);
        return projectionByIndex(this.selectedProjectionIndex).translate(coords);
      }),
    );
    this.mouseProjection = this._state.getCoordinates().pipe(
      takeUntil(this._ngUnsubscribe),
      map((coords) => {
        const transform = this.transformToCurrentProjection(coords) ?? [];
        return projectionByIndex(this.selectedProjectionIndex).translate(transform);
      }),
    );

    this._session
      .observeIsOnline()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isOnline) => {
        this.isOnline.next(isOnline);
      });

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
          const longlat = transform(coordinates, this._view.getProjection(), 'EPSG:4326');
          this._sync.publishCurrentLocation({ long: longlat[0], lat: longlat[1] });
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
    combineLatest([
      this.selectedVertexPoint.asObservable(),
      this._state.observeSelectedElement$().pipe(
        filter(Boolean),
        // get feature each time the coordinates change
        switchMap((element) => element.observeCoordinates().pipe(map(() => element.getOlFeature()))),
        map((feature) => DrawStyle.getIconCoordinates(feature, this._view.getResolution() ?? 1)[1]),
      ),
    ])
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(([vertexPoint, featurePoint]) => {
        // prioritize vertexPoint
        const coordinates = vertexPoint ?? featurePoint;
        if (Array.isArray(coordinates)) {
          this.removeButton?.setPosition(coordinates);
          this.rotateButton?.setPosition(coordinates);
          this.copyButton?.setPosition(coordinates);
        }
      });

    this._state
      .observeMergeMode()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((mode) => {
        this._mergeMode = mode;
      });

    this._state.observeIsReadOnly().pipe(takeUntil(this._ngUnsubscribe)).subscribe(this.isReadOnly);

    this._state
      .observeHistory()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(({ canUndo, canRedo }) => {
        this.canUndo.next(canUndo);
        this.canRedo.next(canRedo);
      });
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  public ngAfterViewInit(): void {
    this._select = new Select({
      hitTolerance: 10,
      style: (feature: FeatureLike, resolution: number) => {
        return DrawStyle.styleFunctionSelect(feature, resolution, true);
      },
      layers: this._allLayers,
    });
    this._state
      .observeSelectedFeature$()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((element) => {
        if (!element) {
          this._select.getFeatures().clear();
        }
      });
    this._select.on('select', (event) => {
      this._modifyCache.clear();
      this.toggleEditButtons(false);
      for (const cluster of event.selected) {
        const feature = this.getFeatureInsideCluster(cluster);
        const nextElement = this._drawElementCache[feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID)];

        if (this._mergeMode) {
          const selectedElement = this._drawElementCache[this.selectedFeature.getValue()?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID)];
          this._state.mergePolygons(selectedElement.element, nextElement.element);
        } else {
          if (feature && !feature.get('sig')?.protected) {
            this._modifyCache.push(feature);

            // Only add the cluster to the modify cache if we are in clustering mode
            if (feature !== cluster) {
              this._modifyCache.push(cluster);
            }
          }
          this._state.setSelectedFeature(feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
          // reset selectedVertexPoint, since we selected a whole feature.
          this.selectedVertexPoint.next(null);

          // only show buttons on select for Symbols
          if (!this.isReadOnly.getValue() && nextElement?.element?.elementState?.type === ZsMapDrawElementStateType.SYMBOL) {
            this.toggleEditButtons(true, true);
          }
        }
      }

      if (event.selected.length === 0) {
        this._state.resetSelectedFeature();
      }
    });

    this._modify = new Modify({
      features: this._modifyCache,
      condition: () => {
        if (!this.areFeaturesModifiable() || this.isReadOnly.getValue()) {
          this.toggleEditButtons(false);
          return false;
        }

        if (this._modify['vertexFeature_'] && this._modify['lastPointerEvent_']) {
          this.selectedVertexPoint.next(this._modify['vertexFeature_'].getGeometry().getCoordinates());
          this.toggleEditButtons(true);
        }
        return true;
      },
    });

    this._modify.on('modifystart', (event) => {
      this._currentSketch = this.getFeatureInsideCluster(event.features.getArray()[0]);
      this.toggleEditButtons(false);
    });

    this._modify.on('modifyend', (e) => {
      if (e.features.getLength() <= 0) {
        return;
      }

      this._currentSketch = undefined;
      // only first feature is relevant
      const feature = this.getFeatureInsideCluster(e.features.getArray()[0] as Feature<SimpleGeometry>);
      const element = this._drawElementCache[feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID)];
      element.element.setCoordinates(feature.getGeometry()?.getCoordinates() ?? []);
      if (this._modify['vertexFeature_']) {
        this.selectedVertexPoint.next(this._modify['vertexFeature_'].getGeometry().getCoordinates());
        this.toggleEditButtons(true);
      }
    });

    this._translate = new Translate({
      features: this._modifyCache,
      condition: () => this.areFeaturesModifiable(),
    });

    this._translate.on('translatestart', () => {
      this.toggleEditButtons(false);
    });

    this._translate.on('translateend', (e) => {
      if (e.features.getLength() <= 0) {
        return;
      }
      // only the first feature is relevant
      const feature = this.getFeatureInsideCluster(e.features.getArray()[0]);
      const element = this._drawElementCache[feature.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID)];
      element.element.setCoordinates((feature.getGeometry() as SimpleGeometry).getCoordinates() as number[]);

      if (element.element.elementState?.type === ZsMapDrawElementStateType.SYMBOL) {
        // Hack to ensure, the buttons show up at the correct location immediately
        this.selectedVertexPoint.next(DrawStyle.getIconCoordinates(feature, this._view.getResolution() ?? 1)[1]);
        // Always allow rotation for symbols on translate end
        this.toggleEditButtons(true, true);
      } else {
        this.toggleEditButtons(true);
      }
    });
    this._mapInteractions = [this._select, this._modify, this._translate];

    this._view = new OlView({
      center: DEFAULT_COORDINATES, // will be overwritten once session is loaded via display state
      zoom: DEFAULT_ZOOM, // will be overwritten once session is loaded via display state
    });

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
      target: this.mapElement().nativeElement,
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
        if (feature === this._positionFlag && !this.isReadOnly.getValue()) {
          this.setFlagButtonPosition(this._positionFlagLocation.getCoordinates());
          this.toggleFlagButtons(true);
        } else {
          this.toggleFlagButtons(false);
        }
      } else {
        this.toggleFlagButtons(false);
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
      this.mousePosition.next(event.pixel);
      this._state.setCoordinates(event.coordinate);
      let sketchSize: string | null = null;
      if (this._currentSketch) {
        const geom = this._currentSketch.getGeometry();
        if (geom instanceof Polygon) {
          sketchSize = formatArea(geom);
        } else if (geom instanceof LineString) {
          sketchSize = formatLength(geom);
        }
      }
      this.currentSketchSize.next(sketchSize);
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
      .subscribe(() => {
        //real handling is done in concatMap as this can handle async correctly (wait for finish before next is started)
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

    combineLatest([this._state.observeDrawElements(), this._state.observeHiddenSymbols(), this._state.observeHiddenFeatureTypes()])
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(([drawElements, hiddenSymbols, hiddenFeatureTypes]) => {
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
            this._state.getLayer(element.layer ?? '').removeOlFeature(element.element.getOlFeature());
            // skipcq: JS-0320
            delete this._drawElementCache[element.element.getId()];
          }
        }
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
              if ((mapLayer.type === 'geojson' || mapLayer.type === 'csv') && (mapLayer as GeoJSONMapLayer).searchable) {
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

    this._printDimensionArea = new Feature({
      geometry: new Polygon([
        [
          this._view.getCenter() || DEFAULT_COORDINATES,
          this._view.getCenter() || DEFAULT_COORDINATES,
          this._view.getCenter() || DEFAULT_COORDINATES,
        ],
      ]),
    });
    const printDimensionSource = new VectorSource({
      features: [this._printDimensionArea],
    });
    this._printDimensionLayer = new VectorLayer({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source: printDimensionSource as any,
      visible: false,
    });
    this._printDimensionLayer.setZIndex(LAYER_Z_INDEX_PRINT_DIMENSIONS);
    this._map.addLayer(this._printDimensionLayer);

    this._state.observePrintExtent().pipe(skip(1), takeUntil(this._ngUnsubscribe)).subscribe(this.updatePrintViewExtent.bind(this));

    this._state
      .observePrintState()
      .pipe(skip(2), takeUntil(this._ngUnsubscribe))
      .subscribe((printState) => {
        if (printState.printView && printState.emptyMap) {
          this._allLayers.forEach((l) => {
            l.setVisible(false);
          });
        } else {
          this._allLayers.forEach((l) => {
            l.setVisible(true);
          });
        }
        this._printDimensionLayer.setVisible(printState.printView && !this._disabledForPrint);
        this.updatePrintViewInteractions(printState);
        this.updatePrintViewCallbacks(printState);
      });

    this.initButtons();
    this.initDrawHole();
  }

  /**
   * Initializes the drawHole functionality for Polygons
   */
  initDrawHole() {
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

  initButtons() {
    this.removeButton = new Overlay({
      element: this.deleteElement()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, 30],
    });
    this.copyButton = new Overlay({
      element: this.copyElement()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [-30, 30],
    });
    this.rotateButton = new Overlay({
      element: this.rotateElement()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [this.ROTATE_OFFSET_X, this.ROTATE_OFFSET_Y],
    });

    this.drawButton = new Overlay({
      element: this.drawElement()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, 15],
    });

    this.closeButton = new Overlay({
      element: this.closeElement()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, -45],
    });

    this.rotateButton.getElement()?.addEventListener('mousedown', () => this.startRotating());
    this.rotateButton.getElement()?.addEventListener('touchstart', () => this.startRotating());
    this.removeButton.getElement()?.addEventListener('click', () => this.removeFeature());
    this.copyButton.getElement()?.addEventListener('click', async () => {
      const coordinationGroup = await this.getCoordinationGroupOfLastPoint();
      this.toggleEditButtons(false);
      if (coordinationGroup) {
        await this.doCopySign(coordinationGroup?.feature);
      }
    });
    this.drawButton.getElement()?.addEventListener('click', () => this.toggleDrawingDialog());
    // hide position flag this.zsMapStateService.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
    this.closeButton.getElement()?.addEventListener('click', () => this.hidePositionFlag());

    this._map.addOverlay(this.removeButton);
    this._map.addOverlay(this.rotateButton);
    this._map.addOverlay(this.copyButton);
    this._map.addOverlay(this.drawButton);
    this._map.addOverlay(this.closeButton);
  }

  async startRotating() {
    const feature = await firstValueFrom(this.selectedFeature);
    if (!feature?.get('sig')) {
      return;
    }
    this._rotating = true;
    this._initialRotation = feature.get('sig').rotation;
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  @HostListener('document:touchcancel')
  stopRotating() {
    this._rotating = false;
  }

  @HostListener('document:mousemove', ['$event'])
  async onMouseMove(event: MouseEvent | TouchEvent) {
    if (!this._rotating) {
      return;
    }

    if (window.TouchEvent && event instanceof TouchEvent && event.targetTouches.length <= 0) {
      return;
    }

    event.preventDefault();

    const feature = await firstValueFrom(this.selectedFeature);

    if (!feature?.get('sig')) {
      return;
    }

    let pageX = 0,
      pageY = 0;
    if (window.TouchEvent && event instanceof TouchEvent) {
      pageX = event.targetTouches[event.targetTouches.length - 1].pageX;
      pageY = event.targetTouches[event.targetTouches.length - 1].pageY;
    } else if (event instanceof MouseEvent) {
      pageX = event.pageX;
      pageY = event.pageY;
    }

    const rect = this.rotateButton?.getElement()?.getBoundingClientRect() ?? { x: 0, y: 0 };

    const radians = Math.atan2(pageX - (rect.x - this.ROTATE_OFFSET_X), pageY - (rect.y - this.ROTATE_OFFSET_Y));
    const degrees = Math.round(radians * (180 / Math.PI) * -1 + 100);
    let rotation = degrees + this._initialRotation;

    // keep the rotation between -180 and 180
    rotation = rotation > 180 ? rotation - 360 : rotation;
    const id = feature?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID);

    // Update the signature in the UI separately from the state, to provide a smooth rotation
    feature.get('sig').rotation = rotation;
    feature.changed();

    // Update the state with the new rotation (debounced)
    this._drawElementCache[id]?.element.updateElementState((draft) => {
      draft.rotation = rotation;
    });
  }

  async removeFeature() {
    const coordinationGroup = await this.getCoordinationGroupOfLastPoint();
    if (coordinationGroup) {
      if (!coordinationGroup.minimalAmountOfPoints) {
        this._modify.removePoint();
      } else if (coordinationGroup.otherCoordinationGroupCount === 0) {
        // It's the last coordination group - we can remove the feature.
        const confirm = this.dialog.open(ConfirmationDialogComponent, {
          data: this.i18n.get('removeFeatureFromMapConfirm'), // this.i18n.get('deleteLastPointOnFeature') + " " + this.i18n.get('removeFeatureFromMapConfirm')
        });
        confirm.afterClosed().subscribe((r) => {
          if (r) {
            this._state.removeDrawElement(coordinationGroup.feature?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
            this._state.resetSelectedFeature();
          }
        });
      } else if (coordinationGroup.coordinateGroupIndex) {
        // It's not the last coordination group - so we need to get rid of the coordination group inside the feature
        const oldCoordinates = coordinationGroup.feature.getGeometry()?.getCoordinates();
        const newCoordinates: Coordinate[] = [];

        if (oldCoordinates) {
          for (let i = 0; i < oldCoordinates.length; i++) {
            if (i !== coordinationGroup.coordinateGroupIndex) {
              newCoordinates.push(oldCoordinates[i]);
            }
          }
          const id = coordinationGroup.feature?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID);
          this._drawElementCache[id]?.element.setCoordinates(newCoordinates);
        }
      }
    }
    this.toggleEditButtons(false);
  }

  private async getCoordinationGroupOfLastPoint() {
    const feature = await firstValueFrom(this.selectedFeature);
    // Since we're working with single select, this should be only one - we iterate it nevertheless for being defensive
    const coordinates = feature?.getGeometry()?.getCoordinates();
    if (coordinates) {
      switch (feature?.getGeometry()?.getType()) {
        case 'Polygon':
          for (let i = 0; i < coordinates.length; i++) {
            const coordinateGroup = coordinates[i];
            if (indexOfPointInCoordinateGroup(coordinateGroup, this.selectedVertexPoint.getValue() ?? []) !== -1) {
              return {
                feature,
                coordinateGroupIndex: i,
                otherCoordinationGroupCount: coordinates.length - 1,
                minimalAmountOfPoints: coordinateGroup.length <= 4,
              };
            }
          }
          return null;
        case 'LineString':
          return {
            feature,
            coordinateGroupIndex: null,
            otherCoordinationGroupCount: 0,
            minimalAmountOfPoints: coordinates.length <= 2,
          };
        case 'Point':
          return {
            feature,
            coordinateGroupIndex: null,
            otherCoordinationGroupCount: 0,
            minimalAmountOfPoints: true,
          };
        default:
          throw Error(`getCoordinationGroupOfLastPoint not implemented for type ${feature?.getGeometry()?.getType()}`);
      }
    }
    return null;
  }

  async doCopySign(feature: Feature<SimpleGeometry>) {
    const sign = feature?.get('sig') as Sign;
    if (!sign || !sign.id) {
      return;
    }
    const layer = await firstValueFrom(this._state.observeActiveLayer());
    this._state.copySymbol(sign.id, layer?.getId());
    this._state.resetSelectedFeature();
  }

  toggleEditButtons(show: boolean, allowRotation = false) {
    this.toggleButton(show, this.removeButton?.getElement());
    this.toggleButton(allowRotation, this.rotateButton?.getElement());
    this.toggleButton(allowRotation, this.copyButton?.getElement());
  }

  toggleFlagButtons(show: boolean) {
    this.toggleButton(show, this.drawButton?.getElement());
    this.toggleButton(show, this.closeButton?.getElement());
  }

  setFlagButtonPosition(coordinates: number[]) {
    this.drawButton?.setPosition(coordinates);
    this.closeButton?.setPosition(coordinates);
  }

  toggleButton(allow: boolean, el?: HTMLElement) {
    if (el) {
      el.style.display = allow && !this.isReadOnly.value ? 'block' : 'none';
    }
  }

  areFeaturesModifiable() {
    return (
      !this.isReadOnly.value &&
      this._modifyCache.getArray().every((clusterOrFeature) => {
        const feature = this.getFeatureInsideCluster(clusterOrFeature);

        // If the feature is a ZS DrawElement, ensure it's not protected
        // Else it's a cluster, ensure it's a cluster with a single feature
        if (clusterOrFeature.get(ZsMapOLFeatureProps.IS_DRAW_ELEMENT)) {
          return feature.get('sig') && !feature.get('sig').protected;
        } else {
          return (clusterOrFeature.get('features')?.length ?? 0) <= 1;
        }
      })
    );
  }

  getFeatureCoordinates(feature: Feature | null | undefined): Coordinate {
    const center = getCenter(feature?.getGeometry()?.getExtent() ?? []);
    return this.transformToCurrentProjection(center) ?? [];
  }

  transformToCurrentProjection(coordinates: Coordinate) {
    return projectionByIndex(this.selectedProjectionIndex).transformTo(coordinates);
  }

  toggleDrawingDialog() {
    const posFlag = this._state.getCurrentPositionFlag();
    const coordinates = posFlag.coordinates;
    if (coordinates) {
      this._state.drawSignatureAtCoordinate(coordinates);
      this.toggleFlagButtons(false);
    }
  }

  hidePositionFlag() {
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
    this.toggleFlagButtons(false);
  }

  /**
   * If handed a cluster, returns the first feature inside the cluster
   * Else returns the feature itself
   */
  // skipcq:  JS-0105
  private getFeatureInsideCluster(feature?: FeatureLike) {
    if (feature?.get(ZsMapOLFeatureProps.IS_DRAW_ELEMENT)) {
      return feature;
    }

    const features = feature?.get('features');
    if (features?.length > 0) {
      return features[0];
    }
    return feature;
  }

  private updatePrintViewExtent(printExtent) {
    let printCenter = this._state.getPrintCenter();
    if (!printCenter) {
      printCenter = this._view.getCenter();
      if (printCenter) {
        this._state.updatePrintState((draft: IZsMapPrintState) => {
          draft.printCenter = printCenter;
        });
      }
    }
    if (printCenter) {
      const geometry = this._printDimensionArea.getGeometry();
      if (geometry) {
        const scale = printExtent.scale ?? printExtent.autoScaleVal ?? 10;
        /*
        const dpi = printExtent.dpi;
        const resolution = (scale * 1000) / INCHES_PER_METER / dpi;
        const pointResolution = getPointResolution(this._view.getState().projection, resolution, printCenter, 'm');
        const reversePointResolution = (resolution / pointResolution) * resolution;
        const deltaX = (reversePointResolution * ((printExtent.dimensions[0] / MM_PER_INCHES) * dpi)) / 2;
        const deltaY = (reversePointResolution * ((printExtent.dimensions[1] / MM_PER_INCHES) * dpi)) / 2;
        */
        const resolution = scale;
        const pointResolution = getPointResolution(this._view.getState().projection, resolution, printCenter, 'm');
        const reversePointResolution = (resolution / pointResolution) * resolution;
        const deltaX = (reversePointResolution * printExtent.dimensions[0]) / 2;
        const deltaY = (reversePointResolution * printExtent.dimensions[1]) / 2;
        const boxCoordinates = [
          [
            [printCenter[0] - deltaX, printCenter[1] - deltaY],
            [printCenter[0] + deltaX, printCenter[1] - deltaY],
            [printCenter[0] + deltaX, printCenter[1] + deltaY],
            [printCenter[0] - deltaX, printCenter[1] + deltaY],
            [printCenter[0] - deltaX, printCenter[1] - deltaY],
          ],
        ];
        geometry.setCoordinates(boxCoordinates);
      }
    }
  }

  private updatePrintViewInteractions(printState: IZsMapPrintState) {
    if (printState.printView) {
      //disable normal map manipulation interactions
      this._mapInteractions.forEach((i) => {
        i.setActive(false);
      });
      if (!printState.scale) {
        if (this._printAreaPositionInteraction) {
          this._map.removeInteraction(this._printAreaPositionInteraction);
          this._printAreaPositionInteraction = undefined;
        }
        //allow to select area to print
        if (!this._printAreaInteraction) {
          const draw = new Draw({
            type: 'Circle',
            geometryFunction: createBox(),
          });
          draw.on('drawend', (event) => {
            const geometry = event?.feature?.getGeometry() as Polygon;
            if (geometry) {
              this._printDimensionArea.getGeometry()?.setCoordinates(geometry.getCoordinates());
              this._state.updatePrintState((draft: IZsMapPrintState) => {
                const extend = geometry.getExtent();
                draft.printCenter = getCenter(extend);
                /*
                const printPixelSize = [(draft.dimensions[0] / MM_PER_INCHES) * draft.dpi, (draft.dimensions[1] / MM_PER_INCHES) * draft.dpi];
                const extendResolution = this._view.getResolutionForExtent(extend, printPixelSize);
                const resolution = getPointResolution(this._view.getState().projection, extendResolution, draft.printCenter, 'm');
                draft.autoScaleVal = (resolution * INCHES_PER_METER * draft.dpi) / 1000;
                */
                const extendResolution = this._view.getResolutionForExtent(extend, draft.dimensions);
                const resolution = getPointResolution(this._view.getState().projection, extendResolution, draft.printCenter, 'm');
                draft.autoScaleVal = resolution;
              });
              this._printDimensionLayer?.getSource()?.removeFeature(event.feature);
            }
          });
          this._printAreaInteraction = draw;
          this._map.addInteraction(this._printAreaInteraction);
        }
      } else {
        if (this._printAreaInteraction) {
          this._map.removeInteraction(this._printAreaInteraction);
          this._printAreaInteraction = undefined;
        }
        //allow to move area to print
        if (!this._printAreaPositionInteraction) {
          const translate = new Translate({
            layers: [this._printDimensionLayer],
          });
          translate.on('translateend', (event) => {
            if (event.features && event.features.getLength() > 0) {
              const geometry = event.features.getArray()[0].getGeometry();
              if (geometry) {
                this._state.updatePrintState((draft: IZsMapPrintState) => {
                  const extend = geometry.getExtent();
                  draft.printCenter = getCenter(extend);
                });
              }
            }
          });
          this._printAreaPositionInteraction = translate;
          this._map.addInteraction(this._printAreaPositionInteraction);
        }
      }
    } else {
      //reenable normal map manipulation interactions
      this._mapInteractions.forEach((i) => {
        i.setActive(true);
      });
      if (this._printAreaInteraction) {
        this._map.removeInteraction(this._printAreaInteraction);
        this._printAreaInteraction = undefined;
      }
      if (this._printAreaPositionInteraction) {
        this._map.removeInteraction(this._printAreaPositionInteraction);
        this._printAreaPositionInteraction = undefined;
      }
    }
  }

  private updatePrintViewCallbacks(printState: IZsMapPrintState) {
    if (printState.printView && printState.generateCallback && !this._disabledForPrint) {
      document.body.style.cursor = 'progress';
      this._disabledForPrint = true;
      //prevent map changes while prepare image for pdf generation
      this._map.getInteractions().forEach((i) => {
        i.setActive(false);
      });
      //backup map size settings
      this._state.updatePrintState((draft: IZsMapPrintState) => {
        draft.backupResolution = this._view.getResolution();
        draft.backupDpi = this._state.getDPI();
      });

      //don't print print area selection
      this._printDimensionLayer.setVisible(false);

      //add callback handlers
      this._map.once('rendercomplete', printState.generateCallback);
      if (printState.tileEventCallback) {
        const tileSources = this._map
          .getLayers()
          .getArray()
          .filter((l): l is Layer => Boolean(l))
          .map((l) => l.getSource())
          .filter((l): l is TileSource => Boolean(l));
        const tileEventCallback = printState.tileEventCallback;
        tileSources.forEach((s) => s.on(['tileloadstart', 'tileloadend', 'tileloaderror'], tileEventCallback));
        //auto remove tileEventCallback after render complete / generateCallback callen
        this._map.once('rendercomplete', () => {
          if (tileEventCallback) {
            tileSources.forEach((s) => s.un(['tileloadstart', 'tileloadend', 'tileloaderror'], tileEventCallback));
          }
        });
      }
      this.setPrintViewSize(printState);
    } else if (!printState.generateCallback && this._disabledForPrint) {
      this._disabledForPrint = false;
      this._map.getInteractions().forEach((i) => {
        if (!this._mapInteractions.includes(i)) {
          i.setActive(true);
        }
      });
      this._printDimensionLayer.setVisible(true);

      this.resetPrintViewSize(printState);
    }
  }

  private setPrintViewSize(printState) {
    //set map size / settings for generate map image for defined pdf format
    const width = Math.round((printState.dimensions[0] * printState.dpi) / MM_PER_INCHES);
    const height = Math.round((printState.dimensions[1] * printState.dpi) / MM_PER_INCHES);
    const scale = printState.scale ?? printState.autoScaleVal ?? 50;
    const printCenter = printState.printCenter ?? this._view.getCenter() ?? DEFAULT_COORDINATES;
    const scaleResolution = scale / getPointResolution(this._view.getProjection(), printState.dpi / MM_PER_INCHES, printCenter);
    this._scaleLine.setDpi(printState.dpi);
    this._map.getTargetElement().style.width = `${width}px`;
    this._map.getTargetElement().style.height = `${height}px`;
    this._map.updateSize();
    this._map
      .getLayers()
      .getArray()
      .filter((l): l is Layer => Boolean(l))
      .filter((l) => l.isVisible())
      .map((l) => l.getSource())
      .filter((l): l is TileSource => Boolean(l))
      .forEach((s) => {
        let tileCount: number | undefined;
        if ('updateCacheSize' in s) {
          if ('getTileGridForProjection' in s) {
            const tileGrid = s.getTileGridForProjection(this._view.getProjection());
            const zoom = tileGrid.getZForResolution(this._view.getResolution() ?? DEFAULT_RESOLUTION);
            const extent = this._view.calculateExtent(this._map.getSize());
            const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, zoom);
            tileCount = (tileRange.maxX - tileRange.minX + 1) * (tileRange.maxY - tileRange.minY + 1);
            tileCount = Math.round(tileCount * 1.1);
          }
          if (tileCount) {
            if (tileCount > 512) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s.updateCacheSize as any)(tileCount, this._view.getProjection());
            }
            if (printState.tileEventCallback) {
              printState.tileEventCallback(new CustomEvent<{ tileCount: number }>('tileCountInfo', { detail: { tileCount } }));
            }
          }
        }
      });
    this._view.setCenter(printCenter);
    this._view.setResolution(scaleResolution);
  }

  private resetPrintViewSize(printState) {
    //reset normal map size / settings
    this._scaleLine.setDpi(printState.backupDpi);
    this._map.getTargetElement().style.width = '';
    this._map.getTargetElement().style.height = '';
    this._map.updateSize();
    this._view.setResolution(printState.backupResolution);
    document.body.style.cursor = 'auto';
    this._state.updatePrintState((draft: IZsMapPrintState) => {
      draft.backupResolution = undefined;
      draft.backupDpi = undefined;
    });
  }
}
