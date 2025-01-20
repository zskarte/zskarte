import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, lastValueFrom, merge, Observable, Subject } from 'rxjs';
import { applyPatches, Patch, produce } from 'immer';
import { isEqual } from 'lodash';
import {
  getDefaultIZsMapState,
  IPositionFlag,
  IZsMapDisplayState,
  PaperDimensions,
  IZsMapPrintExtent,
  IZsMapPrintState,
  IZsMapState,
  IZsMapSymbolDrawElementParams,
  IZsMapTextDrawElementParams,
  ZsMapDisplayMode,
  ZsMapDrawElementParams,
  ZsMapDrawElementState,
  ZsMapDrawElementStateType,
  ZsMapElementToDraw,
  ZsMapLayerState,
  ZsMapLayerStateType,
  ZsMapPolygonDrawElementState,
  ZsMapStateSource,
  SearchFunction,
  IZsMapSearchConfig,
  defineDefaultValuesForSignature,
  MapLayer,
  PermissionType,
  Sign,
  WmsSource,
} from '@zskarte/types';
import { debounceTime, distinctUntilChanged, map, takeUntil, takeWhile } from 'rxjs/operators';
import { ZsMapBaseLayer } from '../map-renderer/layers/base-layer';
import { v4 as uuidv4 } from 'uuid';
import { ZsMapDrawLayer } from '../map-renderer/layers/draw-layer';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { DrawElementHelper } from '../helper/draw-element-helper';
import { areArraysEqual, toggleInArray } from '../helper/array';
import { MatDialog } from '@angular/material/dialog';
import { SelectSignDialog } from '../select-sign-dialog/select-sign-dialog.component';
import { TextDialogComponent } from '../text-dialog/text-dialog.component';
import { Signs } from '../map-renderer/signs';
import { SyncService } from '../sync/sync.service';
import { SessionService } from '../session/session.service';
import { SimpleGeometry } from 'ol/geom';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18NService } from './i18n.service';
import { Feature } from 'ol';
import { DEFAULT_COORDINATES, DEFAULT_ZOOM, DEFAULT_DPI, LOG2_ZOOM_0_RESOLUTION, INCHES_PER_METER } from '../session/default-map-values';
import { Coordinate } from 'ol/coordinate';
import { getPointResolution, transform } from 'ol/proj';
import { coordinatesProjection, mercatorProjection } from '../helper/projections';
import { OperationService } from '../session/operations/operation.service';

@Injectable({
  providedIn: 'root',
})
export class ZsMapStateService {
  i18n = inject(I18NService);
  private dialog = inject(MatDialog);
  private _sync = inject(SyncService);
  private _session = inject(SessionService);
  private _snackBar = inject(MatSnackBar);
  private _operationService = inject(OperationService);

  private _map = new BehaviorSubject<IZsMapState>(getDefaultIZsMapState());
  private _mapPatches = new BehaviorSubject<Patch[]>([]);
  private _mapInversePatches = new BehaviorSubject<Patch[]>([]);
  private _undoStackPointer = new BehaviorSubject<number>(0);

  private _display = new BehaviorSubject<IZsMapDisplayState>(this._getDefaultDisplayState());
  private _displayPatches = new BehaviorSubject<Patch[]>([]);
  private _displayInversePatches = new BehaviorSubject<Patch[]>([]);

  private _print = new BehaviorSubject<IZsMapPrintState>(ZsMapStateService._getDefaultIZsMapPrintState());

  private _cursor = new BehaviorSubject<Coordinate>([0, 0]);

  private _layerCache: Record<string, ZsMapBaseLayer> = {};
  private _drawElementCache: Record<string, ZsMapBaseDrawElement> = {};
  private _elementToDraw = new BehaviorSubject<ZsMapElementToDraw | undefined>(undefined);
  private _selectedFeature = new BehaviorSubject<string | undefined>(undefined);
  private _recentlyUsedElement = new BehaviorSubject<ZsMapDrawElementState[]>([]);

  private _mergeMode = new BehaviorSubject<boolean>(false);
  private _drawHoleMode = new BehaviorSubject<boolean>(false);
  private _currentMapCenter: BehaviorSubject<number[]> | undefined;
  private _globalWmsSources = new BehaviorSubject<WmsSource[]>([]);
  private _globalMapLayers = new BehaviorSubject<MapLayer[]>([]);
  private _searchConfigs = new BehaviorSubject<IZsMapSearchConfig[]>([]);

