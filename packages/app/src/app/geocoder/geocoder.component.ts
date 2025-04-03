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
import { SearchService } from '../search/search.service';
import { SearchAutocompleteComponent } from '../search/search-autocomplete/search-autocomplete.component';
import { MapRendererService } from '../map-renderer/map-renderer.service';

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
  private _renderer = inject(MapRendererService);
  private _session = inject(SessionService);
  private _search = inject(SearchService);

  readonly el = viewChild.required<ElementRef>('searchField');
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
        this.zsMapStateService.updateSearchResultFeatures([]);
        this.zsMapStateService.updatePositionFlag({ isVisible: true, coordinates });
        if (center) {
          this.zsMapStateService.setMapCenter(coordinates);
        }
        return;
      } else if (element.feature) {
        this.zsMapStateService.updateSearchResultFeatures([element.feature]);
        const extent = element.feature.getGeometry()?.getExtent();
        if (center && extent) {
          this._renderer.zoomToFit(extent);
          this.zsMapStateService.updatePositionFlag({ isVisible: false, coordinates: [0,0] });
        } else {
          this.zsMapStateService.updatePositionFlag({ isVisible: true, coordinates: element.internal.center ?? [0,0] });
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
