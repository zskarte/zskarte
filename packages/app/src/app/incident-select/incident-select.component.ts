import { ChangeDetectionStrategy, Component, Input, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { I18NService } from '../state/i18n.service';
import { Signs } from '../map-renderer/signs';
import { SessionService } from '../session/session.service';
import { BehaviorSubject } from 'rxjs';
import { DrawStyle } from '../map-renderer/draw-style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-incident-select',
  templateUrl: './incident-select.component.html',
  styleUrl: './incident-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, AsyncPipe, ReactiveFormsModule, MatButtonModule],
})
export class IncidentSelectComponent {
  i18n = inject(I18NService);
  private _session = inject(SessionService);

  @Input()
  set values(values: number[]) {
    this.incidents.setValue(values || []);
  }
  get values(): number[] {
    return this.incidents.value?.map((o) => o) || [];
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
  incidentList = new BehaviorSubject<{ id: number | undefined; icon: string | undefined; name: string | undefined }[]>([]);

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
      this.valuesChange.emit(values?.map((o) => o) || []);
    });
    if (this.disabled) {
      this.incidents.disable();
    }
  }

  getIncident(id: number | undefined) {
    return this.incidentList.value.find((o) => o.id === id);
  }
}
