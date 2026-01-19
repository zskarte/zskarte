import { Component, computed, inject } from '@angular/core';
import { ZsMapStateService } from 'src/app/state/state.service';
import { MapRendererService } from 'src/app/map-renderer/map-renderer.service';
import { ChangesetService, CONFLICT_INDEX_NAME, NO_CONFLICT_VALUE } from 'src/app/changeset/changeset.service';
import { MatIcon } from '@angular/material/icon';
import { I18NService } from 'src/app/state/i18n.service';
import { filter, skip, take } from 'rxjs';
import { createEmpty as createEmptyExtent, extend as extendExtent } from 'ol/extent';
import { IZsChangesetConflict, IZsChangesetConflictValue } from '@zskarte/types';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

const ZOOM_TO_FIT_WITH_SIDEBAR_PADDING: [number, number, number, number] = [100, 600, 100, 100];

@Component({
  selector: 'app-sidebar-changeset',
  imports: [MatIcon, MatButtonModule, MatCheckbox, FormsModule],
  templateUrl: './sidebar-changeset.component.html',
  styleUrl: './sidebar-changeset.component.scss',
})
export class SidebarChangesetComponent {
  NO_CONFLICT_VALUE = NO_CONFLICT_VALUE;
  CONFLICT_INDEX_NAME = CONFLICT_INDEX_NAME;

