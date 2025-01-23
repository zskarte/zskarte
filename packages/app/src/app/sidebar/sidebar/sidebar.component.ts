import { Component, OnDestroy, OnInit, TemplateRef, ChangeDetectorRef, inject, viewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MapLegendDisplayComponent } from '../map-legend-display/map-legend-display.component';
import { ZsMapStateService } from '../../state/state.service';
import { GeoadminService } from '../../map-layer/geoadmin/geoadmin.service';
import { combineLatest, Subject, firstValueFrom, map, mergeMap, Observable, of, share, startWith, catchError, tap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { I18NService } from '../../state/i18n.service';
import { db, LocalBlobMeta, LocalBlobState, LocalMapInfo } from '../../db/db';
import { BlobEventType, BlobOperation, BlobService } from 'src/app/db/blob.service';
import { WmsService } from '../../map-layer/wms/wms.service';
import { WmsSourceComponent } from '../../map-layer/wms/wms-source/wms-source.component';
import { WmsLayerOptionsComponent } from '../../map-layer/wms/wms-layer-options/wms-layer-options.component';
import { GeoJSONLayerOptionsComponent } from '../../map-layer/geojson/geojson-layer-options/geojson-layer-options.component';
import { SessionService } from '../../session/session.service';
import { isEqual } from 'lodash';
import { OperationService } from '../../session/operations/operation.service';
import { OrganisationLayerSettingsComponent } from '../../map-layer/organisation-layer-settings/organisation-layer-settings.component';
import { MapLayerService } from 'src/app/map-layer/map-layer.service';
import { BlobMetaOptionsComponent } from 'src/app/map-layer/blob-meta-options/blob-meta-options.component';
import { LOCAL_MAP_STYLE_PATH } from 'src/app/session/default-map-values';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatActionList, MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { AsyncPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { takeUntil } from 'rxjs/operators';
import capitalizeFirstLetter from 'src/app/helper/capitalizeFirstLetter';
import { Sign, signCategories, SignCategory } from '@zskarte/types';
import { ZsMapBaseDrawElement } from 'src/app/map-renderer/elements/base/base-draw-element';
import { FeatureLike } from 'ol/Feature';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import {
  ZsMapStateSource,
  MapLayer,
  WmsSource,
  IZsMapOrganizationMapLayerSettings,
  WMSMapLayer,
  GeoJSONMapLayer,
  zsMapStateSourceToDownloadUrl,
} from '@zskarte/types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    MatAccordion,
    MatExpansionModule,
    MatSliderModule,
    FormsModule,
    MatActionList,
    MatRadioModule,
    AsyncPipe,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatListModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatCheckboxModule
  ],
})

export class SidebarComponent implements OnInit, OnDestroy {
  
  filterSymbols: any[] = [];
  signCategories: any[] = [...signCategories.values()];
  hiddenSymbols$: Observable<number[]>;
  hiddenFeatureTypes$: Observable<string[]>;
  enableClustering$: Observable<boolean>;
  filtersOpenState = false;
  filtersGeneralOpenState = false;
  capitalizeFirstLetter = capitalizeFirstLetter;
  private _ngUnsubscribe = new Subject<void>();

  mapState = inject(ZsMapStateService);
  wmsService = inject(WmsService);
  private operationService = inject(OperationService);
  private _session = inject(SessionService);
  i18n = inject(I18NService);
  dialog = inject(MatDialog);
  private _blobService = inject(BlobService);
  private cdRef = inject(ChangeDetectorRef);
  private _mapLayerService = inject(MapLayerService);

  readonly newLayerTypeTemplate = viewChild.required<TemplateRef<HTMLElement>>('newLayerTypeTemplate');
  newLayerType?: string;
  mapProgress = 0;

