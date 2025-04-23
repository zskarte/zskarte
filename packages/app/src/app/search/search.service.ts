import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
  IFoundLocation,
  IResultSet,
  IZsMapSearchConfig,
  IZsMapSearchResult,
  IZsGlobalSearchConfig,
  SearchFunction,
} from '../../../../types/state/interfaces';
import { coordinateFromString } from '../helper/coordinates-extract';
import { I18NService } from '../state/i18n.service';
import { GeoJSONFeature, default as GeoJSON } from 'ol/format/GeoJSON';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Extent, containsCoordinate, getCenter, extend, getIntersection, createEmpty } from 'ol/extent';
import { Coordinate, squaredDistance } from 'ol/coordinate';
import { transform, transformExtent } from 'ol/proj';
import { ZsMapStateService } from '../state/state.service';

const FULL_WIDTH_SWISS = 350_000;
const FULL_HEIGHT_SWISS = 226_000;

type zoomToFitFunc = (extent: Extent, padding?: [number, number, number, number], maxZoom?: number) => void;

const GEOCODE_ORIGIN_TO_LAYER = {
  zipcode: 'ch.swisstopo-vd.ortschaftenverzeichnis_plz',
  gg25: 'ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill',
  district: 'ch.swisstopo.swissboundaries3d-bezirk-flaeche.fill',
  kantone: 'ch.swisstopo.swissboundaries3d-kanton-flaeche.fill',
  //'gazetteer':['ch.swisstopo.swissnames3d','ch.bav.haltestellen-oev'],
  //'address':'ch.bfs.gebaeude_wohnungs_register',
} as const;

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private _i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private zoomToFit: zoomToFitFunc | null = null;

  private _searchConfigs: IZsMapSearchConfig[] = [];
  private formatGeoJSON = new GeoJSON();

  geocoderUrl = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&searchText=';
  geocoderGeometryUrlPrefix = 'https://api3.geo.admin.ch/rest/services/api/MapServer/';
  geocoderGeometryUrlSuffix = '?geometryFormat=geojson&sr=3857';
  streetGeometryUrl =
    'https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.amtliches-strassenverzeichnis&searchField=stn_label&geometryFormat=geojson&sr=3857&searchText=';
  streetGeometryByIdUrl =
    'https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.amtliches-strassenverzeichnis&searchField=str_esid&geometryFormat=geojson&sr=3857&contains=false&searchText=';

  constructor() {
    this.addSearch(this.coordinateSearch.bind(this), this._i18n.get('coordinates'), undefined, -1);
    this.addSearch(this.geoAdminStreetGeometrySearch.bind(this), this._i18n.get('streetSearch'), undefined, 50);
    this.addSearch(this.geoAdminLocationSearch.bind(this), 'Geo Admin', undefined, 100);
  }

  public setZoomToFit(func: zoomToFitFunc) {
    this.zoomToFit = func;
  }

  public getDistanceReferenceCoordinate(searchConfig: IZsGlobalSearchConfig) {
    return searchConfig.distanceReferenceCoordinate ?? this._state.getMapCenter();
  }

  private extendExtentAroundPoint(extent: Extent, refCoord: Coordinate) {
    const [minX, minY, maxX, maxY] = extent;

    const distanceLeft = refCoord[0] - minX;
    const distanceRight = maxX - refCoord[0];
    const distanceTop = maxY - refCoord[1];
    const distanceBottom = refCoord[1] - minY;
    const maxDistance = Math.max(distanceLeft, distanceRight, distanceTop, distanceBottom);

    return this.getExtentByCoordAndDist(refCoord, maxDistance);
  }

  public getExtentByCoordAndDist(center: Coordinate, dist: number) {
    //web mercator / EPSG:3857 is a metric system so can calucate directly.
    return [center[0] - dist, center[1] - dist, center[0] + dist, center[1] + dist];
  }

  private createOrCombineExtent(combinedExtent: Extent | null, newExtent: Extent) {
    if (!combinedExtent) {
      combinedExtent = createEmpty();
      extend(combinedExtent, newExtent);
    } else {
      getIntersection(combinedExtent, newExtent, combinedExtent);
    }
    return combinedExtent;
  }

  public getSearchFilterArea(searchConfig: IZsGlobalSearchConfig) {
    let combinedExtent: Extent | null = null;
    if (searchConfig.filterByArea) {
      const areaExtent = searchConfig.area;
      if (areaExtent) {
        combinedExtent = this.createOrCombineExtent(combinedExtent, areaExtent);
      }
    }

    if (searchConfig.filterMapSection) {
      const mapExtent = this._state.getMapExtent();
      combinedExtent = this.createOrCombineExtent(combinedExtent, mapExtent);
    }

    if (searchConfig.filterByDistance) {
      const distExtent = this.getExtentByCoordAndDist(
        this.getDistanceReferenceCoordinate(searchConfig),
        searchConfig.maxDistance,
      );
      combinedExtent = this.createOrCombineExtent(combinedExtent, distExtent);
    }
    return combinedExtent;
  }

  async coordinateSearch(text: string) {
    const coords = coordinateFromString(text);
    if (coords) {
      return [{ label: text, lonLat: coords }];
    }
    return [];
  }

  async geoAdminLocationSearch(
    text: string,
    abortController: AbortController,
    searchConfig: IZsGlobalSearchConfig,
    maxResultCount?: number,
  ) {
    if (!navigator.onLine) {
      return [];
    }
    let url = this.geocoderUrl + encodeURIComponent(text);
    if (maxResultCount !== undefined) {
      url = `${url}&limit=${maxResultCount}`;
    }

    const refCoord = this.getDistanceReferenceCoordinate(searchConfig);
    const filterArea = this.getSearchFilterArea(searchConfig);
    let boxArea = filterArea;
    let boxAreaManipulated = false;
    if (searchConfig.sortedByDistance) {
      if (!boxArea) {
        //on geoadmin search the result can only be sorted by distance of center if there is an extent to get center from.
        //so create an extent from refCoord that always includes at least the whole swiss.
        boxArea = [
          refCoord[0] - FULL_WIDTH_SWISS,
          refCoord[1] - FULL_HEIGHT_SWISS,
          refCoord[0] + FULL_WIDTH_SWISS,
          refCoord[1] + FULL_HEIGHT_SWISS,
        ];
        boxAreaManipulated = true;
      } else {
        //if there is an filterArea, it's not guaranted that the center of the extend is refCoord
        //so create a new on that is at least filterArea but have refCoord as center
        if (containsCoordinate(boxArea, refCoord)) {
          //if the refCoord is not in allowed area keep area as is
          boxArea = this.extendExtentAroundPoint(boxArea, refCoord);
          boxAreaManipulated = true;
        }
      }
    }
    if (boxArea) {
      boxArea = transformExtent(boxArea, 'EPSG:3857', 'EPSG:21781');
      url = `${url}&bbox=${boxArea?.join(',')}&sortbbox=${searchConfig.sortedByDistance}`;
    }
    if (abortController.signal.aborted) {
      // if there is already a new search query skip request
      return [];
    }

    const result: { results: IFoundLocation[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }

    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.attrs?.label)
      .forEach((r) => {
        const lonLat = [r.attrs.lon, r.attrs.lat];
        const mercatorCoordinates = transform(lonLat, 'EPSG:4326', 'EPSG:3857');
        //if bbox is manipulated for sort order need to redo the area check
        if (boxAreaManipulated && filterArea && !containsCoordinate(filterArea, mercatorCoordinates)) {
          return;
        }
        if (
          r.attrs.objectclass === 'TLM_GEBIETSNAME' &&
          (r.attrs.label.indexOf('Grossregion') !== -1 || r.attrs.label.indexOf('Landschaftsname') !== -1)
        ) {
          return;
        }
        foundLocations.push({
          label: r.attrs.label,
          lonLat,
          mercatorCoordinates,
          internal: { id: r.id, ...r.attrs },
        });
      });
    return foundLocations;
  }

  public async geoAdminGeometryByOriginAndId(origin: string, featureId: string) {
    if (!navigator.onLine) {
      return null;
    }

    if (origin && featureId) {
      const detailLayerId = GEOCODE_ORIGIN_TO_LAYER[origin];
      if (detailLayerId) {
        const url =
          this.geocoderGeometryUrlPrefix +
          encodeURIComponent(detailLayerId) +
          '/' +
          encodeURIComponent(featureId) +
          this.geocoderGeometryUrlSuffix;
        const result: { feature: GeoJSONFeature } = await fetch(url).then((response) => response.json());
        if (result?.feature) {
          return this.formatGeoJSON.readFeature(result.feature) as Feature<Geometry>;
        }
      }
    }
    return null;
  }

  async geoAdminStreetGeometrySearch(
    text: string,
    abortController: AbortController,
    searchConfig: IZsGlobalSearchConfig,
  ) {
    if (!navigator.onLine) {
      return [];
    }
    const url = this.streetGeometryUrl + encodeURIComponent(text);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }

    const refCoord = this.getDistanceReferenceCoordinate(searchConfig);
    const filterArea = this.getSearchFilterArea(searchConfig);
    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.properties?.['stn_label'])
      .forEach((r) => {
        const feature = this.formatGeoJSON.readFeature(r) as Feature<Geometry>;
        let center = getCenter(r.bbox as Extent);
        const geometry = feature.getGeometry();
        if (geometry && 'getClosestPoint' in geometry) {
          center = geometry.getClosestPoint(center);
        }
        if (!filterArea || containsCoordinate(filterArea, center)) {
          let dist: number | undefined = undefined;
          if (searchConfig.sortedByDistance) {
            dist = squaredDistance(refCoord, center);
          }
          foundLocations.push({
            label: `${r.properties?.['stn_label']} (${r.properties?.['zip_label']})`,
            feature,
            internal: {
              dist,
              center,
              id: r.id,
            },
          });
        }
      });
    if (searchConfig.sortedByDistance) {
      foundLocations.sort((a, b) => (a.internal?.dist ?? Infinity) - (b.internal?.dist ?? Infinity));
    } else {
      const collator = new Intl.Collator();
      foundLocations.sort((a, b) => collator.compare(a.label, b.label));
    }
    return foundLocations;
  }

  public async geoAdminStreetGeometryById(id: string) {
    if (!navigator.onLine) {
      return null;
    }
    const url = this.streetGeometryByIdUrl + encodeURIComponent(id);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (result.results.length > 0) {
      return this.formatGeoJSON.readFeature(result.results[0]) as Feature<Geometry>;
    }
    return null;
  }

  public addSearch(
    searchFunc: SearchFunction,
    searchName: string,
    maxResultCount: number | undefined = undefined,
    resultOrder: number | undefined = undefined,
  ) {
    const configs = this._searchConfigs;
    const config: IZsMapSearchConfig = {
      label: searchName,
      func: searchFunc,
      active: true,
      maxResultCount: maxResultCount ?? 50,
      resultOrder: resultOrder ?? 0,
    };
    configs.push(config);
    configs.sort((a, b) => a.resultOrder - b.resultOrder);
    this._searchConfigs = configs;
  }

  public removeSearch(searchFunc: SearchFunction) {
    this._searchConfigs = this._searchConfigs.filter((conf) => conf.func !== searchFunc);
  }

  createSearchInstance(searchConfig: IZsGlobalSearchConfig): {
    searchResults$: Observable<IResultSet[] | null>;
    updateSearchTerm: (searchText: string) => void;
    updateSearchConfig: (newSearchConfig: IZsGlobalSearchConfig) => void;
  } {
    const searchSubject = new BehaviorSubject<string>('');
    const searchConfigSubject = new BehaviorSubject<IZsGlobalSearchConfig>(searchConfig);
    let abortController: AbortController | undefined;

    const searchResults$ = combineLatest([
      searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
      searchConfigSubject,
    ]).pipe(
      switchMap(([searchText, searchConfig]) => {
        if (searchText) {
          if (searchConfig.filterMapSection) {
            return this._state.observeMapExtent().pipe(map((extent) => ({ searchText, searchConfig, extent })));
          } else if (searchConfig.filterByDistance || searchConfig.sortedByDistance) {
            return this._state.observeMapCenter().pipe(map((center) => ({ searchText, searchConfig, center })));
          }
        }
        return of({ searchText, searchConfig });
      }),
      switchMap(({ searchText, searchConfig }) => {
        if (abortController) {
          abortController.abort();
        }
        abortController = new AbortController();

        return this.processConfigs(searchText, abortController, searchConfig);
      }),
    );

    return {
      searchResults$,
      updateSearchTerm: (searchText: string) => {
        searchSubject.next(searchText);
      },
      updateSearchConfig: (newSearchConfig: IZsGlobalSearchConfig) => {
        searchConfigSubject.next(newSearchConfig);
      },
    };
  }

  async simpleSearch(searchText: string, searchConfig: IZsGlobalSearchConfig): Promise<IResultSet[]> {
    return (await this.processConfigs(searchText, new AbortController(), searchConfig)) ?? [];
  }

  private async processConfigs(
    searchText: string,
    abortController: AbortController,
    searchConfig: IZsGlobalSearchConfig,
  ): Promise<IResultSet[] | null> {
    if (searchText.length <= 1) {
      return [];
    }
    const resultSets: IResultSet[] = [];

    for (const config of this._searchConfigs) {
      if (!config.active) continue;

      if (abortController.signal.aborted) {
        return null;
      }

      try {
        const results = await config.func(searchText, abortController, searchConfig, config.maxResultCount);
        if (results.length > 0) {
          resultSets.push({ config, results, collapsed: 'peek' });
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return [];
        }
        console.error('Error on handle search config:', error);
      }
    }

    return resultSets;
  }

  public async highlightResult(element: IZsMapSearchResult | null, focus: boolean) {
    if (element) {
      let coordinates: Coordinate | undefined;
      if (element.mercatorCoordinates) {
        coordinates = element.mercatorCoordinates;
      } else if (element.lonLat) {
        coordinates = element.mercatorCoordinates = transform(element.lonLat, 'EPSG:4326', 'EPSG:3857');
      }
      if (coordinates) {
        this._state.updateSearchResultFeatures([]);
        this._state.updatePositionFlag({ isVisible: true, coordinates });
        if (element.internal?.origin && element.internal?.featureId) {
          if (!element.feature) {
            element.feature =
              (await this.geoAdminGeometryByOriginAndId(element.internal.origin, element.internal.featureId)) ??
              undefined;
          }
          if (element.feature) {
            this._state.updateSearchResultFeatures([element.feature]);
          }
        }
        if (focus) {
          if (this.zoomToFit && element.internal?.geom_st_box2d) {
            const coords = element.internal.geom_st_box2d.match(/BOX\(([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)/);
            if (coords) {
              const minX = parseFloat(coords[1]);
              const minY = parseFloat(coords[2]);
              const maxX = parseFloat(coords[3]);
              const maxY = parseFloat(coords[4]);
              let extent: Extent = [minX, minY, maxX, maxY];
              extent = transformExtent(extent, 'EPSG:21781', 'EPSG:3857');
              this.zoomToFit(extent);
              return;
            }
          }
          this._state.setMapCenter(coordinates);
        }
        return;
      } else if (element.feature) {
        this._state.updateSearchResultFeatures([element.feature]);
        const extent = element.feature.getGeometry()?.getExtent();
        if (focus && extent) {
          if (this.zoomToFit) {
            this.zoomToFit(extent);
          }
          this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
        } else {
          this._state.updatePositionFlag({ isVisible: true, coordinates: element.internal?.center ?? [0, 0] });
        }
        return;
      }
    }
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
  }
}