  constructor() {
    const _session = this._session;
    const _operationService = this._operationService;

    const _changeOperationId = new Subject<void>();
    _session.observeOperationId().subscribe((operationId) => {
      _changeOperationId.next();
      if (operationId && operationId < 0) {
        this.observeMapState()
          .pipe(debounceTime(250), takeUntil(_changeOperationId))
          .subscribe((mapState) => {
            if (!this.isHistoryMode() && mapState && mapState.layers) {
              if (coordinatesProjection && mercatorProjection) {
                mapState = { ...mapState, center: transform(this._display.value.mapCenter, mercatorProjection, coordinatesProjection) };
              }
              _operationService.updateLocalMapState(mapState);
            }
          });
      }
    });
  }

  private _getDefaultDisplayState(mapState?: IZsMapState): IZsMapDisplayState {
    const state: IZsMapDisplayState = {
      version: 1,
      mapOpacity: 1,
      displayMode: ZsMapDisplayMode.DRAW,
      expertView: false,
      positionFlag: { coordinates: DEFAULT_COORDINATES, isVisible: false },
      mapCenter: DEFAULT_COORDINATES,
      mapZoom: DEFAULT_ZOOM,
      dpi: DEFAULT_DPI,
      activeLayer: undefined,
      showMyLocation: false,
      source: ZsMapStateSource.OPEN_STREET_MAP,
      layerOpacity: {},
      layerVisibility: {},
      layerOrder: [],
      elementVisibility: {},
      elementOpacity: {},
      layers: [],
      wmsSources: [],
      hiddenSymbols: [],
      hiddenFeatureTypes: [],
      hiddenCategories: [],
      enableClustering: true,
    };
    if (!mapState) {
      mapState = this._map.value;
    }
    if (mapState?.layers) {
      for (const layer of mapState?.layers) {
        if (layer.id) {
          if (!state.activeLayer) {
            state.activeLayer = layer.id;
          }
          state.layerOrder.push(layer.id);
          state.layerVisibility[layer.id] = true;
          state.layerOpacity[layer.id] = 1;
        }
      }
    }
    return state;
  }

  private static _getDefaultIZsMapPrintState(): IZsMapPrintState {
    return {
      printView: false,
      format: 'A4',
      orientation: 'landscape',
      printMargin: 10,
      dpi: 150,
      scale: undefined,
      autoScaleVal: 10,
      printScale: true,
      emptyMap: false,
      qrCode: true,
      shareLink: false,
      sharePermission: PermissionType.READ,
      dimensions: PaperDimensions['A4'].map((s) => s - 15 * 2) as [number, number],
      generateCallback: undefined,
      tileEventCallback: undefined,
    };
  }

  public copySymbol(symbolId: number, layer?: string) {
    if (layer) {
      this._elementToDraw.next({ type: ZsMapDrawElementStateType.SYMBOL, layer, symbolId });
    }
  }

  public drawSignatureAtCoordinate(coordinates: number[]) {
    const layer = this._display.value.activeLayer;
    if (layer) {
      const dialogRef = this.dialog.open(SelectSignDialog);
      dialogRef.afterClosed().subscribe((result: Sign) => {
        if (result) {
          if (result.type === 'Point') {
            const element: ZsMapDrawElementState = {
              layer,
              coordinates,
              type: ZsMapDrawElementStateType.SYMBOL,
              symbolId: result.id,
            };
            this.addDrawElement(element);
            this.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
          } else {
            this._snackBar.open(this.i18n.get('addSignatureManually'), this.i18n.get('ok'), { duration: 5000 });
            this._elementToDraw.next({ type: ZsMapDrawElementStateType.SYMBOL, layer, symbolId: result.id });
          }
        }
      });
    }
  }

  // drawing
  public async drawElement(params: ZsMapDrawElementParams): Promise<void> {
    // skipcq: JS-0047
    switch (params.type) {
      case ZsMapDrawElementStateType.SYMBOL:
        if (!(params as IZsMapSymbolDrawElementParams).symbolId) {
          const dialogRef = this.dialog.open(SelectSignDialog);
          const result: Sign = await lastValueFrom(dialogRef.afterClosed());
          (params as IZsMapSymbolDrawElementParams).symbolId = result.id as number;
        }
        break;
      case ZsMapDrawElementStateType.TEXT:
        if (!(params as IZsMapTextDrawElementParams).text) {
          const dialogRef = this.dialog.open(TextDialogComponent, {
            maxWidth: '80vw',
            maxHeight: '70vh',
          });
          (params as IZsMapTextDrawElementParams).text = await lastValueFrom(dialogRef.afterClosed());
        }
        break;
    }
    this._elementToDraw.next(params);
  }

  public cancelDrawing(): void {
    this._elementToDraw.next(undefined);
  }

  public observeElementToDraw(): Observable<ZsMapElementToDraw | undefined> {
    return this._elementToDraw.asObservable();
  }