  mapSources = Object.values(ZsMapStateSource)
    .map((key) => ({
      key,
      translation: this.i18n.get(key),
      selected: false,
      downloadable: this.isDownloadableMap(key),
      offlineAvailable: false,
    }))
    .sort((a, b) => a.translation.localeCompare(b.translation));
  filteredAvailableLayers$: Observable<MapLayer[]>;
  allLayers$: Observable<MapLayer[]>;
  favouriteLayers$: Observable<MapLayer[]>;
  favouriteLayerList = [
    'undefined|ch.bafu.bundesinventare-auen',
    'undefined|ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill',
    'undefined|ch.swisstopo.swisstlm3d-gewaessernetz',
    'undefined|ch.swisstopo-karto.hangneigung',
    'undefined|ch.swisstopo.swisstlm3d-strassen',
    'undefined|ch.babs.kulturgueter',
    'undefined|ch.kantone.cadastralwebmap-farbe',
  ];

  layerFilter = new FormControl('');
  sourceFilter = new FormControl('ALL');

  mapDownloadStates: { [key: string]: LocalBlobState } = {};
  wmsSourceLoadErrors: { [key: string]: string } = {};
  availableWmsService: WmsSource[] = [];
  geoAdminLayerError: string | undefined;
  workLocal: boolean;

  constructor() {
    const mapState = this.mapState;
    const geoAdminService = inject(GeoadminService);
    const wmsService = this.wmsService;
    const _session = this._session;
    this.hiddenSymbols$ = this.mapState.observeHiddenSymbols().pipe(takeUntil(this._ngUnsubscribe));
    this.hiddenFeatureTypes$ = this.mapState.observeHiddenFeatureTypes().pipe(takeUntil(this._ngUnsubscribe));
    this.enableClustering$ = this.mapState.observeEnableClustering().pipe(takeUntil(this._ngUnsubscribe));

    this.workLocal = _session.isWorkLocal();
    const geoAdminLayers$ = geoAdminService.getLayers().pipe(
      map((layers) => Object.values(layers)),
      map((layers) => layers.filter((f) => !f['parentLayerId'] && f['type'] !== 'geojson')),
      tap(() => {
        delete this.geoAdminLayerError;
      }),
      catchError((err) => {
        console.error('get geoAdminLayers failed with error', err);
        this.geoAdminLayerError = err.message;
        return of([]);
      }),
      share(),
    );

    function flatten<T>(arr: T[][]): T[] {
      return ([] as T[]).concat(...arr);
    }
    const wmsLayers$ = mapState.observeWmsSources$().pipe(
      mergeMap((sources) => {
        if (!sources) {
          return of([] as MapLayer[]);
        }
        this.wmsSourceLoadErrors = {};
        const promises = sources.map((wms) =>
          (wms.type === 'wmts' ? wmsService.getWMTSCapaLayers(wms) : wmsService.getWMSCapaLayers(wms)).catch((err) => {
            console.error('get WMS Layers failed for', wms, 'with error', err);
            this.wmsSourceLoadErrors[wms.url] = err.toString();
            return [] as MapLayer[];
          }),
        );
        return Promise.all(promises).then((lists) => {
          return flatten(lists);
        });
      }),
    );

    const globalMapLayers$ = mapState.observeGlobalMapLayers$();

    this.allLayers$ = combineLatest([geoAdminLayers$, wmsLayers$, globalMapLayers$]).pipe(
      map(([geo, wms, globalMapLayers]) => {
        return [...geo, ...wms, ...globalMapLayers];
      }),
    );

    const availableLayers$: Observable<MapLayer[]> = combineLatest([this.allLayers$, mapState.observeSelectedMapLayers$()]).pipe(
      map(([source, selected]) => {
        const selectedNames = selected.map((f) => f.fullId);
        return source.filter((s) => !selectedNames.includes(s.fullId));
      }),
    );
    const filter$ = this.layerFilter.valueChanges.pipe(startWith(''));
    const selectedSource$ = this.sourceFilter.valueChanges.pipe(startWith('ALL'));

    this.filteredAvailableLayers$ = combineLatest([availableLayers$, filter$, selectedSource$]).pipe(
      map(([layers, filter, source]) => {
        layers = layers.sort((a: MapLayer, b: MapLayer) => a.label.localeCompare(b.label));
        if (source !== 'ALL') {
          if (source === '_GlobalMapLayers_') {
            layers = layers.filter((f) => f.id !== undefined);
          } else {
            const sourceFilter = source === '_GeoAdmin_' ? undefined : source;
            layers = layers.filter((f) => f.source?.url === sourceFilter);
          }
        }
        return filter === '' ? layers : layers.filter((f) => f.label.toLowerCase().includes(filter?.toLowerCase() ?? ''));
      }),
    );

    this.favouriteLayers$ = combineLatest([_session.observeFavoriteLayers$(), mapState.observeSelectedMapLayers$(), availableLayers$]).pipe(
      map(([favoriteLayers, selectedLayers, availableLayers]) => {
        if (favoriteLayers?.length) {
          const selectedIds = selectedLayers.map((l: MapLayer) => l.id);
          return mapState
            .getGlobalMapLayers()
            .filter((l) => l.id && favoriteLayers.includes(l.id))
            .filter((l) => !l.id || !selectedIds.includes(l.id))
            .sort((a: MapLayer, b: MapLayer) => a.label.localeCompare(b.label));
        } else {
          return availableLayers
            .filter((layer: MapLayer) => this.favouriteLayerList.includes(layer.fullId))
            .sort((a: MapLayer, b: MapLayer) => a.label.localeCompare(b.label));
        }
      }),
    );

    db.localMapInfo.toArray().then(async (downloadedMaps) => {
      this.mapDownloadStates = {};
      for (const val of downloadedMaps) {
        const mapSourceInfos = this.mapSources.find((m) => m.key === val.map);
        if (mapSourceInfos) {
          mapSourceInfos.offlineAvailable = val.offlineAvailable ?? false;
        }
        if (val.mapBlobId) {
          const meta = await db.localBlobMeta.get(val.mapBlobId);
          if (meta) {
            this.mapDownloadStates[val.map] = meta?.blobState;
            continue;
          }
        }
        this.mapDownloadStates[val.map] = 'missing';
      }
    });

    mapState
      .observeMapSource()
      .pipe(
        map((currentMapSource) => {
          this.mapSources.forEach((mapSource) => {
            mapSource.selected = currentMapSource === mapSource.key;
          });
        }),
      )
      .subscribe();
  }

