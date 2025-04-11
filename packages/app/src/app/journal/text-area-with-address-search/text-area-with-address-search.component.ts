import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MapRendererService } from 'src/app/map-renderer/map-renderer.service';
import { SearchAutocompleteComponent } from 'src/app/search/search-autocomplete/search-autocomplete.component';
import { ADDRESS_TOKEN_REGEX, SearchService, getGlobalAddressTokenRegex } from 'src/app/search/search.service';
import { I18NService } from 'src/app/state/i18n.service';
import { ZsMapStateService } from 'src/app/state/state.service';
import { IResultSet, IZsGlobalSearchConfig, IZsMapSearchResult } from '../../../../../types/state/interfaces';
import { Geometry, Point } from 'ol/geom';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Feature } from 'ol';
import { createEmpty, extend, extendCoordinate } from 'ol/extent';

@Component({
  selector: 'app-text-area-with-address-search',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SearchAutocompleteComponent,
    MatAutocompleteModule,
  ],
  templateUrl: './text-area-with-address-search.component.html',
  styleUrl: './text-area-with-address-search.component.scss',
})
export class TextAreaWithAddressSearchComponent {
  private _state = inject(ZsMapStateService);
  private _renderer = inject(MapRendererService);
  private _search = inject(SearchService);
  i18n = inject(I18NService);
  label = input<string>('');
  formControl = input<FormControl>(new FormControl());

  addressSearchTerm = signal('');
  addressSelection = signal(false);
  foundLocations = signal<IResultSet[]>([]);
  readonly autocompleteTrigger = viewChild.required(MatAutocompleteTrigger);
  readonly addresSearchField = viewChild.required<ElementRef<HTMLInputElement>>('addresSearchField');

  addressPreview = signal(false);
  showAllAddresses = signal(false);
  readonly textContentInput = viewChild.required<ElementRef<HTMLTextAreaElement>>('textContent');
  textContentSelectedArea: [number, number] = [0, 0];

