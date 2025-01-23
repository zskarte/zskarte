import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { MatButton, MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Sign, ZsMapDrawElementStateType } from '@zskarte/types';
import { firstValueFrom } from 'rxjs';
import { GuestLimitDialogComponent } from '../guest-limit-dialog/guest-limit-dialog.component';
import { removeCoordinates } from '../helper/coordinates';
import { I18NService } from '../state/i18n.service';
import { ZsMapStateService } from '../state/state.service';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { MapOverlayService } from './map-overlay.service';
import { MapRendererService } from './map-renderer.service';
import { MapSelectService } from './map-select.service';

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, MatIcon, MatMiniFabButton, MatButtonModule],
})
export class MapRendererComponent implements AfterViewInit {
  public i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private _dialog = inject(MatDialog);
  private _select = inject(MapSelectService);
  private _overlay = inject(MapOverlayService);
  public renderer = inject(MapRendererService);

  readonly mapElement = viewChild.required<ElementRef>('mapElement');
  readonly deleteElement = viewChild.required<MatButton>('delete');
  readonly rotateElement = viewChild.required<MatButton>('rotate');
  readonly copyElement = viewChild.required<MatButton>('copy');
  readonly drawElement = viewChild.required<MatButton>('draw');
  readonly closeElement = viewChild.required<MatButton>('close');

  public isDevicePositionFlagVisible = false;

  private _rotating = false;
  private _initialRotation = 0;

  public ngAfterViewInit(): void {
<<<<<<< HEAD
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
          const selectedElement =
            this._drawElementCache[this.selectedFeature.getValue()?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID)];
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
          if (
            !this.isReadOnly.getValue() &&
            nextElement?.element?.elementState?.type === ZsMapDrawElementStateType.SYMBOL
          ) {
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
      this._state.setHideSelectedFeature(true);
    });

    this._modify.on('modifyend', (e) => {
      this._state.setHideSelectedFeature(false);

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
        const type = element.element.elementState?.type;
        const symbolCoordinates = DrawStyle.getIconCoordinates(feature, this._view.getResolution() ?? 1)[0];
        const modifyCoordinates = e.mapBrowserEvent.coordinate;
        const toggleRotate =
          type === ZsMapDrawElementStateType.SYMBOL && areCoordinatesEqual(symbolCoordinates, modifyCoordinates);
        this.toggleEditButtons(true, toggleRotate);
      }
    });

    this._translate = new Translate({
      features: this._modifyCache,
      condition: () => this.areFeaturesModifiable(),
    });

    this._translate.on('translatestart', () => {
      this.toggleEditButtons(false);
      this._state.setHideSelectedFeature(true);
    });

    this._translate.on('translateend', (e) => {
      this._state.setHideSelectedFeature(false);

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

    combineLatest([
      this._state.observeDrawElements(),
      this._state.observeHiddenSymbols(),
      this._state.observeHiddenFeatureTypes(),
    ])
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

    this._state
      .observePrintExtent()
      .pipe(skip(1), takeUntil(this._ngUnsubscribe))
      .subscribe(this.updatePrintViewExtent.bind(this));

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
=======
    this.renderer.initialize({
      mapElement: this.mapElement,
      buttons: {
        delete: this.deleteElement,
        rotate: this.rotateElement,
        copy: this.copyElement,
        draw: this.drawElement,
        close: this.closeElement,
      },
    });
>>>>>>> ccf4102 (feat(map-renderer): refactoring)
  }

  async startRotating() {
    const feature = this._select.getFeature();
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

    const feature = this._select.getFeature();

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

    const rotateButtonConfig = this._overlay.getRotateButtonConfig();

    const rect = rotateButtonConfig?.overlay?.getElement()?.getBoundingClientRect() ?? { x: 0, y: 0 };

    const radians = Math.atan2(
      pageX - (rect.x - rotateButtonConfig.offset[0]),
      pageY - (rect.y - rotateButtonConfig.offset[1]),
    );
    const degrees = Math.round(radians * (180 / Math.PI) * -1 + 100);
    let rotation = degrees + this._initialRotation;

    // keep the rotation between -180 and 180
    rotation = rotation > 180 ? rotation - 360 : rotation;
    const id = feature?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID);

    // Update the signature in the UI separately from the state, to provide a smooth rotation
    feature.get('sig').rotation = rotation;
    feature.changed();

    // Update the state with the new rotation (debounced)
    this.renderer.getCachedDrawElement(id)?.element.updateElementState((draft) => {
      draft.rotation = rotation;
    });
  }

  async removeFeature() {
    const state = this._state.getDrawElementState(this._select.getFeature()?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
    const coordinates = this._select.getVertexPoint();

    if (state?.id && coordinates) {
      const newCoordinates = removeCoordinates(state.coordinates, coordinates);

      let remove = false;
      switch (state.type) {
        case ZsMapDrawElementStateType.POLYGON:
        case ZsMapDrawElementStateType.SYMBOL:
          if (newCoordinates.length < 1) {
            remove = true;
          } else {
            let maxSub = 0;
            for (const subCoordinates of newCoordinates as number[][]) {
              if (maxSub <= subCoordinates.length) {
                maxSub = subCoordinates.length;
              }
            }
            if (maxSub < 4) {
              remove = true;
            }
          }
          break;
        case ZsMapDrawElementStateType.LINE:
          if (newCoordinates.length < 3) {
            remove = true;
          }
          break;
      }

      if (remove) {
        this._state.removeDrawElement(state.id);
      } else {
        this._state.updateDrawElementState(state.id, 'coordinates', newCoordinates as any);
      }
    }

    this._overlay.toggleEditButtons(false);
  }

  async copySign() {
    const feature = this._select.getFeature();
    if (!feature) {
      return;
    }
    this._overlay.toggleEditButtons(false);
    const sign = feature?.get('sig') as Sign;
    if (!sign || !sign.id) {
      return;
    }
    const layer = await firstValueFrom(this._state.observeActiveLayer());
    this._state.copySymbol(sign.id, layer?.getId());
    this._state.resetSelectedFeature();
  }

  toggleDrawingDialog() {
    if (!this._state.canAddElements()) {
      this._dialog.open(GuestLimitDialogComponent);
      return;
    }

    const posFlag = this._state.getCurrentPositionFlag();
    const coordinates = posFlag.coordinates;
    if (coordinates) {
      this._state.drawSignatureAtCoordinate(coordinates);
      this._overlay.toggleFlagButtons(false);
    }
  }

  hidePositionFlag() {
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
    this._overlay.toggleFlagButtons(false);
  }
}
