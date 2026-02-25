import { Injectable, WritableSignal, effect, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
  IFoundLocation,
  IResultSet,
  IZsMapSearchConfig,
  IZsMapSearchResult,
  IZsGlobalSearchConfig,
  SearchFunction,
} from '@zskarte/types';
import { coordinateFromString } from '../helper/coordinates-extract';
import { I18NService } from '../state/i18n.service';
import { GeoJSONFeature, default as GeoJSON } from 'ol/format/GeoJSON';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import {
  Extent,
  containsCoordinate,
  getCenter,
  extend,
  getIntersection,
  createEmpty,
  extendCoordinate,
  intersects,
  approximatelyEquals,
} from 'ol/extent';
import { Coordinate, squaredDistance } from 'ol/coordinate';
import { fromLonLat, transformExtent } from 'ol/proj';
import { ZsMapStateService } from '../state/state.service';
import { DomSanitizer } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

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
const LAYER_STREET = 'ch.swisstopo.amtliches-strassenverzeichnis';
const LAYER_WATER = 'ch.swisstopo.swisstlm3d-gewaessernetz';

export const ADDRESS_TOKEN_REGEX = /addr:\(((?:[^()]|\([^)]*\))*)\)(?:\[(.*?)\])?/;
export const ADDRESS_TOKEN_REPLACEMENT_ADDRESS = (p1: string) => p1;
export const ADDRESS_TOKEN_REPLACEMENT_SHOW_MARKER = (p1: string, p2: string) =>
  `<span data-geo="${p2}" class="addr-geo addr-show"><span class="material-icons">place</span><span class="text addr-search">${p1}</span></span>`;
export const ADDRESS_TOKEN_REPLACEMENT_SHOW_MARKER_MISSING = (p1: string) =>
  `<span class="addr-geo addr-search"><span class="material-icons">search</span><span class="text">${p1}</span></span>`;
export const ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER = (p1: string, p2: string) =>
  `<span data-geo="${p2}" class="addr-geo"><span class="addr-show"></span><span class="text addr-search">${p1}</span><span class="addr-edit"></span></span>`;
export const ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER_MISSING = (p1: string) =>
  `<span class="addr-geo addr-search"><span class="addr-show addr-unknown"></span><span class="text">${p1}</span><span class="addr-edit"></span></span>`;

export function getGlobalAddressTokenRegex() {
  return new RegExp(ADDRESS_TOKEN_REGEX.source, ADDRESS_TOKEN_REGEX.flags + 'g');
}

const STREET_START_WORD_REGEX =
  /(?:(?:ob|unt|vor|hint)ere|(?:alte|neue)|(?:via|val|voa)(?: da(?:l|lla|ls)?| val)(?: las?| l| di | d)?|(?:chemin|ch.|route|rue|place|avenue|sentier|promenade|pont|parc|passage|escaliers|galerie|allée|boulevard|quartier|passerelle|quai|impasse|vy|tunnel)(?: du| de(?: la| l)?| des| d)?|\b\p{L}*schul(?:e|haus(?:es)?|gebäude|anlage)|(?:industrie|sport)(?:zone|gebiet|zentrum)|bahnhof|bhf|flughafen|(?:turn|sport)halle)/giu;
const STREET_WITH_NAME_SUFFIX_REGEX =
  /\p{L}+(?:strass?e?|str\.?|(?:weg|gäss|mätte?)(?:li|lein)?|gass[ea]?|matt(?:e|en)?|ac[hk]er|rain|feld|dorf|hag|ried|halde|graben|allee|(?<!h)alle|ring|platz|pl\.?|tunnel|berg|hof|loch|bach|egg|viadukt|damm|wil|hubel|holz|wald|weid|park|stutz|promenade|steg|rank|brücke|quai|garten|reben|gut|bühl|moos|rue|schule)/giu;

const NOT_PLACE_WORD =
  /(?:ab|auf|am|im|in|bei|zu|von|um|zur|als|der|die|dass?|mit|ist|ca|bis|ein(?:e|en)?|und|für|wie|sind|daneben|entlang|wurde|steht|nicht|über|alle|Kreisel)\b/giu;