  switchMapSource(layer: ZsMapStateSource) {
    this.mapState.setMapSource(layer);
  }

  showLegend(item: MapLayer) {
    this.dialog.open(MapLegendDisplayComponent, {
      data: item,
    });
  }

  selectLayer(layer: MapLayer) {
    this.mapState.addMapLayer(layer);
  }

  async editLayerSettings() {
    const wmsSources = this.mapState.getGlobalWmsSources();
    const globalMapLayers = this.mapState.getGlobalMapLayers();
    const allLayers = await firstValueFrom(this.allLayers$);
    const selectedLayers = [...(await firstValueFrom(this.mapState.observeSelectedMapLayers$()))];
    const selectedSources = (await firstValueFrom(this.mapState.observeWmsSources$())) || [];
    const organization = this._session.getOrganization();
    const localMapLayerSettings = await MapLayerService.loadLocalMapLayerSettings();
    const settingsDialog = this.dialog.open(OrganisationLayerSettingsComponent, {
      data: { wmsSources, globalMapLayers, allLayers, selectedLayers, selectedSources, organization, localMapLayerSettings },
    });
    settingsDialog.afterClosed().subscribe((result: IZsMapOrganizationMapLayerSettings) => {
      if (result) {
        //set selectedLayers on state, to make sure now saved layers have the new id information available.
        this.mapState.updateDisplayState((draft) => {
          draft.layers = selectedLayers;
        });
        //persist organisation settings
        this._session.saveOrganizationMapLayerSettings(result);
      }
    });
  }

  async editWmsSources() {
    const sources = (await firstValueFrom(this.mapState.observeWmsSources$())) || [];
    const sourceDialog = this.dialog.open(WmsSourceComponent, {
      data: sources,
    });
    sourceDialog.afterClosed().subscribe(async (changedSources: WmsSource[]) => {
      if (changedSources) {
        const ownSources = changedSources.filter((s) => s.owner);
        const changedOwnSources = ownSources.filter((ownSource) => {
          let source = sources.find((s) => s.owner && s.id === ownSource.id);
          if (!source) {
            source = sources.find((s) => s.owner && s.url === ownSource.url);
          }
          return !source || !isEqual(ownSource, source);
        });
        const organizationId = this._session.getOrganizationId();
        if (organizationId) {
          for (const changedOwnSource of changedOwnSources) {
            const updatedSource = await this.wmsService.saveGlobalWMSSource(changedOwnSource, organizationId);
            if (updatedSource) {
              const index = changedSources.indexOf(changedOwnSource);
              if (index !== -1) {
                changedSources[index] = updatedSource;
              }
            }
          }
        }
        this.mapState.setWmsSources(changedSources);
        this.mapState.reloadAllMapLayers();
      }
    });
  }

