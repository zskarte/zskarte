import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ZsMapStateService } from '../state/state.service';
import { projectionByIndex } from '../helper/projections';
import { ChangeType, ProjectionSelectionComponent } from '../projection-selection/projection-selection.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-coordinates',
  templateUrl: './coordinates.component.html',
  styleUrl: './coordinates.component.scss',
  imports: [ProjectionSelectionComponent,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
  ],
})
export class CoordinatesComponent {
  private _state = inject(ZsMapStateService);
  private _destroyRef = inject(DestroyRef);

  showOptions = false;
  //TODO: load this from session/state?
  projectionFormatIndexes = signal<number[]>([0, 1]);
  coordinates = toSignal(this._state.getCoordinates().pipe(takeUntilDestroyed(this._destroyRef)));
  mappedCoordinates = computed(() => {
    const coordinates = this.coordinates();
    if (!coordinates) {
      return [];
    }

    return this.projectionFormatIndexes().map(i => {
      const proj = projectionByIndex(i);
      return { type: i, coordinate: proj.translate(proj.transformTo(coordinates)) };
    })
  });

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  updateProjection(value: ChangeType) {
    if (!value.projectionFormatIndexes || value.projectionFormatIndexes?.length === 0) {
      this.projectionFormatIndexes.set([0]);
    } else {
      this.projectionFormatIndexes.set([...value.projectionFormatIndexes]);
    }
    //TODO: save this to session/state?
  }
}
