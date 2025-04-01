import { signal, Component, ElementRef, OnDestroy, inject, viewChild } from '@angular/core';
import { I18NService } from '../state/i18n.service';
import { ZsMapStateService } from '../state/state.service';
import { transform } from 'ol/proj';
import { SessionService } from '../session/session.service';
import { Subject, takeUntil } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IResultSet, IZsMapSearchResult } from '@zskarte/types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { coordinateFromString } from '../helper/coordinates-extract';
import { SearchService } from '../search/search.service';
import { SearchAutocompleteComponent } from '../search/search-autocomplete/search-autocomplete.component';
interface IFoundLocation {
  attrs: IFoundLocationAttrs;
}

interface IFoundLocationAttrs {
  label: string;
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-geocoder',
  templateUrl: './geocoder.component.html',
  styleUrls: ['./geocoder.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    CommonModule,
    FormsModule,
    SearchAutocompleteComponent,
  ],
})
export class GeocoderComponent implements OnDestroy {
  i18n = inject(I18NService);
  zsMapStateService = inject(ZsMapStateService);
  private _session = inject(SessionService);
  private _search = inject(SearchService);

  readonly el = viewChild.required<ElementRef>('searchField');
  geocoderUrl = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&searchText=';
  foundLocations = signal<IResultSet[]>([]);
  inputText = '';
  keepCoord = false;
  selected: IZsMapSearchResult | null = null;
  private _ngUnsubscribe = new Subject<void>();
  private updateSearchTerm: (searchText: string) => void;

  constructor() {
    this._session
      .observeAuthenticated()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(() => {
        this.selected = null;
      });

    this._search.addSearch(this.coordinateSearch.bind(this), this.i18n.get('coordinates'), undefined, 1);
    this._search.addSearch(this.geoAdminLocationSearch.bind(this), 'Geo Admin', undefined, 100);

    const { searchResults$, updateSearchTerm } = this._search.createSearchInstance();
    this.updateSearchTerm = updateSearchTerm;

    searchResults$.subscribe((newResultSets) => {
      if (newResultSets === null) {
        //request aborted by new search
        return;
      }

      this.foundLocations().forEach((s) => s.results.forEach((x) => x.feature?.unset('ZsMapSearchResult')));
      newResultSets.forEach((s) => s.results.forEach((x) => x.feature?.set('ZsMapSearchResult', true)));
      if (newResultSets.length > 3) {
        newResultSets.forEach((s) => (s.collapsed = true));
      }
      this.foundLocations.set(newResultSets);
      if (newResultSets.length === 0 && this.inputText.length <= 1 && !this.keepCoord) {
        this.zsMapStateService.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
      }
      this.keepCoord = false;
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  async coordinateSearch(text: string) {
    const coords = coordinateFromString(text);

    if (coords) {
      return [{ label: text, lonLat: coords }];
    }

    return [];
  }

  async geoAdminLocationSearch(text: string, maxResultCount?: number) {
    if (!navigator.onLine) {
      return [];
    }
    let url = this.geocoderUrl + encodeURIComponent(text);
    if (maxResultCount !== undefined) {
      url = `${url}&limit=${maxResultCount}`;
    }
    const result: { results: IFoundLocation[] } = await fetch(url).then((response) => response.json());
    if (this.inputText !== text) {
      // if there is already a new search query skip map results as they are not displayed.
      return [];
    }
    const foundLocations: IZsMapSearchResult[] = [];
    result.results
      .filter((r) => r?.attrs?.label)
      .forEach((r) => foundLocations.push({ label: r.attrs.label, lonLat: [r.attrs.lon, r.attrs.lat], internal: r }));
    return foundLocations;
  }

  async geoCodeLoad() {
    this.updateSearchTerm(this.inputText);
  }

  geoCodeSelected(value: IZsMapSearchResult) {
    this.selected = value;
    this.goToCoordinate(true);
    this.keepCoord = true;
    this.inputText = '';
  }

  previewCoordinate(element: IZsMapSearchResult | null) {
    if (element === null) {
      this.goToCoordinate(false);
    } else {
      this.doGoToCoordinate(element, false);
    }
  }

  private doGoToCoordinate(element: IZsMapSearchResult | null, center: boolean) {
    if (element) {
      let coordinates;
      if (element.mercatorCoordinates) {
        coordinates = element.mercatorCoordinates;
      } else if (element.lonLat) {
        coordinates = transform(element.lonLat, 'EPSG:4326', 'EPSG:3857');
      }
      if (coordinates) {
        this.zsMapStateService.updatePositionFlag({ isVisible: true, coordinates });
        if (center) {
          this.zsMapStateService.setMapCenter(coordinates);
        }
        return;
      }
    }
    this.zsMapStateService.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
  }

  goToCoordinate(center: boolean) {
    this.doGoToCoordinate(this.selected, center);
  }
}