  private readonly _state = inject(ZsMapStateService);
  private _renderer = inject(MapRendererService);
  readonly changesetService = inject(ChangesetService);
  private _snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18NService);
  readonly changesetConfig = toSignal(this._state.observeChangesetConfig());
  private _activeLayer = this._state.getActiveLayer()?.getId();
  conflictsOnly = true;
  allHighlighted = false;
  allPreviewIndex = 3;

  updateAutomerge(val: boolean) {
    this._state.setChangesetConfig({ automerge: val });
  }

  toggleHighlightAll() {
    this.allHighlighted = !this.allHighlighted;
    if (this.allHighlighted) {
      const elementIds =
        this.changesetService
          .conflictDetails()
          ?.conflicts?.map((e) => `conflict-${this.allPreviewIndex}-${e.drawElementId}`) || [];
      this._state.replaceHighlightedFeatures(elementIds);
      this._state
        .observeHighlightedFeature()
        .pipe(
          skip(1),
          filter((v) => !elementIds.every((element) => v.includes(element))),
          take(1),
        )
        .subscribe((v) => (this.allHighlighted = false));
    } else {
      this._state.replaceHighlightedFeatures([]);
    }
  }

  highlightElement(element: { drawElementId: string }, value: boolean) {
    if (!this.allHighlighted) {
      const elemId = `conflict-${this.allPreviewIndex}-${element.drawElementId}`;
      this._state.updateFeatureHighlighted(elemId, value);
    }
  }

  highlightAllPreview(index: number) {
    if (this.allPreviewIndex === index) return;
    const elemPrefix = `conflict-${index}`;
    this.allPreviewIndex = index;

    this._state.updateMapState((draft) => {
      Object.keys(draft.drawElements).forEach((elemId) => {
        if (elemId.startsWith('conflict-')) {
          if (elemId.startsWith(elemPrefix)) {
            draft.drawElements[elemId].layer = this._activeLayer;
          } else {
            draft.drawElements[elemId].layer = elemId.substring(0, 10);
          }
        }
      });
    }, true);
  }

  highlightPreview(element: { drawElementId: string }, index: number, value: boolean, event: Event) {
    const elemId = `conflict-${index}-${element.drawElementId}`;
    this._state.updateFeatureHighlighted(elemId, value);
    if (index === this.allPreviewIndex) return;
    const prevPreviewElemId = `conflict-${this.allPreviewIndex}-${element.drawElementId}`;

    let layer = this._activeLayer;
    if (!value) {
      layer = `conflict-${index}`;
      (event.target as HTMLElement).classList.remove('activePreview');
    } else {
      (event.target as HTMLElement).classList.add('activePreview');
    }
    this._state.updateMapState((draft) => {
      if (draft.drawElements[elemId]) {
        draft.drawElements[elemId].layer = layer;
      }
      if (draft.drawElements[prevPreviewElemId]) {
        if (value) {
          draft.drawElements[prevPreviewElemId].layer = `conflict-${this.allPreviewIndex}`;
        } else {
          draft.drawElements[prevPreviewElemId].layer = this._activeLayer;
        }
      }
    }, true);
  }

  zoomToElement() {
    const extent = createEmptyExtent();
    const details = this.changesetService.conflictDetails();
    if (!details) return;
    details.conflicts.forEach((conflict) => {
      const featureExtent = this._state
        .getDrawElement(conflict.drawElementId)
        ?.getOlFeature()
        ?.getGeometry()
        ?.getExtent();
      if (featureExtent) {
        extendExtent(extent, featureExtent);
      }
    });
    const currentZoom = this._renderer.getCurrentZoom();
    this._renderer.zoomToFit(extent, ZOOM_TO_FIT_WITH_SIDEBAR_PADDING, (currentZoom ?? 0) >= 13 ? currentZoom : 15);
  }

  selectMeta(value: IZsChangesetConflictValue, index: number) {
    if (value[CONFLICT_INDEX_NAME[index]] === NO_CONFLICT_VALUE) return;
    this._state.updateMapState((draft) => {
      this.changesetService.updateConflictValue(draft, value.path.split('.'), value, index);
    }, true);
    value.selected = index;
    value.resolved = true;
  }

  select(element: IZsChangesetConflict, value: IZsChangesetConflictValue, index: number) {
    const missing = element.missing[CONFLICT_INDEX_NAME[index]];
    const elemId = `conflict-3-${element.drawElementId}`;
    if (!missing && value[CONFLICT_INDEX_NAME[index]] === NO_CONFLICT_VALUE) return;
    let replacedIndex = -1;
    this._state.updateMapState((draft) => {
      if (missing) {
        delete draft.drawElements[elemId];
        return;
      }
      if (!draft.drawElements[elemId]) {
        let elemIdIndex = `conflict-${index}-${element.drawElementId}`;
        if (!draft.drawElements[elemIdIndex]) {
          elemIdIndex = `conflict-1-${element.drawElementId}`;
          if (!draft.drawElements[elemIdIndex]) {
            return;
          }
          replacedIndex = 1;
        } else {
          replacedIndex = index;
        }
        draft.drawElements[elemId] = { ...draft.drawElements[elemIdIndex], id: elemId, layer: this._activeLayer };
      }
      this.changesetService.updateConflictValue(draft.drawElements[elemId], value.path.split('.'), value, index);
    }, true);
    if (missing) {
      element.values.forEach((v) => {
        v.selected = index;
      });
    } else if (replacedIndex !== -1) {
      element.values.forEach((v) => {
        v.selected = replacedIndex;
        v.resolved = true;
      });
    }
    value.selected = index;
    value.resolved = true;
    this.highlightAllPreview(3);
  }

  async finish() {
    const conflictDetails = this.changesetService.conflictDetails();
    if (!conflictDetails) {
      return;
    }
    const allConflictResolved = conflictDetails?.conflicts.every((conflict) =>
      conflict.values.every((value) => !value.conflict || value.resolved),
    );
    if (!allConflictResolved) {
      this._snackBar.open('fix all conflicts first (marked as red lines)', 'OK', {
        duration: 2000,
      });
      return;
    }
    this.allHighlighted = false;
    this._state.replaceHighlightedFeatures([]);
    try {
      await this.changesetService.replaceErrorChangesetByMerge(conflictDetails);
    } catch (error: any) {
      this._snackBar.open(error.message ? error.message : error.toString(), 'OK', {
        duration: 5000,
      });
    }
  }
}