  public setMapState(newState?: IZsMapState): void {
    const cached = Object.keys(this._layerCache);
    for (const c of cached) {
      if (!newState?.layers?.find((l) => l.id === c)) {
        this._layerCache[c].unsubscribe();
        // skipcq: JS-0320
        delete this._layerCache[c];
      }
    }
    if (this._drawElementCache) {
      for (const key in this._drawElementCache) {
        if (!newState?.drawElements?.find((e) => e.id === key)) {
          this._drawElementCache[key].unsubscribe();
        }
      }
    }
    this._drawElementCache = {};
    this.updateMapState(() => {
      return newState || getDefaultIZsMapState();
    }, true);
  }

  public setDisplayState(newState?: IZsMapDisplayState): void {
    this.updateDisplayState(() => {
      return newState || this._getDefaultDisplayState();
    });
  }

  public observeMapState(): Observable<IZsMapState> {
    return this._map.asObservable();
  }

  public async toggleDisplayMode() {
    // Make sure to get the latest mapState when the historyMode is toggled
    // This prevents old states from the history getting applied to the state
    await this.refreshMapState();
    this.updateDisplayState((draft) => {
      if (draft.displayMode === ZsMapDisplayMode.HISTORY) {
        draft.displayMode = ZsMapDisplayMode.DRAW;
        this._snackBar.open(this.i18n.get('toastDrawing'), 'OK', {
          duration: 2000,
        });
      } else {
        draft.displayMode = ZsMapDisplayMode.HISTORY;
        this._snackBar.open(this.i18n.get('toastHistory'), 'OK', {
          duration: 2000,
        });
      }
    });
  }

