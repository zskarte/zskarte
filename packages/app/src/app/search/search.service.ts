import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  IFoundLocation,
  IResultSet,
  IZsMapSearchConfig,
  IZsMapSearchResult,
  SearchFunction,
} from '../../../../types/state/interfaces';
import { coordinateFromString } from '../helper/coordinates-extract';
import { I18NService } from '../state/i18n.service';
import { GeoJSONFeature, default as GeoJSON } from 'ol/format/GeoJSON';
import { Feature } from 'ol';
import { Geometry, LineString, MultiLineString } from 'ol/geom';
import { Extent, containsCoordinate, getCenter } from 'ol/extent';
import { Coordinate, distance } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { ZsMapStateService } from '../state/state.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private _i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);

  private _searchConfigs: IZsMapSearchConfig[] = [];
  private sortReferencePoint: Coordinate | null = null;
  private filterArea: Extent | null = null;
  private _softFilterMaxDist = 20_000;

  geocoderUrl = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&searchText=';
  streetGeometryUrl =
    'https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.amtliches-strassenverzeichnis&searchField=stn_label&geometryFormat=geojson&sr=3857&searchText=';
  streetGeometryByIdUrl =
    'https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.swisstopo.amtliches-strassenverzeichnis&searchField=str_esid&geometryFormat=geojson&sr=4326&contains=false&searchText=';

  constructor() {
    this.addSearch(this.coordinateSearch.bind(this), this._i18n.get('coordinates'), undefined, -1);
    this.addSearch(this.geoAdminStreetGeometrySearch.bind(this), this._i18n.get('streetSearch'), undefined, 50);
    this.addSearch(this.geoAdminLocationSearch.bind(this), 'Geo Admin', undefined, 100);
  }

  public setSortReferencePoint(center: Coordinate) {
    this.sortReferencePoint = center;
  }

  private getSortReferencePoint() {
    return this.sortReferencePoint ?? this._state.getMapCenter();
  }

  private getFilterArea() {
    return this.filterArea;
  }

  private getSoftFilterArea() {
    return this._state.getMapExtent();
  }

  private filterByAreaOrDistance(locations: IZsMapSearchResult[]) {
    const filterArea = this.getFilterArea();
    if (filterArea) {
      return locations.filter((l) => l.internal?.center && containsCoordinate(filterArea, l.internal.center));
    }
    const softFilterArea = this.getSoftFilterArea();
    return locations.filter(
      (l) =>
        (l.internal?.center && containsCoordinate(softFilterArea, l.internal.center)) ||
        (l.internal?.dist && l.internal.dist < this._softFilterMaxDist),
    );
  }

  async coordinateSearch(text: string) {
    const coords = coordinateFromString(text);
    if (coords) {
      return [{ label: text, lonLat: coords }];
    }
    return [];
  }

  async geoAdminLocationSearch(text: string, abortController: AbortController, maxResultCount?: number) {
    if (!navigator.onLine) {
      return [];
    }
    let url = this.geocoderUrl + encodeURIComponent(text);
    if (maxResultCount !== undefined) {
      url = `${url}&limit=${maxResultCount}`;
    }
    const result: { results: IFoundLocation[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }
    const sortCenter = this.getSortReferencePoint();
    const foundLocations: IZsMapSearchResult[] = [];

    result.results
      .filter((r) => r?.attrs?.label)
      .forEach((r) => {
        const lonLat = [r.attrs.lon, r.attrs.lat];
        const mercatorCoordinates = transform(lonLat, 'EPSG:4326', 'EPSG:3857');
        const dist = distance(sortCenter, mercatorCoordinates);
        foundLocations.push({
          label: r.attrs.label,
          lonLat,
          mercatorCoordinates,
          internal: { ...r, dist, center: mercatorCoordinates },
        });
      });
    foundLocations.sort((a, b) => a.internal.dist - b.internal.dist);
    return foundLocations;
  }

  async geoAdminStreetGeometrySearch(text: string, abortController: AbortController) {
    if (!navigator.onLine) {
      return [];
    }
    const url = this.streetGeometryUrl + encodeURIComponent(text);
    const format = new GeoJSON();
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }
    const sortCenter = this.getSortReferencePoint();
    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.properties?.['stn_label'])
      .forEach((r) => {
        const feature = format.readFeature(r) as Feature<Geometry>;
        let center = getCenter(r.bbox as Extent);
        const geometry = feature.getGeometry();
        if (geometry && 'getClosestPoint' in geometry) {
          center = geometry.getClosestPoint(center);
        }
        const dist = distance(sortCenter, center);
        foundLocations.push({
          label: `${r.properties?.['stn_label']} (${r.properties?.['zip_label']})`,
          feature,
          internal: { dist, center },
        });
      });
    foundLocations.sort((a, b) => a.internal.dist - b.internal.dist);
    return this.filterByAreaOrDistance(foundLocations);
  }

  public async geoAdminStreetGeometryById(id: string) {
    if (!navigator.onLine) {
      return null;
    }
    const url = this.streetGeometryByIdUrl + encodeURIComponent(id);
    const format = new GeoJSON();
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (result.results.length > 0) {
      return format.readFeature(result.results[0]) as Feature<Geometry>;
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

  createSearchInstance(): {
    searchResults$: Observable<IResultSet[] | null>;
    updateSearchTerm: (searchText: string) => void;
  } {
    const searchSubject = new BehaviorSubject<string>('');
    let abortController: AbortController | undefined;

    const searchResults$ = searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(async (searchText) => {
        if (abortController) {
          abortController.abort();
        }
        abortController = new AbortController();

        return this.processConfigs(searchText, abortController);
      }),
    );

    return {
      searchResults$,
      updateSearchTerm: (searchText: string) => {
        searchSubject.next(searchText);
      },
    };
  }

  async simpleSearch(searchText: string): Promise<IResultSet[]> {
    return (await this.processConfigs(searchText, new AbortController())) ?? [];
  }

  private async processConfigs(searchText: string, abortController: AbortController): Promise<IResultSet[] | null> {
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
        const results = await config.func(searchText, abortController, config.maxResultCount);
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
}
