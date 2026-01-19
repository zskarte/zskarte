import { ChangeDetectionStrategy, Component, Input, inject, output, ElementRef, ViewChild, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { I18NService } from '../state/i18n.service';
import { Signs } from '../map-renderer/signs';
import { SessionService } from '../session/session.service';
import { BehaviorSubject } from 'rxjs';
import { DrawStyle } from '../map-renderer/draw-style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-incident-select',
  templateUrl: './incident-select.component.html',
  styleUrl: './incident-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
  ],
})
export class IncidentSelectComponent {
  i18n = inject(I18NService);
  private _session = inject(SessionService);

  @ViewChild('incidentInput') incidentInput!: ElementRef<HTMLInputElement>;

  @Input()
  set values(values: number[]) {
    this.incidents.setValue(values || []);
  }
  get values(): number[] {
    return this.incidents.value || [];
  }
  @Input()
  set disabled(value: boolean) {
    if (value) {
      this.incidents.disable();
    } else {
      this.incidents.enable();
    }
  }
  readonly valuesChange = output<number[]>();
  incidents = new FormControl<number[]>([]);
  incidentSearchControl = new FormControl('');
  incidentList = new BehaviorSubject<{ id: number | undefined; icon: string | undefined; name: string | undefined }[]>([]);

  filteredIncidents = computed(() => {
    const search = this.incidentSearch().toLowerCase();
    const allIncidents = this.incidentList.value;
    const selectedIds = this.incidents.value || [];

    return allIncidents.filter((incident) => {
      const isSelected = selectedIds.includes(incident.id as number);
      const matchesSearch = incident.name?.toLowerCase().includes(search);
      return !isSelected && matchesSearch;
    });
  });

  incidentSearch = signal('');

  constructor() {
    const incidents = Signs.SIGNS.filter((o) => o.kat === 'incident').sort((a, b) => {
      let aValue = a[this._session.getLocale()];
      let bValue = b[this._session.getLocale()];
      aValue = aValue ? aValue.toLowerCase() : '';
      bValue = bValue ? bValue.toLowerCase() : '';
      return aValue.localeCompare(bValue);
    });

    this.incidentList.next(incidents.map((o) => ({ id: o.id, icon: DrawStyle.getImageUrl(o.src), name: o[this._session.getLocale()] })));

    this.incidents.valueChanges.pipe(takeUntilDestroyed()).subscribe((values) => {
      this.valuesChange.emit(values || []);
    });

    this.incidentSearchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.incidentSearch.set(value || '');
    });

    if (this.disabled) {
      this.incidents.disable();
    }
  }

  getIncident(id: number | undefined) {
    return this.incidentList.value.find((o) => o.id === id);
  }

  remove(id: number): void {
    const values = this.incidents.value || [];
    const index = values.indexOf(id);

    if (index >= 0) {
      const newValues = [...values];
      newValues.splice(index, 1);
      this.incidents.setValue(newValues);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value;
    const values = this.incidents.value || [];
    if (!values.includes(id)) {
      this.incidents.setValue([...values, id]);
    }
    this.incidentInput.nativeElement.value = '';
    this.incidentSearchControl.setValue('');
  }
}