  public observeIsHistoryMode(): Observable<boolean> {
    return this._display.pipe(
      map((o) => {
        return o.displayMode === ZsMapDisplayMode.HISTORY;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public isHistoryMode(): boolean {
    return this._display.value?.displayMode === ZsMapDisplayMode.HISTORY;
  }

  public toggleExpertView() {
    this.updateDisplayState((draft) => {
      draft.expertView = !draft.expertView;
      if (draft.expertView) {
        this._snackBar.open(this.i18n.get('toastExpertView'), 'OK', {
          duration: 2000,
        });
      } else {
        this._snackBar.open(this.i18n.get('toastDefaultView'), 'OK', {
          duration: 2000,
        });
      }
    });
  }

  public observeIsExpertView(): Observable<boolean> {
    return this._display.pipe(
      map((o) => {
        return o.expertView;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public isExpertView(): boolean {
    return this._display.value?.expertView;
  }

  public observeDisplayState(): Observable<IZsMapDisplayState> {
    return this._display.asObservable();
  }

  public observePrintState(): Observable<IZsMapPrintState> {
    return this._print.asObservable();
  }

  public getPrintCenter(): Coordinate | undefined {
    return this._print.value.printCenter;
  }

  // zoom
  public observeMapZoom(): Observable<number> {
    return this._display.pipe(
      map((o) => {
        if (!o?.mapZoom || o.mapZoom === DEFAULT_ZOOM) {
          return this._session.getDefaultMapZoom();
        }
        return o?.mapZoom;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public getMapZoom(): number {
    return this._display.value.mapZoom;
  }

  // dpi
  public observeDPI(): Observable<number> {
    return this._display.pipe(
      map((o) => {
        if (!o?.dpi) {
          return DEFAULT_DPI;
        }
        return o?.dpi;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public getDPI(): number {
    return this._display.value.dpi ?? DEFAULT_DPI;
  }

  public observePrintExtent(): Observable<IZsMapPrintExtent> {
    return this._print.pipe(
      map((o) => ({
        dimensions: o.dimensions,
        dpi: o.dpi,
        scale: o.scale,
        autoScaleVal: o.autoScaleVal,
      })),
      distinctUntilChanged((x, y) => isEqual(x, y)),
    );
  }

  public observePositionFlag(): Observable<IPositionFlag> {
    return this._display.pipe(
      map((o) => {
        return o.positionFlag;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public observeEnableClustering(): Observable<boolean> {
    return this._display.pipe(
      map((o) => o.enableClustering),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public updateShowCurrentLocation(show: boolean) {
    this.updateDisplayState((draft) => {
      draft.showMyLocation = show;
    });
  }

  public updatePositionFlag(positionFlag: IPositionFlag) {
    this.updateDisplayState((draft) => {
      draft.positionFlag = positionFlag;
    });
  }

  public getCurrentPositionFlag(): IPositionFlag {
    return this._display.value.positionFlag;
  }

  public setSelectedFeature(featureId: string | undefined) {
    this._selectedFeature.next(featureId);
  }

  public resetSelectedFeature() {
    this._selectedFeature.next(undefined);
  }

  public setMapZoom(zoom: number) {
    this.updateDisplayState((draft) => {
      draft.mapZoom = zoom;
    });
  }

  public updateMapZoom(delta: number) {
    this.updateDisplayState((draft) => {
      draft.mapZoom = draft.mapZoom + delta;
    });
  }

  public setMapZoomScale(scale: number, dpi?: number) {
    this.updateDisplayState((draft) => {
      if (mercatorProjection) {
        if (dpi) {
          draft.dpi = dpi;
        } else {
          dpi = this._display.value.dpi ?? DEFAULT_DPI;
        }
        const desiredResolution = getPointResolution(mercatorProjection, INCHES_PER_METER * dpi, draft.mapCenter, 'm');
        draft.mapZoom = LOG2_ZOOM_0_RESOLUTION - Math.log2(scale / desiredResolution);
      }
    });
  }

  public setDPI(dpi: number) {
    this.updateDisplayState((draft) => {
      draft.dpi = dpi;
    });
  }

  // center
  public observeMapCenter(): Observable<number[]> {
    return this._display.pipe(
      map((o) => {
        if (
          !o?.mapCenter ||
          o.mapCenter.length !== 2 ||
          !o.mapCenter[0] ||
          !o.mapCenter[1] ||
          o.mapCenter[0] === 0 ||
          o.mapCenter[1] === 0 ||
          (o.mapCenter[0] === DEFAULT_COORDINATES[0] && o.mapCenter[1] === DEFAULT_COORDINATES[1])
        ) {
          return this._session.getDefaultMapCenter();
        }
        return o?.mapCenter;
      }),
      distinctUntilChanged((x, y) => areArraysEqual(x, y)),
    );
  }

  public setMapCenter(coordinates: number[]) {
    this.updateDisplayState((draft) => {
      draft.mapCenter = coordinates;
    });
  }

  // source
  public observeMapSource(): Observable<ZsMapStateSource> {
    return this._display.pipe(
      map((o) => {
        return o?.source;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public setMapSource(source: ZsMapStateSource) {
    this.updateDisplayState((draft) => {
      draft.source = source;
    });
  }

  // opacity
  public observeMapOpacity(): Observable<number> {
    return this._display.pipe(
      map((o) => {
        return o?.mapOpacity === undefined ? 1 : o.mapOpacity;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public setMapOpacity(opacity: number) {
    this.updateDisplayState((draft) => {
      draft.mapOpacity = opacity;
    });
  }

  // draw layers
  public getLayer(layer: string): ZsMapBaseLayer {
    return this._layerCache[layer];
  }

  public getActiveLayer(): ZsMapBaseLayer | undefined {
    return this._display.value.activeLayer ? this._layerCache[this._display.value.activeLayer] : undefined;
  }

  public getShowCurrentLocation(): boolean {
    return this._display.value.showMyLocation;
  }

  public observeActiveLayer(): Observable<ZsMapBaseLayer | undefined> {
    return this._display.pipe(
      map((o) => {
        return o?.activeLayer ? this._layerCache[o?.activeLayer] : undefined;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public observeLayers(): Observable<ZsMapBaseLayer[]> {
    return this._map.pipe(
      map((o) => {
        if (o?.layers) {
          const layers: ZsMapBaseLayer[] = [];
          const cache = {};
          for (const i of o.layers) {
            if (i.id) {
              if (this._layerCache[i.id]) {
                layers.push(this._layerCache[i.id]);
                cache[i.id] = this._layerCache[i.id];
              } else {
                const layer = new ZsMapDrawLayer(i.id, this);
                layers.push(layer);
                cache[i.id] = layer;
              }
            }
          }
          this._layerCache = cache;
          return layers;
        }
        return [];
      }),
      distinctUntilChanged((x, y) => {
        return areArraysEqual(x.map((o) => o.getId()).sort(), y.map((o) => o.getId()).sort());
      }),
    );
  }

  public mergePolygons(elementA: ZsMapBaseDrawElement, elementB: ZsMapBaseDrawElement) {
    const featureA = elementA.getOlFeature() as Feature<SimpleGeometry>;
    const featureB = elementB.getOlFeature() as Feature<SimpleGeometry>;
    if (featureA.getGeometry()?.getType() === 'Polygon' && featureB.getGeometry()?.getType() === 'Polygon') {
      const newCoordinates: number[][] = [];
      featureA
        ?.getGeometry()
        ?.getCoordinates()
        ?.forEach((c: number[]) => newCoordinates.push(c));
      featureB
        ?.getGeometry()
        ?.getCoordinates()
        ?.forEach((c: number[]) => newCoordinates.push(c));

      elementA.updateElementState((draft) => {
        if (draft.name && elementB.elementState?.name) {
          draft.name = `${draft.name} | ${elementB.elementState?.name}`;
        } else if (draft.name || elementB.elementState?.name) {
          draft.name = draft.name ?? elementB.elementState?.name;
        }
        draft.coordinates = newCoordinates;
      });
      this.removeDrawElement(elementB.getId());
      this.setSelectedFeature(elementA.getId());
      this.setMergeMode(false);
    }
  }

  public splitPolygon(element: ZsMapBaseDrawElement) {
    const feature = element.getOlFeature() as Feature<SimpleGeometry>;
    if (feature.getGeometry()?.getType() === 'Polygon') {
      const coords = feature.getGeometry()?.getCoordinates() as number[][];
      // we only split polygons which have multiple paths
      if (coords.length <= 1) {
        return;
      }

      for (const group of coords) {
        const state = {
          ...element.elementState,
          coordinates: [group],
        } as ZsMapPolygonDrawElementState;
        // remove id so it's set in addDrawElement
        delete state.id;
        this.addDrawElement(state);
      }

      // remove old element
      this.removeDrawElement(element.getId());
    }
  }

  // layers
  public observeSelectedMapLayers$(): Observable<MapLayer[]> {
    return this._display.pipe(
      map((o) => {
        return o?.layers?.filter((feature) => !feature.deleted);
      }),
      distinctUntilChanged((x, y) => x && y && x.length === y.length && x.map((l, i) => l === y[i]).filter((l) => l).length === x.length),
    );
  }

  public observeMapLayers$(fullId: string): Observable<MapLayer | undefined> {
    return this._display.pipe(
      map((o) => {
        return o?.layers?.find((layer) => layer.fullId === fullId);
      }),
      distinctUntilChanged((x, y) => x === y),
      takeWhile((layer) => Boolean(layer)),
    );
  }

  public observeSelectedFeature$(): Observable<string | undefined> {
    return this._selectedFeature.asObservable();
  }

  public observeSelectedElement$(): Observable<ZsMapBaseDrawElement | undefined> {
    return combineLatest([this.observeSelectedFeature$(), this.observeDrawElements()]).pipe(
      map(([featureId, elements]) => elements.find((e) => e.getId() === featureId)),
    );
  }

  public addMapLayer(layer: MapLayer) {
    this.updateDisplayState((draft) => {
      let maxIndex = Math.max(...draft.layers.map((f) => f.zIndex));
      maxIndex = Number.isInteger(maxIndex) ? maxIndex + 1 : 0;
      draft.layers.unshift({ ...layer, deleted: false, zIndex: maxIndex });
    });
  }

  public removeMapLayer(index: number) {
    this.updateDisplayState((draft) => {
      draft.layers.splice(index, 1);
    });
  }

  public sortMapLayerUp(index: number) {
    this.updateDisplayState((draft) => {
      const layer = draft.layers[index];
      const currentZIndex = layer.zIndex;

      draft.layers[index - 1].zIndex = currentZIndex;
      layer.zIndex = currentZIndex + 1;
      draft.layers.sort((a, b) => b.zIndex - a.zIndex);
    });
  }

  public reloadAllMapLayers() {
    const layers = [...this._display.value.layers];
    this.updateDisplayState((draft) => {
      draft.layers = [];
    });
    this.updateDisplayState((draft) => {
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        //update source object
        let source = draft.wmsSources?.find((s) => s.id === layer.source?.id);
        if (!source) {
          source = draft.wmsSources?.find((s) => s.url === layer.source?.url);
        }
        if (source) {
          layers[i] = { ...layer, source };
        }
      }
      draft.layers = layers;
    });
  }

  public replaceMapLayer(item: MapLayer, index: number) {
    this.updateDisplayState((draft) => {
      draft.layers.splice(index, 1);
    });
    this.updateDisplayState((draft) => {
      draft.layers.splice(index, 0, item);
    });
  }

  public observeShowCurrentLocation$(): Observable<boolean> {
    return this._display.pipe(
      map((o) => {
        return o?.showMyLocation;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public observeCurrentMapCenter$(): Observable<number[]> {
    if (!this._currentMapCenter) {
      this._currentMapCenter = new BehaviorSubject<number[]>(DEFAULT_COORDINATES);
    }
    return this._currentMapCenter.asObservable();
  }

  public updateCurrentMapCenter$(coordinates: number[]) {
    if (!this._currentMapCenter) {
      this._currentMapCenter = new BehaviorSubject<number[]>(DEFAULT_COORDINATES);
    }
    this._currentMapCenter.next(coordinates);
  }

  public sortMapLayerDown(index: number) {
    this.updateDisplayState((draft) => {
      const layer = draft.layers[index];
      const currentZIndex = layer.zIndex;

      draft.layers[index + 1].zIndex = currentZIndex;
      layer.zIndex = currentZIndex - 1;
      draft.layers.sort((a, b) => b.zIndex - a.zIndex);
    });
  }

  public setMapLayerOpacity(index: number, opacity: number | null) {
    this.updateDisplayState((draft) => {
      draft.layers[index].opacity = opacity ?? 0;
    });
  }

  public toggleMapLayer(item: MapLayer, index: number) {
    const hidden = !item.hidden;
    this.updateDisplayState((draft) => {
      draft.layers[index].hidden = hidden;
    });
  }

  public getActiveLayerState(): ZsMapLayerState | undefined {
    return this._map.value.layers?.find((layer) => layer.id === this._display.value.activeLayer);
  }

  public setGlobalWmsSources(sources: WmsSource[]) {
    this._globalWmsSources.next(sources);
  }

  public getGlobalWmsSources() {
    return this._globalWmsSources.value;
  }

  public setGlobalMapLayers(mapLayers: MapLayer[]) {
    this._globalMapLayers.next(mapLayers);
  }

  public getGlobalMapLayers() {
    return this._globalMapLayers.value;
  }

  public observeGlobalMapLayers$() {
    return this._globalMapLayers.asObservable();
  }

  public addWmsSource(source: WmsSource) {
    this.updateDisplayState((draft) => {
      if (!draft.wmsSources) {
        draft.wmsSources = [];
      }
      draft.wmsSources.push(source);
    });
  }

  public removeWmsSource(source: WmsSource) {
    const index = this._display.value.wmsSources?.findIndex((o) => o === source) ?? -1;
    if (index === -1) {
      throw new Error('source to remove not found');
    }
    this.updateDisplayState((draft) => {
      if (draft.wmsSources) {
        draft.wmsSources.splice(index, 1);
      }
    });
  }

  public setWmsSources(sources: WmsSource[]) {
    this.updateDisplayState((draft) => {
      draft.wmsSources = sources;
    });
  }

  public observeWmsSources$() {
    return this._display.pipe(
      map((o) => {
        return o?.wmsSources;
      }),
      distinctUntilChanged((x, y) => x === y && x?.length === y?.length),
    );
  }

  public addDrawElement(element: ZsMapDrawElementState): ZsMapDrawElementState | null {
    const activeLayerState = this.getActiveLayerState();
    if (activeLayerState?.type === ZsMapLayerStateType.DRAW) {
      const sign = Signs.getSignById(element.symbolId) ?? ({} as Sign);
      if (!sign.createdBy) sign.createdBy = this._session.getLabel();
      defineDefaultValuesForSignature(sign);
      const drawElement: ZsMapDrawElementState = {
        ...element,
        color: sign.color,
        protected: sign.protected,
        iconSize: sign.iconSize,
        hideIcon: sign.hideIcon,
        createdBy: sign.createdBy,
        iconOffset: sign.iconOffset,
        flipIcon: sign.flipIcon,
        rotation: sign.rotation,
        iconOpacity: sign.iconOpacity,
        style: sign.style,
        arrow: sign.arrow,
        strokeWidth: sign.strokeWidth,
        fillStyle: { ...sign.fillStyle, name: sign.fillStyle?.name ?? '' },
        fillOpacity: sign.fillOpacity,
        fontSize: sign.fontSize,
        id: uuidv4(),
        nameShow: true,
        createdAt: Date.now(),
      };

      this.updateMapState((draft) => {
        if (!draft.drawElements) {
          draft.drawElements = [];
        }
        draft.drawElements.push(drawElement);
      });

      this.addRecentlyUsedElement(element);

      return drawElement;
    }

    return null;
  }

  private addRecentlyUsedElement(element: ZsMapDrawElementState) {
    if (!element) {
      return;
    }

    let elements = this._recentlyUsedElement.getValue();
    elements = elements.filter((e) => e.symbolId !== element.symbolId);
    elements.unshift(element);

    elements.splice(10, elements.length - 10);
    this._recentlyUsedElement.next(elements);
  }

  public observableRecentlyUsedElement() {
    return this._recentlyUsedElement.asObservable();
  }

  public updateDrawElementState<T extends keyof ZsMapDrawElementState>(id: string, field: T, value: ZsMapDrawElementState[T]) {
    this.updateMapState((draft) => {
      const index = draft.drawElements?.findIndex((e) => e.id === id) ?? -1;
      if (index > -1 && draft.drawElements) {
        draft.drawElements[index][field] = value;
      }
    });
  }

  public removeDrawElement(id: string) {
    const index = this._map.value.drawElements?.findIndex((o) => o.id === id) ?? -1;
    if (index === -1) {
      throw new Error('Id not correct');
    }
    this.updateMapState((draft) => {
      if (draft.drawElements) {
        draft.drawElements.splice(index, 1);
      }
    });
    if (this._selectedFeature.value === id) {
      this.setSelectedFeature(undefined);
    }
  }

  public getDrawElementState(id: string): ZsMapDrawElementState | undefined {
    return this._map.value.drawElements?.find((o) => o.id === id);
  }

  public getDrawElemente(id: string) {
    return this._drawElementCache[id];
  }

  public observeDrawElements(): Observable<ZsMapBaseDrawElement[]> {
    return this._map.pipe(
      map((o) => {
        if (o?.drawElements) {
          const elements: ZsMapBaseDrawElement[] = [];
          const cache = {};
          for (const i of o.drawElements) {
            if (i.id) {
              if (this._drawElementCache[i.id]) {
                elements.push(this._drawElementCache[i.id]);
                cache[i.id] = this._drawElementCache[i.id];
              } else {
                const element = DrawElementHelper.createInstance(i.id, this);
                elements.push(element);
                cache[i.id] = element;
              }
            }
          }

          // unsubscribe old elements
          for (const id of Object.keys(this._drawElementCache)) {
            if (!cache[id]) {
              this._drawElementCache[id].unsubscribe();
            }
          }

          this._drawElementCache = cache;
          return elements;
        }
        return [];
      }),
      distinctUntilChanged((x, y) => {
        return areArraysEqual(x.map((o) => o.getId()).sort(), y.map((o) => o.getId()).sort());
      }),
    );
  }

  public undoMapStateChange() {
    if (this._mapInversePatches.value.length - this._undoStackPointer.value === 0) {
      return;
    }

    const newUndoStackPointer = this._undoStackPointer.value + 1;

    const lastPatch = this._mapInversePatches.value.slice(
      this._mapInversePatches.value.length - newUndoStackPointer,
      this._mapInversePatches.value.length - this._undoStackPointer.value,
    );
    const newState = applyPatches<IZsMapState>(this._map.value, lastPatch);
    this._map.next(newState);

    this._sync.publishMapStatePatches(lastPatch);

    this._undoStackPointer.next(newUndoStackPointer);
  }

  public redoMapStateChange() {
    if (this._undoStackPointer.value === 0) {
      return;
    }

    const newUndoStackPointer = this._undoStackPointer.value - 1;

    const lastPatch = this._mapPatches.value.slice(
      this._mapInversePatches.value.length - this._undoStackPointer.value,
      this._mapInversePatches.value.length - newUndoStackPointer,
    );

    const newState = applyPatches<IZsMapState>(this._map.value, lastPatch);
    this._map.next(newState);

    this._sync.publishMapStatePatches(lastPatch);

    this._undoStackPointer.next(newUndoStackPointer);
  }

  public observeHistory() {
    return this._undoStackPointer.pipe(
      map((x) => ({
        canUndo: this._mapInversePatches.value.length - x > 0,
        canRedo: x > 0,
      })),
    );
  }

  public updateMapState(fn: (draft: IZsMapState) => void, preventPatches = false) {
    if (!preventPatches && !this._session.hasWritePermission() && this._session.isArchived()) {
      return;
    }
    const newState = produce<IZsMapState>(this._map.value || {}, fn, (patches, inversePatches) => {
      if (preventPatches) {
        return;
      }
      this._mapPatches.value.push(...patches);
      this._mapPatches.next(this._mapPatches.value);
      this._mapInversePatches.value.push(...inversePatches);
      this._mapInversePatches.next(this._mapInversePatches.value);
      this._undoStackPointer.next(0);

      // Only publish map state changes when not in history mode
      if (!this.isHistoryMode()) {
        this._sync.publishMapStatePatches(patches);
      }
    });
    this._map.next(newState);
  }

  public applyMapStatePatches(patches: Patch[]) {
    const newState = applyPatches(this._map.value, patches);
    this._map.next(newState);
  }

  public updateDisplayState(fn: (draft: IZsMapDisplayState) => void): void {
    const newState = produce<IZsMapDisplayState>(this._display.value || {}, fn, (patches, inversePatches) => {
      this._displayPatches.value.push(...patches);
      this._displayPatches.next(this._displayPatches.value);
      this._displayInversePatches.value.push(...inversePatches);
      this._displayInversePatches.next(this._displayInversePatches.value);
    });
    this._display.next(newState);
  }

  public updatePrintState(fn: (draft: IZsMapPrintState) => void): void {
    const newState = produce<IZsMapPrintState>(this._print.value || {}, fn);
    this._print.next(newState);
  }

  public filterAll(active: boolean, featureTypes: string[], categoryNames: string[]) {
    this.updateDisplayState((draft) => {
      draft.hiddenSymbols = active ? [...Signs.SIGNS.map((s) => s.id!)] : [];
      draft.hiddenFeatureTypes = active ? featureTypes : [];
      draft.hiddenCategories = active ? categoryNames : [];
    });
  }

  public toggleSymbol(symbolId?: number) {
    if (!symbolId) {
      return;
    }
    this.updateDisplayState((draft) => {
      toggleInArray<number>(draft.hiddenSymbols, symbolId);
    });
  }

  public toggleFeatureType(featureType: string) {
    if (!featureType) {
      return;
    }
    this.updateDisplayState((draft) => {
      toggleInArray<string>(draft.hiddenFeatureTypes, featureType);
    });
  }

  public toggleCategory(category: string) {
    if (!category) {
      return;
    }
    this.updateDisplayState((draft) => {
      toggleInArray<string>(draft.hiddenCategories, category);
    });
  }

  public toggleClustering() {
    this.updateDisplayState((draft) => {
      draft.enableClustering = !draft.enableClustering;
    });
  }

  public observeHiddenSymbols() {
    return this._display.pipe(
      map((o) => {
        return o?.hiddenSymbols;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }
  public observeHiddenFeatureTypes() {
    return this._display.pipe(
      map((o) => {
        return o?.hiddenFeatureTypes.filter((f) => f !== undefined);
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public observeHiddenCategories() {
    return this._display.pipe(
      map((o) => {
        return o?.hiddenCategories;
      }),
      distinctUntilChanged((x, y) => x === y),
    );
  }

  public setMergeMode(mergeMode: boolean) {
    this._mergeMode.next(mergeMode);
  }

  public observeMergeMode(): Observable<boolean> {
    return this._mergeMode.asObservable();
  }

  public setDrawHoleMode(drawHoleMode: boolean) {
    this._drawHoleMode.next(drawHoleMode);
  }

  public toggleDrawHoleMode() {
    this.setDrawHoleMode(!this._drawHoleMode.getValue());
  }

  public observeDrawHoleMode(): Observable<boolean> {
    return this._drawHoleMode.asObservable();
  }

  public async refreshMapState(): Promise<void> {
    const operationId = this._session.getOperationId();
    if (operationId) {
      if (!this.isHistoryMode()) {
        await this._sync.sendCachedMapStatePatches();
      }
      const sha256 = async (str: string): Promise<string> => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.prototype.map.call(new Uint8Array(buf), (x) => `00${(x as number).toString(16)}`.slice(-2)).join('');
      };
      const operation = await this._operationService.getOperation(operationId);
      if (operation?.mapState) {
        const [oldDigest, newDigest] = await Promise.all([
          sha256(JSON.stringify(this._map.value)),
          sha256(JSON.stringify(operation.mapState)),
        ]);
        if (oldDigest !== newDigest) {
          this.setMapState(operation.mapState);
        }
      }
    }
  }

  public getCoordinates() {
    return this._cursor.asObservable();
  }

  public setCoordinates(coordinate: Coordinate) {
    this._cursor.next(coordinate);
  }

  observeIsReadOnly(): Observable<boolean> {
    return merge(this.observeIsHistoryMode(), this._session.observeHasWritePermission(), this._session.observeIsArchived()).pipe(
      map(() => {
        const isHistoryMode = this.isHistoryMode();
        const hasWritePermission = this._session.hasWritePermission();
        const isArchived = this._session.isArchived();
        return !hasWritePermission || isArchived || isHistoryMode;
      }),
    );
  }

  public addSearch(
    searchFunc: SearchFunction,
    searchName: string,
    maxResultCount: number | undefined = undefined,
    resultOrder: number | undefined = undefined,
  ) {
    const configs = this._searchConfigs.value;
    const config: IZsMapSearchConfig = {
      label: searchName,
      func: searchFunc,
      active: true,
      maxResultCount: maxResultCount ?? 50,
      resultOrder: resultOrder ?? 0,
    };
    configs.push(config);
    this._searchConfigs.next(configs);
  }

  public removeSearch(searchFunc: SearchFunction) {
    const configs = this._searchConfigs.value.filter((conf) => conf.func !== searchFunc);
    this._searchConfigs.next(configs);
  }

  public getSearchConfigs(): IZsMapSearchConfig[] {
    return this._searchConfigs.value;
  }
}