  showWmsLayerOptions(item: MapLayer, index: number) {
    const optionsDialog = this.dialog.open(WmsLayerOptionsComponent, {
      data: item as WMSMapLayer,
    });
    optionsDialog.afterClosed().subscribe((layer: WMSMapLayer) => {
      if (layer) {
        if (index === -1) {
          this.mapState.addMapLayer(layer);
        } else {
          this.mapState.replaceMapLayer(layer, index);
        }
      }
    });
  }

  showGeoJSONLayerOptions(item: MapLayer, index: number) {
    const optionsDialog = this.dialog.open(GeoJSONLayerOptionsComponent, {
      data: item,
    });
    optionsDialog.afterClosed().subscribe((layer: GeoJSONMapLayer) => {
      if (layer) {
        if (index === -1) {
          this.mapState.addMapLayer(layer);
        } else {
          this.mapState.replaceMapLayer(layer, index);
        }
      }
    });
  }

  showLocalInfo(item: MapLayer, index: number) {
    const localDialog = this.dialog.open(BlobMetaOptionsComponent, {
      data: { mapLayer: item },
      disableClose: true,
    });
    localDialog.afterClosed().subscribe(async (layer: MapLayer | undefined) => {
      if (layer) {
        await this._mapLayerService.saveLocalMapLayer(layer, false);
        this.mapState.replaceMapLayer(layer, index);
      }
    });
  }

  async showLocalInfoMap(map: ZsMapStateSource, index: number) {
    const localMapInfo = await db.localMapInfo.get(map);
    const localDialog = this.dialog.open(BlobMetaOptionsComponent, {
      data: { localMap: localMapInfo || { map } },
      disableClose: true,
    });
    localDialog.afterClosed().subscribe(async (localMapInfo: LocalMapInfo | undefined) => {
      if (localMapInfo) {
        await db.localMapInfo.put(localMapInfo);
        this.mapSources[index].offlineAvailable = localMapInfo.offlineAvailable ?? false;
        this.reloadSourceIfLocal();
      }
    });
  }

  addNewLayer() {
    const optionsDialog = this.dialog.open(this.newLayerTypeTemplate());
    optionsDialog.afterClosed().subscribe((type: string) => {
      if (type === 'wms_custom') {
        this.showWmsLayerOptions({ type, serverLayerName: '' } as WMSMapLayer, -1);
      } else if (type === 'geojson' || type === 'csv') {
        this.showGeoJSONLayerOptions({ type, opacity: 1.0, serverLayerName: null } as GeoJSONMapLayer, -1);
      }
    });
  }

  async persistLayers() {
    const operationId = this._session.getOperationId();
    if (operationId) {
      const mapSource = await firstValueFrom(this.mapState.observeMapSource());
      const selectedLayers = await firstValueFrom(this.mapState.observeSelectedMapLayers$());

      //only save difference to globalMapLayer informations
      //if this is saved like that it's clean but complicated to rehydrate the required informations on loading...
      //const allLayers = await firstValueFrom(this.allLayers$);
      //const layerConfigs = selectedLayers.map((layer) => MapLayerService.extractMapLayerDiffs(layer, allLayers));
      const layerConfigs = selectedLayers;
      const mapLayers = { baseLayer: mapSource, layerConfigs };
      const operation = this._session.getOperation();
      if (operation) {
        operation.mapLayers = mapLayers;
      }
      this.operationService.updateMapLayers(operationId, mapLayers);
    }
  }

  // skipcq: JS-0105
  isDownloadableMap(map: ZsMapStateSource) {
    return map in zsMapStateSourceToDownloadUrl;
  }

