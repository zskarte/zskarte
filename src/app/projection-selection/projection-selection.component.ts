import { Component, Input, inject, input, output } from '@angular/core';
import type { ZsKarteProjection } from '../helper/projections';
import { availableProjections } from '../helper/projections';
import { I18NService } from '../state/i18n.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export type ChangeType = { projectionFormatIndex?: number; projectionFormatIndexes?: number[]; numerical?: boolean };

@Component({
  selector: 'app-projection-selection',
  templateUrl: './projection-selection.component.html',
  styleUrl: './projection-selection.component.scss',
  imports: [MatRadioModule, MatCheckboxModule, FormsModule],
})
export class ProjectionSelectionComponent {
  i18n = inject(I18NService);

  @Input() projectionFormatIndex = 0;
  readonly projectionFormatIndexes = input<number[]>([0]);
  @Input() numerical = true;
  readonly projectionChanged = output<ChangeType>();

  readonly multiple = input(false);
  readonly showNumerical = input(true);
  readonly disabled = input(false);

  availableProjections: Array<ZsKarteProjection> = availableProjections;

  updateFormat(value: number) {
    this.projectionFormatIndex = value;
    this.emitChange();
  }

  updateFormats(formatIndex: number, value: boolean) {
    const projectionFormatIndexes = this.projectionFormatIndexes();
    if (value && !projectionFormatIndexes.includes(formatIndex)) {
      projectionFormatIndexes.push(formatIndex);
    } else if (!value && projectionFormatIndexes.includes(formatIndex)) {
      const index = projectionFormatIndexes.indexOf(formatIndex);
      if (index !== -1) {
        projectionFormatIndexes.splice(index, 1);
      }
    }
    this.emitChange();
  }

  updateNumerical(value: boolean) {
    this.numerical = value;
    this.emitChange();
  }

  emitChange() {
    const state: ChangeType = {};
    if (this.showNumerical()) {
      state.numerical = this.numerical;
    }
    if (this.multiple()) {
      state.projectionFormatIndexes = this.projectionFormatIndexes();
    } else {
      state.projectionFormatIndex = this.projectionFormatIndex;
    }
    this.projectionChanged.emit(state);
  }
}
