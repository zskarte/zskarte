import { signal, Component, ElementRef, OnDestroy, inject, viewChild, effect } from '@angular/core';
import { I18NService } from '../state/i18n.service';
import { ZsMapStateService } from '../state/state.service';
import { SessionService } from '../session/session.service';
import { Subject, takeUntil } from 'rxjs';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { IResultSet, IZsGlobalSearchConfig, IZsMapSearchResult } from '@zskarte/types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../search/search.service';
import { SearchAutocompleteComponent } from '../search/search-autocomplete/search-autocomplete.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MapSearchAreaService } from '../map-renderer/map-search-area.service';

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
    OverlayModule,
    MatCheckbox,
    MatButtonModule,
  ],
})
export class GeocoderComponent implements OnDestroy {
  i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private _session = inject(SessionService);
  private _search = inject(SearchService);
  private _searchArea = inject(MapSearchAreaService);

  readonly autocompleteTrigger = viewChild.required(MatAutocompleteTrigger);
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly foundLocations = signal<IResultSet[]>([]);
  readonly inputText = signal('');
  keepCoord = false;
  selected: IZsMapSearchResult | null = null;
  private _ngUnsubscribe = new Subject<void>();
  searchConfig: IZsGlobalSearchConfig;

  settingsVisble = false;
  drawingArea = false;

  constructor() {
    this._session
      .observeAuthenticated()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(() => {
        this.selected = null;
      });
    this.searchConfig = { ...this._state.getSearchConfig() };

    const { searchResults$, updateSearchTerm, updateSearchConfig } = this._search.createGlobalSearchInstance(
      this.searchConfig,
      this.inputText,
    );

    this._state
      .observeSearchConfig()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((config: IZsGlobalSearchConfig) => {
        this.searchConfig = { ...config };
        updateSearchConfig(this.searchConfig);
      });

    searchResults$.pipe(takeUntil(this._ngUnsubscribe)).subscribe((newResultSets) => {
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
      const inputText = this.inputText();
      if (newResultSets.length === 0 && inputText.length <= 1) {
        if (!this.keepCoord) {
          this._search.highlightResult(null, false);
        }
        this.keepCoord = false;
      }
      if (inputText.length > 1) {
        this.autocompleteTrigger().openPanel();
      }
    });

    effect(() => {
      const inputText = this.inputText();
      if (inputText === '\u00A0') {
        this.searchInput().nativeElement.focus();
        this.inputText.set('');
        return;
      }
      updateSearchTerm(inputText);
      this.settingsVisble = false;
      if (inputText.length > 1) {
        this.searchInput().nativeElement.focus();
      }
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  geoCodeSelected(value: IZsMapSearchResult) {
    this.selected = value;
    this.goToCoordinate(true);
    this.keepCoord = true;
    this.inputText.set('');
  }

  previewCoordinate(element: IZsMapSearchResult | null) {
    if (this.keepCoord) return;
    if (element === null) {
      this.selected = null;
      this.goToCoordinate(false);
    } else {
      this._search.highlightResult(element, false);
    }
  }

  goToCoordinate(center: boolean) {
    this._search.highlightResult(this.selected, center);
  }

  configChanged() {
    this._state.setSearchConfig({ ...this.searchConfig });
  }

  startDefineArea() {
    this.drawingArea = true;
    this._searchArea.activateAreaEdit();
  }

  stopDefineArea() {
    this._searchArea.deactivateAreaEdit();
    this.drawingArea = false;
    this.searchConfig.area = this._searchArea.getSearchAreaExtent();
    this.configChanged();
  }

  toggleSettings(event?: MouseEvent) {
    event?.stopPropagation();
    this.settingsVisble = !this.settingsVisble;
  }
}