  // skipcq: JS-0105
  isSearchable(item: MapLayer) {
    return (item.type === 'geojson' || item.type === 'csv') && ((item as GeoJSONMapLayer)?.searchable || false);
  }

  private updateMapCallback(map: ZsMapStateSource) {
    // skipcq: JS-0116
    return async (eventType: BlobEventType, infos: BlobOperation) => {
      this.mapDownloadStates[map] = infos.localBlobMeta.blobState;
      this.mapProgress = infos.mapProgress;
      this.cdRef.detectChanges();
    };
  }

  private reloadSourceIfLocal() {
    if (this.mapSources.find((m) => m.selected && m.key === ZsMapStateSource.LOCAL)) {
      //it's the active one reload it to use new location
      this.mapState.setMapSource(ZsMapStateSource.OPEN_STREET_MAP);
      this.mapState.setMapSource(ZsMapStateSource.LOCAL);
    }
  }

  async downloadMap(map: ZsMapStateSource) {
    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    const localMapInfo = (await db.localMapInfo.get(map)) || { map };

    const localBlobMeta = await this._blobService.downloadBlob(downloadUrl, localMapInfo.mapBlobId, this.updateMapCallback(map));
    this.handleBlobOperationResult(localBlobMeta, localMapInfo);
  }

  async cancelDownloadMap(map: ZsMapStateSource) {
    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    await this._blobService.cancelDownload(downloadUrl);
  }

  async uploadMap(event: Event, map: ZsMapStateSource) {
    if (!event.target) return;

    this.mapDownloadStates[map] = 'loading';
    const downloadUrl = zsMapStateSourceToDownloadUrl[map];
    const localMapInfo = (await db.localMapInfo.get(map)) || { map };

    const localBlobMeta = await this._blobService.uploadBlob(event, downloadUrl, this.updateMapCallback(map));
    if (localBlobMeta) {
      this.handleBlobOperationResult(localBlobMeta, localMapInfo);
    }
  }

  async handleBlobOperationResult(localBlobMeta: LocalBlobMeta, localMapInfo: LocalMapInfo) {
    localMapInfo.mapBlobId = localBlobMeta.id;
    localMapInfo.offlineAvailable = localBlobMeta.blobState === 'downloaded';
    await db.localMapInfo.put(localMapInfo);

    if (localMapInfo.offlineAvailable) {
      localBlobMeta = await this._blobService.downloadBlob(LOCAL_MAP_STYLE_PATH, localMapInfo.styleBlobId);
      localMapInfo.styleBlobId = localBlobMeta.id;
      localMapInfo.offlineAvailable = localBlobMeta.blobState === 'downloaded';
      await db.localMapInfo.put(localMapInfo);

      if (localMapInfo.offlineAvailable) {
        this.reloadSourceIfLocal();
      }
    }
    const mapSource = this.mapSources.find((m) => m.key === localMapInfo.map);
    if (mapSource) {
      mapSource.offlineAvailable = localMapInfo.offlineAvailable;
    }
  }

  async removeLocalMap(map: ZsMapStateSource): Promise<void> {
    const blobMeta = await db.localMapInfo.get(map);
    if (!blobMeta || (!blobMeta.mapBlobId && !blobMeta.styleBlobId)) return;
    blobMeta.offlineAvailable = false;
    if (blobMeta.mapBlobId) {
      await BlobService.removeBlob(blobMeta.mapBlobId);
      blobMeta.mapBlobId = undefined;
      await db.localMapInfo.put(blobMeta);
    }
    if (blobMeta.styleBlobId) {
      await BlobService.removeBlob(blobMeta.styleBlobId);
      blobMeta.styleBlobId = undefined;
      await db.localMapInfo.put(blobMeta);
    }
    this.mapDownloadStates[map] = 'missing';
    const mapSource = this.mapSources.find((m) => m.key === map);
    if (mapSource) {
      mapSource.offlineAvailable = false;
    }
    this.mapProgress = 0;
    this.cdRef.detectChanges();
    this.reloadSourceIfLocal();
  }