const STREET_NAME = new RegExp(
  `(?:\\b${STREET_START_WORD_REGEX.source}\\b[ ']\\b(?!${NOT_PLACE_WORD.source})\\p{L}+\\b|\\b${STREET_WITH_NAME_SUFFIX_REGEX.source})`,
  'gui',
);
const STREET_WITH_NUMBER = new RegExp(`${STREET_NAME.source}(?: \\d{1,3}(?: ?[a-z])?)?\\b`, 'gui');
const PLACE_WITH_PLZ = /(?:,| in)? (\d{4} \p{L}+\b)/giu;
const PLACE_AFTER_IN = new RegExp(` in (?!${NOT_PLACE_WORD.source})(\\p{L}+\\b)`, 'gui');
const PLACE_AFTER_COMMA = new RegExp(
  `, ?(?!${NOT_PLACE_WORD.source})(?!${STREET_START_WORD_REGEX.source})(?!${STREET_WITH_NAME_SUFFIX_REGEX.source})(\\p{L}+\\b)`,
  'gui',
);

export const ADDRESS_REGEX = new RegExp(
  `(${STREET_WITH_NUMBER.source})(?:${PLACE_WITH_PLZ.source}|${PLACE_AFTER_IN.source}|${PLACE_AFTER_COMMA.source})?`,
  'gui',
);
export const ADDRESS_TOKEN_OR_NEW_REGEX = new RegExp(
  `(?:${ADDRESS_TOKEN_REGEX.source}|${ADDRESS_REGEX.source})`,
  'gui',
);

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private _i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private _sanitizer = inject(DomSanitizer);
  private zoomToFit: zoomToFitFunc | null = null;
  public readonly addressPreview = signal(false);
  private readonly activeView = toSignal(this._state.observeActiveView());

  private _searchConfigs: IZsMapSearchConfig[] = [];
  private formatGeoJSON = new GeoJSON();
  private globalSearchInputText?: WritableSignal<string>;

  searchServiceUrl = 'https://api3.geo.admin.ch/rest/services/api/SearchServer';
  mapServiceUrl = 'https://api3.geo.admin.ch/rest/services/api/MapServer';
  searchParam = '&searchText=';
  geomentryParams = 'geometryFormat=geojson&sr=3857';
  geocoderUrl = `${this.searchServiceUrl}?type=locations${this.searchParam}`;
  mapServiceFindUrlPrefix = `${this.mapServiceUrl}/find?${this.geomentryParams}&layer=`;
  searchServerFeatureUrlPrefix = `${this.searchServiceUrl}?type=featuresearch&features=`;

  streetGeometryUrl = `${this.mapServiceFindUrlPrefix}${LAYER_STREET}&searchField=stn_label${this.searchParam}`;
  streetGeometryByIdUrl = `${this.mapServiceFindUrlPrefix}${LAYER_STREET}&searchField=str_esid${this.searchParam}`;
  streetSearchUrl = `${this.searchServerFeatureUrlPrefix}${LAYER_STREET}${this.searchParam}`;

  waterGeometryUrl = `${this.mapServiceFindUrlPrefix}${LAYER_WATER}&searchField=name${this.searchParam}`;
  waterGeometryByIdUrl = `${this.mapServiceFindUrlPrefix}${LAYER_WATER}&searchField=id${this.searchParam}`;

  constructor() {
    this.addSearch(this.coordinateSearch.bind(this), this._i18n.get('coordinates'), undefined, -1);
    this.addSearch(this.geoAdminStreetGeometrySearch.bind(this), this._i18n.get('streetSearch'), undefined, 50);
    this.addSearch(this.geoAdminWaterGeometrySearch.bind(this), this._i18n.get('waterSearch'), undefined, 90);
    this.addSearch(this.geoAdminLocationSearch.bind(this), 'Geo Admin', undefined, 100);

    effect(() => {
      const activeView = this.activeView();
      if (activeView === 'journal') {
        //deactivate if change to journal
        this.addressPreview.set(false);
        this._state.updateSearchResultFeatures([]);
        if (this.globalSearchInputText) {
          this.globalSearchInputText.set('');
        }
      }
    });

    effect(() => {
      const activeView = this.activeView();
      const addressPreview = this.addressPreview();
      if (activeView === 'journal') {
        //if journal, populate preview in state
        this._state.setJournalAddressPreview(addressPreview);
      }
      if (!addressPreview) {
        this._state.updateSearchResultFeatures([]);
        this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
        if (this.globalSearchInputText) {
          this.globalSearchInputText.set('');
        }
      }
    });
  }

  public handleEsc(event: Event) {
    if (this.addressPreview()) {
      this.addressPreview.set(false);
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
    if (this._state.getCurrentPositionFlag().isVisible) {
      this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
    return undefined;
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
    const maxDistanceX = Math.max(distanceLeft, distanceRight);
    const maxDistanceY = Math.max(distanceTop, distanceBottom);

    return this.getExtentByCoordAndDist(refCoord, maxDistanceX, maxDistanceY);
  }

  public getExtentByCoordAndDist(center: Coordinate, distX: number, distY: number) {
    //web mercator / EPSG:3857 is a metric system so can calucate directly.
    return [center[0] - distX, center[1] - distY, center[0] + distX, center[1] + distY];
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

  private inflateExtent(extent, factor) {
    const [minX, minY, maxX, maxY] = extent;
    const dx = ((maxX - minX) * factor) / 2;
    const dy = ((maxY - minY) * factor) / 2;
    return [minX - dx, minY - dy, maxX + dx, maxY + dy];
  }

  public getSearchFilterArea(searchConfig: IZsGlobalSearchConfig, inflatedMapSectionExtent?: number) {
    let combinedExtent: Extent | null = null;
    if (searchConfig.filterByArea) {
      const areaExtent = searchConfig.area;
      if (areaExtent) {
        combinedExtent = this.createOrCombineExtent(combinedExtent, areaExtent);
      }
    }

    if (searchConfig.filterMapSection) {
      let mapExtent = this._state.getMapExtent();
      if (inflatedMapSectionExtent) {
        mapExtent = this.inflateExtent(mapExtent, inflatedMapSectionExtent);
      }
      combinedExtent = this.createOrCombineExtent(combinedExtent, mapExtent);
    }

    if (searchConfig.filterByDistance) {
      const distExtent = this.getExtentByCoordAndDist(
        this.getDistanceReferenceCoordinate(searchConfig),
        searchConfig.maxDistance,
        searchConfig.maxDistance,
      );
      combinedExtent = this.createOrCombineExtent(combinedExtent, distExtent);
    }
    return combinedExtent;
  }

  private sortSearchResults(
    results: IZsMapSearchResult[],
    searchConfig: IZsGlobalSearchConfig,
    alphabetical = false,
  ): IZsMapSearchResult[] {
    const mapExtent = this._state.getMapExtent();
    const collator = alphabetical ? new Intl.Collator() : undefined;

    return results.sort((a, b) => {
      if (searchConfig.sortedByDistance) {
        return (a.internal?.dist ?? Number.MAX_SAFE_INTEGER) - (b.internal?.dist ?? Number.MAX_SAFE_INTEGER);
      }

      const aCoord = a.mercatorCoordinates || a.internal?.center;
      const bCoord = b.mercatorCoordinates || b.internal?.center;

      if (aCoord && bCoord) {
        const aInExtent = mapExtent ? containsCoordinate(mapExtent, aCoord) : false;
        const bInExtent = mapExtent ? containsCoordinate(mapExtent, bCoord) : false;

        if (aInExtent !== bInExtent) {
          return aInExtent ? -1 : 1;
        }
      }

      if (collator) {
        return collator.compare(a.label, b.label);
      }

      return 0; // Maintain existing order
    });
  }

  async coordinateSearch(text: string) {
    const coords = coordinateFromString(text);
    if (coords) {
      return [
        { label: text, lonLat: coords, internal: { addressToken: `addr:(${text})[lonLat:${coords.join(' ')}]` } },
      ];
    }
    return [];
  }

  private additionalFilterGeoAdminLocationSearch(r: IFoundLocation) {
    if (
      r.attrs.objectclass === 'TLM_GEBIETSNAME' &&
      (r.attrs.label.indexOf('Grossregion') !== -1 || r.attrs.label.indexOf('Landschaftsname') !== -1)
    ) {
      return false;
    }
    return true;
  }
  geoAdminLocationSearch = this.searchServerFunc(this.geocoderUrl, this.additionalFilterGeoAdminLocationSearch);

  private updateSearchResultEntryForStreetSearch(entry: IZsMapSearchResult, r: IFoundLocation): IZsMapSearchResult {
    return {
      ...entry,
      internal: { ...entry.internal, addressToken: `addr:(${entry.label})[str_esid:${r.attrs?.['featureId']}]` },
    };
  }
  geoAdminStreetSearch = this.searchServerFunc(
    this.streetSearchUrl,
    undefined,
    this.updateSearchResultEntryForStreetSearch,
    true,
  );

  searchServerFunc(
    searchUrl: string,
    additionalFilter?: (r: IFoundLocation) => boolean,
    updateSearchResultEntry?: (entry: IZsMapSearchResult, r: IFoundLocation) => IZsMapSearchResult,
    inflatedMapSectionBbox?: boolean,
  ) {
    return async (
      text: string,
      abortController: AbortController,
      searchConfig: IZsGlobalSearchConfig,
      maxResultCount?: number,
    ) => {
      if (!navigator.onLine) {
        return [];
      }
      let url = searchUrl + encodeURIComponent(text);
      if (maxResultCount !== undefined) {
        url = `${url}&limit=${maxResultCount}`;
      }

      const refCoord = this.getDistanceReferenceCoordinate(searchConfig);
      const filterArea = this.getSearchFilterArea(searchConfig);
      let boxArea = filterArea;
      let boxAreaManipulated = false;
      if (filterArea && inflatedMapSectionBbox && searchConfig.filterMapSection) {
        //to find line/polygon features where the center is not on map inflate the extent by 20%
        boxArea = this.getSearchFilterArea(searchConfig, 0.5);
        if (boxArea && !approximatelyEquals(filterArea, boxArea, 0.01)) {
          boxAreaManipulated = true;
        }
      }
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
          //if there is an filterArea, it's not guaranted that the center of the extent is refCoord
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
          const mercatorCoordinates = fromLonLat(lonLat);
          //if bbox is manipulated for sort order need to redo the area check
          if (boxAreaManipulated && filterArea && !containsCoordinate(filterArea, mercatorCoordinates)) {
            //if it's a feature result (potential line/polygon) check the extent/bbox and only skip if no intersection
            if (r.attrs.origin === 'feature' && r.attrs.geom_st_box2d) {
              const extent = this.extentFromGeomStBox2d(r.attrs.geom_st_box2d);
              if (!extent || !intersects(filterArea, extent)) {
                return;
              }
            } else {
              return;
            }
          }
          if (additionalFilter && !additionalFilter(r)) {
            return;
          }
          let linkText = r.attrs.label.replace(/<[^>]*>/g, '');
          if (r.attrs.label.indexOf('<i>') !== -1) {
            //if there is an "result type" extract the bold text
            const match = r.attrs.label.match(/<b>(.*?)<\/b>/);
            if (match) {
              linkText = match[1].replace(/<[^>]*>/g, '');
            }
          }

          let searchResultEntry: IZsMapSearchResult = {
            label: r.attrs.label,
            lonLat,
            mercatorCoordinates,
            internal: {
              id: r.id,
              dist: refCoord ? squaredDistance(refCoord, mercatorCoordinates) : undefined,
              ...r.attrs,
              addressToken: `addr:(${linkText})[lonLat:${lonLat.join(' ')}]`,
            },
          };
          if (updateSearchResultEntry) {
            searchResultEntry = updateSearchResultEntry(searchResultEntry, r);
          }
          foundLocations.push(searchResultEntry);
        });

      return this.sortSearchResults(foundLocations, searchConfig);
    };
  }

  public async geoAdminGeometryByOriginAndId(origin: string, featureId: string, layer?: string) {
    if (!navigator.onLine) {
      return null;
    }

    if (origin && featureId) {
      let detailLayerId = GEOCODE_ORIGIN_TO_LAYER[origin];
      if (!detailLayerId && origin === 'feature') {
        detailLayerId = layer;
      }

      if (detailLayerId) {
        const url = `${this.mapServiceUrl}/${encodeURIComponent(detailLayerId)}/${encodeURIComponent(featureId)}?${this.geomentryParams}`;
        const result: { feature: GeoJSONFeature } = await fetch(url).then((response) => response.json());
        if (result?.feature) {
          return this.formatGeoJSON.readFeature(result.feature) as Feature<Geometry>;
        }
      }
    }
    return null;
  }

  // the 'MapServer/find' endpoint only allow to search on single field and don't have any filter, sorting, paging options:
  // for street names with many occurences only first 200 are returned and the desired one may not be contained.
  async geoAdminStreetGeometrySearch(
    text: string,
    abortController: AbortController,
    searchConfig: IZsGlobalSearchConfig,
  ) {
    if (!navigator.onLine) {
      return [];
    }
    const parts = text.split(',');
    const url = this.streetGeometryUrl + encodeURIComponent(parts[0]);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }

    const zipLabel = parts.length > 1 ? parts[1].trim().toLowerCase() : undefined;
    const refCoord = this.getDistanceReferenceCoordinate(searchConfig);
    const filterArea = this.getSearchFilterArea(searchConfig);
    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.properties?.['stn_label'])
      .forEach((r) => {
        if (zipLabel) {
          if ((r?.properties?.['zip_label'] as string).toLowerCase().indexOf(zipLabel) === -1) {
            return;
          }
        }
        const feature = this.formatGeoJSON.readFeature(r) as Feature<Geometry>;
        let center = getCenter(r.bbox as number[]);
        const geometry = feature.getGeometry();
        if (geometry && 'getClosestPoint' in geometry) {
          center = geometry.getClosestPoint(center);
        }
        if (!filterArea || containsCoordinate(filterArea, center) || intersects(filterArea, this.bboxToExtent(r.bbox as number[]))) {
          const dist = refCoord ? squaredDistance(refCoord, center) : undefined;
          const label = `${r.properties?.['stn_label']}, ${r.properties?.['zip_label']}`;
          foundLocations.push({
            label,
            feature,
            internal: {
              dist,
              center,
              id: r.id,
              addressToken: `addr:(${label})[str_esid:${r.properties?.['str_esid']}]`,
            },
          });
        }
      });

    //if the results are truncated by hard limit or there are limited result count(and input is considered as a street name): also try the searchService
    if (result.results.length >= 200 || (foundLocations.length < 20 && STREET_NAME.test(text))) {
      const searchResult = await this.geoAdminStreetSearch(text, abortController, searchConfig);
      searchResult.forEach((entry) => {
        if (entry.internal?.featureId) {
          const featureId = parseInt(entry.internal?.featureId);
          if (!foundLocations.find((e) => e.internal?.id === featureId)) {
            foundLocations.push(entry);
          }
        }
      });
    }

    return this.sortSearchResults(foundLocations, searchConfig, true);
  }

  public async geoAdminStreetGeometryById(id: string) {
    if (!navigator.onLine) {
      return null;
    }
    const url = this.streetGeometryByIdUrl + encodeURIComponent(id);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (result?.results?.length > 0) {
      return this.formatGeoJSON.readFeature(result.results[0]) as Feature<Geometry>;
    }
    return null;
  }

  async geoAdminWaterGeometrySearch(
    text: string,
    abortController: AbortController,
    searchConfig: IZsGlobalSearchConfig,
  ) {
    if (!navigator.onLine) {
      return [];
    }
    const parts = text.split(',');
    const url = this.waterGeometryUrl + encodeURIComponent(parts[0]);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (abortController.signal.aborted) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }

    const refCoord = this.getDistanceReferenceCoordinate(searchConfig);
    const filterArea = this.getSearchFilterArea(searchConfig);
    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.properties?.['name'])
      .forEach((r) => {
        const feature = this.formatGeoJSON.readFeature(r) as Feature<Geometry>;
        let center = getCenter(r.bbox as number[]);
        const geometry = feature.getGeometry();
        if (geometry && 'getClosestPoint' in geometry) {
          center = geometry.getClosestPoint(center);
        }
        if (!filterArea || containsCoordinate(filterArea, center) || intersects(filterArea, this.bboxToExtent(r.bbox as number[]))) {
          const dist = refCoord ? squaredDistance(refCoord, center) : undefined;
          const label = r.properties?.['name'];
          foundLocations.push({
            label,
            feature,
            internal: {
              dist,
              center,
              id: r.id,
              addressToken: `addr:(${label})[gwl_nr:${r.properties?.['gwl_nr']},id:${r.id}]`,
            },
          });
        }
      });
    return this.sortSearchResults(foundLocations, searchConfig, true);
  }

  public async geoAdminWaterGeometryById(id: string) {
    if (!navigator.onLine) {
      return null;
    }
    const url = this.waterGeometryByIdUrl + encodeURIComponent(id);
    const result: { results: GeoJSONFeature[] } = await fetch(url).then((response) => response.json());
    if (result?.results?.length > 0) {
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

  createGlobalSearchInstance(searchConfig: IZsGlobalSearchConfig, inputText: WritableSignal<string>) {
    this.globalSearchInputText = inputText;
    return this.createSearchInstance(searchConfig);
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
    if (!searchText || typeof searchText !== 'string' || searchText.length <= 1) {
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

  bboxToExtent(box2d: number[]) {
    //[upper_left_x, upper_left_y, lower_right_x, lower_right_y] → [minX, minY, maxX, maxY]
    return [
      Math.min(box2d[0], box2d[2]), // minX
      Math.min(box2d[1], box2d[3]), // minY
      Math.max(box2d[0], box2d[2]), // maxX
      Math.max(box2d[1], box2d[3]), // maxY
    ];
  }

  extentFromGeomStBox2d(geom_st_box2d: string): Extent | null {
    const coords = geom_st_box2d.match(/BOX\(([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)/);
    if (coords) {
      const upper_left_x = parseFloat(coords[1]);
      const upper_left_y = parseFloat(coords[2]);
      const lower_right_x = parseFloat(coords[3]);
      const lower_right_y = parseFloat(coords[4]);
      const box2d = [upper_left_x, upper_left_y, lower_right_x, lower_right_y];
      return transformExtent(this.bboxToExtent(box2d), 'EPSG:21781', 'EPSG:3857');
    }
    return null;
  }

  public async highlightResult(element: IZsMapSearchResult | null, focus: boolean) {
    if (element) {
      let coordinates: Coordinate | undefined;
      if (element.mercatorCoordinates) {
        coordinates = element.mercatorCoordinates;
      } else if (element.lonLat) {
        coordinates = element.mercatorCoordinates = fromLonLat(element.lonLat);
      }
      if (coordinates) {
        this._state.updateSearchResultFeatures([]);
        this._state.updatePositionFlag({ isVisible: true, coordinates });
        if (element.internal?.origin && element.internal?.featureId) {
          if (!element.feature) {
            element.feature =
              (await this.geoAdminGeometryByOriginAndId(
                element.internal.origin,
                element.internal.featureId,
                element.internal.layer,
              )) ?? undefined;
          }
          if (element.feature) {
            this.addressPreview.set(true);
            this._state.updateSearchResultFeatures([element.feature]);
          }
        }
        if (focus) {
          if (this.zoomToFit && element.internal?.geom_st_box2d) {
            const extent = this.extentFromGeomStBox2d(element.internal.geom_st_box2d);
            if (extent) {
              this.zoomToFit(extent);
              return;
            }
          }
          this._state.setMapCenter(coordinates);
        }
        return;
      } else if (element.feature) {
        this.addressPreview.set(true);
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

  public async getHighlightGeometryFeature(locationInfo: string): Promise<Feature<Geometry> | null> {
    if (!locationInfo) return null;
    if (locationInfo.startsWith('lonLat:')) {
      const lonLat = locationInfo
        .substring(7)
        .split(' ')
        .map((v) => parseFloat(v));
      const mercatorCoordinates = fromLonLat(lonLat);
      return new Feature(new Point(mercatorCoordinates));
    }
    if (locationInfo.startsWith('str_esid:')) {
      const esid = locationInfo.substring(9);
      return await this.geoAdminStreetGeometryById(esid);
    }
    if (locationInfo.startsWith('gwl_nr:')) {
      const values = locationInfo.split(',');
      //const gwl_nr = values[0].substring(7);
      if (values.length > 1 && values[1].startsWith('id:')) {
        const featureId = values[1].substring(3);
        return await this.geoAdminWaterGeometryById(featureId);
      }
    }

    return null;
  }

  private showSingleFeature(feature: Feature<Geometry>) {
    const geometry = feature.getGeometry();
    if (geometry?.getType() === 'Point') {
      this._state.setMapCenter((geometry as Point).getCoordinates());
    } else {
      const extent = feature?.getGeometry()?.getExtent();
      if (extent && this.zoomToFit) {
        this.zoomToFit(extent, [100, 50, 50, 50]);
      }
    }
  }

  public async showFeature(locationInfo: string | undefined) {
    if (locationInfo) {
      const feature = await this.getHighlightGeometryFeature(locationInfo);
      if (feature) {
        this._state.updateSearchResultFeatures([feature]);
        this.showSingleFeature(feature);
      }
      return feature;
    }
    return null;
  }

  public async showAllFeature(
    text: string,
    focus = false,
    padding: [number, number, number, number] = [100, 50, 50, 50],
  ) {
    const features: Feature<Geometry>[] = [];
    const regex = getGlobalAddressTokenRegex();
    let match;
    while ((match = regex.exec(text)) !== null) {
      const feature = await this.getHighlightGeometryFeature(match[2]);
      if (feature) {
        features.push(feature);
      }
    }
    this._state.updateSearchResultFeatures(features);

    if (focus && features.length > 0) {
      if (features.length === 1) {
        this.showSingleFeature(features[0]);
      } else if (this.zoomToFit) {
        const extent = createEmpty();
        features.forEach((feature) => {
          const geometry = feature.getGeometry();
          if (geometry) {
            if (geometry.getType() === 'Point') {
              extendCoordinate(extent, (geometry as Point).getCoordinates());
            } else {
              const featureExtent = geometry.getExtent();
              if (featureExtent) {
                extend(extent, featureExtent);
              }
            }
          }
        });
        this.zoomToFit(extent, padding);
      }
    }
  }

  public parseAddressToken(token: string): { address: string; locationInfo?: string } {
    const match = ADDRESS_TOKEN_REGEX.exec(token);
    if (!match) {
      if (token.startsWith('addr:')) {
        return { address: token.substring(5) };
      } else {
        return { address: token };
      }
    }
    return { address: match[1], locationInfo: match[2] };
  }

  public removeAllAddressTokens(text: string, escapeHtml = true) {
    if (escapeHtml) {
      //make sure there is no html
      text = SearchService.escapeHtml(text);
    }

    const regex = getGlobalAddressTokenRegex();
    return text.replace(regex, (match, p1) => ADDRESS_TOKEN_REPLACEMENT_ADDRESS(p1));
  }

  public replaceAllAddressTokens(text?: string, withMarker = false) {
    if (!text) {
      return text;
    }
    //make sure there is no html
    text = SearchService.escapeHtml(text);

    const regex = getGlobalAddressTokenRegex();
    let response: string;
    if (!withMarker) {
      response = text.replace(regex, (match, p1) => ADDRESS_TOKEN_REPLACEMENT_ADDRESS(p1));
    } else {
      response = text.replace(regex, (match, p1, p2) =>
        p2 ? ADDRESS_TOKEN_REPLACEMENT_SHOW_MARKER(p1, p2) : ADDRESS_TOKEN_REPLACEMENT_SHOW_MARKER_MISSING(p1),
      );
    }
    //mark as secure html
    return this._sanitizer.bypassSecurityTrustHtml(response);
  }

  public tokenizeAllPotentialAddresses(text?: string) {
    if (!text) {
      return text;
    }
    return text.replace(ADDRESS_TOKEN_OR_NEW_REGEX, (match) => (match.startsWith('addr:') ? match : `addr:(${match})`));
  }

  public removeAllPotentialAddresses(text?: string) {
    if (!text) {
      return text;
    }
    const regex = getGlobalAddressTokenRegex();
    return text.replace(regex, (match, p1, p2) => (!p2 ? p1 : match));
  }

  public static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  public async handleMessageContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const addrElem = target.closest('.addr-geo') as HTMLElement;
    if (addrElem) {
      //clicked inside addr-geo
      event.preventDefault();
      if (target.closest('.addr-show')) {
        //clicked specifically inside addr-show
        const geo = addrElem.dataset['geo'];
        const feature = await this.showFeature(geo);
        if (feature) {
          this.addressPreview.set(true);
          if (this.globalSearchInputText) {
            this.globalSearchInputText.set('');
          }
          return;
        } else {
          let address = addrElem.querySelector('.text')?.textContent;
          if (this.globalSearchInputText && address) {
            this.addressPreview.set(true);
            address = address.replace(' in ', ', ');
            this.globalSearchInputText.set(address);
          }
        }
      } else if (target.closest('.addr-search')) {
        //clicked specifically inside addr-search
        let address = addrElem.querySelector('.text')?.textContent;
        if (this.globalSearchInputText && address) {
          this.addressPreview.set(true);
          address = address.replace(' in ', ', ');
          this.globalSearchInputText.set(address);
        }
      }
    }
  }

  public triggerGlobalSearch() {
    if (!this.globalSearchInputText) return;

    //is there a selected text that should be directly searched?
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      if (selectedText) {
        this.globalSearchInputText.set(selectedText);
        return;
      }
    }
    this.globalSearchInputText.set('\u00A0');
  }
}
