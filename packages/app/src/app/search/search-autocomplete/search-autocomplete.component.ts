import { Component, ViewChild, inject, input, output } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { IResultSet, IZsMapSearchResult } from '@zskarte/types';
import { CommonModule } from '@angular/common';
import { I18NService } from 'src/app/state/i18n.service';

@Component({
  selector: 'app-search-autocomplete',
  templateUrl: './search-autocomplete.component.html',
  styleUrl: './search-autocomplete.component.scss',
  imports: [MatAutocompleteModule, CommonModule],
})
export class SearchAutocompleteComponent {
  @ViewChild('autocompleteRef', { static: false }) autocompleteRef!: MatAutocomplete;
  i18n = inject(I18NService);
  foundLocations = input<IResultSet[]>([]);
  searchTerm = input<string | null>(null);
  selected = output<IZsMapSearchResult>();
  active = output<IZsMapSearchResult | null>();

  // skipcq: JS-0105
  expandGroup(group: IResultSet, $event: MouseEvent) {
    if (!($event.target as Element).closest('mat-option')) {
      group.collapsed = !group.collapsed;
      $event.preventDefault();
    }
  }

  // skipcq: JS-0105
  getLabel(selected: IZsMapSearchResult): string {
    return selected ? selected.label.replace(/<[^>]*>/g, '') : '';
  }

  entrySelected(event: MatAutocompleteSelectedEvent) {
    this.selected.emit(event.option.value);
  }

  entryActivated(value: IZsMapSearchResult) {
    this.active.emit(value);
  }

  entryDeactivated() {
    this.active.emit(null);
  }
}