  ngOnInit(): void {
    combineLatest([
      this.mapState.observeDrawElements(),
      this.mapState.observeHiddenSymbols(),
      this.mapState.observeHiddenFeatureTypes(),
    ])
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(([drawElements, hiddenSymbols, hiddenFeatureTypes]) => {
        this.updateFilterSymbolsAndFeatureTypes(drawElements, hiddenSymbols, hiddenFeatureTypes);
      });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  updateFilterSymbolsAndFeatureTypes(
    elements: ZsMapBaseDrawElement[],
    hiddenSymbols: number[],
    hiddenFeatureTypes: string[],
  ) {
    const symbols = {};
    if (elements && elements.length > 0) {
      elements.forEach((element) => {
        this.extractSymbol(element.getOlFeature(), symbols)
      });
    }
    this.filterSymbols = Object.values(symbols)
      .sort((a: any, b: any) => a.label.localeCompare(b.label))
      .map((symbol: any) => ({ ...symbol, hidden: hiddenSymbols.includes(symbol.id) || hiddenFeatureTypes.includes(symbol.filterValue) }));

    const availableKats = Object.values(symbols).map((s:any) => s.kat)
    const catObjects = [...signCategories.values()].filter(s => availableKats.includes(s.name));
    catObjects.forEach((category: any) => {
      const categorySymbols = this.filterSymbols.filter((symbol: any) => symbol.kat === category.name);

      const allHidden = categorySymbols.every((symbol: any) => symbol.hidden);
      const someHidden = categorySymbols.some((symbol: any) => symbol.hidden);

      category.isVisible = !allHidden && !someHidden;
      category.isPartiallyVisible = !allHidden && someHidden;
    });
    this.signCategories = catObjects
  }

  extractSymbol(f: FeatureLike, symbols: Record<string, any>) {
    const sig = f.get('sig');
    if (sig) {
      if (sig.src) {
        if (!symbols[sig.src]) {
          const dataUrl = null; //CustomImageStoreService.getImageDataUrl(sig.src);
          symbols[sig.src] = {
            label: this.i18n.getLabelForSign(sig),
            origSrc: sig.src,
            src: dataUrl ? dataUrl : `assets/img/signs/${sig.src}`,
            kat: sig.kat,
            id: sig.id,
          };
        }
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'Polygon' && !sig.src) {
        symbols['not_labeled_polygon'] = {
          type: 'Polygon',
          label: this.i18n.get('polygon'),
          filterValue: 'polygon',
          icon: 'widgets',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && sig.text) {
        symbols['text_element'] = {
          type: 'LineString',
          label: this.i18n.get('text'),
          filterValue: 'text',
          icon: 'font_download',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && sig.freehand) {
        symbols['free_hand_element'] = {
          type: 'LineString',
          label: this.i18n.get('freeHand'),
          filterValue: 'line',
          icon: 'gesture',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && !sig.src) {
        symbols['not_labeled_line'] = {
          type: 'LineString',
          label: this.i18n.get('line'),
          filterValue: 'line',
          icon: 'show_chart',
        };
      }
    }
  }

  public filterAll(active: boolean) {
    this.mapState.filterAll(
      active,
      this.filterSymbols.map((symbol) => symbol.filterValue),
    );
  }

  public toggleSymbolOrFeatureFilter(symbol: Sign) {
    if (symbol.type === '' || symbol.type === undefined) {
      this.mapState.toggleSymbol(symbol.id);
    } else {
      if (symbol.filterValue !== '' || symbol.filterValue !== undefined) this.mapState.toggleFeatureType(symbol.filterValue as string);
    }
  }

  public toggleCategoryFilter($event: MatCheckboxChange, category: SignCategory) {
    const categorySymbols = this.filterSymbols.filter(
      (symbol: Sign) => symbol.kat === category.name
    );

    if($event.checked) {
      categorySymbols.forEach((symbol: any) => {
        if (symbol.hidden) {
          this.toggleSymbolOrFeatureFilter(symbol);
        }
      })
    } else {
      categorySymbols.forEach((symbol: any) => {
        if (!symbol.hidden) {
          this.toggleSymbolOrFeatureFilter(symbol);
        }
      })
    }
  }

  public toggleClustering() {
    this.mapState.toggleClustering();
  }
}