  constructor() {
    effect(() => {
      const showMap = this.addressSelection() || this.addressPreview() || this.showAllAddresses();
      this._state.setJournalAddressPreview(showMap);
    });
    effect(() => {
      if (this.showAllAddresses()) {
        this.showAllFeature(true);
      } else {
        this._state.updateSearchResultFeatures([]);
      }
    });
    effect(() => {
      this.formControl();
    });

    //handle address search
    const searchConfig = this._state.getSearchConfig();
    const { searchResults$, updateSearchTerm, updateSearchConfig } = this._search.createSearchInstance(searchConfig);

    this._state.observeSearchConfig().subscribe((config: IZsGlobalSearchConfig) => {
      if (!config.filterMapSection && !config.filterByDistance && !config.filterByArea && !config.sortedByDistance) {
        //fallback config: sort by distance if nothing set
        updateSearchConfig({ ...config, sortedByDistance: true });
      } else {
        updateSearchConfig(config);
      }
    });
    effect(() => {
      updateSearchTerm(this.addressSearchTerm());
    });

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
      this.autocompleteTrigger().openPanel();
    });
  }

  @HostListener('window:keydown.Escape', ['$event'])
  abortOnEsc(event: KeyboardEvent) {
    if (this.addressSelection()) {
      this.autocompleteTrigger().closePanel();
      this.addressSelection.set(false);
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        this.textContentInput().nativeElement.focus();
      });
      if (this.showAllAddresses()) {
        this.showAllFeature();
      }
    } else if (this.addressPreview()) {
      this.addressPreview.set(false);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  public formClosed() {
    this.addressSelection.set(false);
    this.addressPreview.set(false);
    this.showAllAddresses.set(false);
  }

  async onKeyDownText(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      //abort address search, not close form
      this.abortOnEsc(event);
      return;
    }
    //use intelisense keystroke to start address search
    if (event.ctrlKey && event.key === ' ') {
      this.handleTextSelection(event, false);
    }
  }

  onDoubleClickText(event: MouseEvent) {
    this.handleTextSelection(event, true);
  }

  private handleTextSelection(event: Event, onlyAddressBlock: boolean) {
    const textarea = this.textContentInput().nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let selectedText = text.substring(start, end);

    //check if text cursor is on/inside textToken
    let foundTextToken = false;
    if (!ADDRESS_TOKEN_REGEX.test(selectedText)) {
      let match: RegExpExecArray | null;
      const regex = getGlobalAddressTokenRegex();
      while ((match = regex.exec(text)) !== null) {
        if (match.index <= start && match.index + match[0].length >= start) {
          foundTextToken = true;
          selectedText = match[0];
          textarea.selectionStart = match.index;
          textarea.selectionEnd = match.index + match[0].length;
          break;
        }
      }
    }

    if (!foundTextToken && onlyAddressBlock) {
      return;
    }

    //if not, select current word
    if (!foundTextToken && start === end) {
      const beforeCursor = text.substring(0, start);
      const afterCursor = text.substring(end);

      const startOfWord = Math.max(beforeCursor.lastIndexOf(' ') + 1, beforeCursor.lastIndexOf('\n') + 1);
      const afterPos = Math.min(afterCursor.indexOf(' '), afterCursor.indexOf('\n'));
      const endOfWord = afterPos === -1 ? text.length : end + afterPos;

      selectedText = text.substring(startOfWord, endOfWord);
      textarea.selectionStart = startOfWord;
      textarea.selectionEnd = endOfWord;
    }

    this.textContentSelectedArea = [textarea.selectionStart, textarea.selectionEnd];
    const { address, locationInfo } = this._search.parseTextToken(selectedText);
    this.showFeature(locationInfo);
    this.startEdit(address);
    event.preventDefault();
    event.stopPropagation();
  }

  async onInputText(event: Event) {
    const textarea = this.textContentInput().nativeElement;
    const cursorPosition = textarea.selectionStart || 0;
    if (cursorPosition >= 5 && textarea.value.slice(cursorPosition - 5, cursorPosition) === 'addr:') {
      textarea.selectionStart = cursorPosition - 5;
      textarea.selectionEnd = cursorPosition;
      this.textContentSelectedArea = [textarea.selectionStart, textarea.selectionEnd];
      this.startEdit('');
    }
  }

  previewCoordinate(element: IZsMapSearchResult | null) {
    this._search.highlightResult(element, false);
  }

  useResult(value: IZsMapSearchResult) {
    const textToken = value.internal?.textToken;
    const textarea = this.textContentInput().nativeElement;
    if (textToken) {
      [textarea.selectionStart, textarea.selectionEnd] = this.textContentSelectedArea;
      textarea.setRangeText(textToken);
      textarea.selectionStart = textarea.selectionEnd = textarea.selectionStart + textToken.length;
    }
    this.addressSelection.set(false);
    setTimeout(() => {
      textarea.focus();
    });
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });

    if (this.showAllAddresses()) {
      this.showAllFeature();
    } else {
      this._state.updateSearchResultFeatures([]);
    }
  }

  onKeydownAddressSearch(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      //prevent form submit
      event.preventDefault();
    } else if (event.key === 'Escape') {
      //abort address search, not close form
      this.abortOnEsc(event);
    }
  }

  private async showFeature(locationInfo: string | undefined) {
    if (locationInfo) {
      const feature = await this._search.getHighlightGeometryFeature(locationInfo);
      if (feature) {
        this._state.updateSearchResultFeatures([feature]);
        const geometry = feature.getGeometry();
        if (geometry?.getType() === 'Point') {
          this._state.setMapCenter((geometry as Point).getCoordinates());
        } else {
          const extent = feature?.getGeometry()?.getExtent();
          if (extent) {
            this._renderer.zoomToFit(extent, [50, 50, 50, 50]);
          }
        }
      }
      return feature;
    }
    return null;
  }

  private async showAllFeature(focus = false) {
    const textarea = this.textContentInput().nativeElement;
    const text = textarea.value;
    const features: Feature<Geometry>[] = [];
    const regex = getGlobalAddressTokenRegex();
    let match;
    while ((match = regex.exec(text)) !== null) {
      const feature = await this._search.getHighlightGeometryFeature(match[2]);
      if (feature) {
        features.push(feature);
      }
    }
    this._state.updateSearchResultFeatures(features);

    if (focus && features.length > 0) {
      if (features.length === 1) {
        const geometry = features[0].getGeometry();
        if (geometry) {
          if (geometry.getType() === 'Point') {
            this._state.setMapCenter((geometry as Point).getCoordinates());
          } else {
            const extent = geometry.getExtent();
            if (extent) {
              this._renderer.zoomToFit(extent, [50, 50, 50, 50]);
            }
          }
        }
      } else {
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
        this._renderer.zoomToFit(extent, [50, 50, 50, 50]);
      }
    }
  }

  private startEdit(address: string) {
    this.addressSelection.set(true);
    this.addressPreview.set(false);
    this.addressSearchTerm.set(address);
    this.autocompleteTrigger().openPanel();
    setTimeout(() => {
      this.addresSearchField().nativeElement.focus();
    });
  }
}
