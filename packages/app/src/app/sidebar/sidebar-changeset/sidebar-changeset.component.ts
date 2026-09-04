import { Component, inject } from '@angular/core';
import { ZsMapStateService } from '../../state/state.service';
import { MapRendererService } from '../../map-renderer/map-renderer.service';
import { ChangesetService, CONFLICT_INDEX_NAME, NO_CONFLICT_VALUE } from '../../changeset/changeset.service';
import { MatIcon } from '@angular/material/icon';
import { I18NService } from '../../state/i18n.service';
import { filter, skip, take } from 'rxjs';
import { IZsChangesetConflict, IZsChangesetConflictValue } from '@zskarte/types';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-changeset',
  imports: [MatIcon, MatButtonModule, MatCheckbox, FormsModule],
  templateUrl: './sidebar-changeset.component.html',
  styleUrl: './sidebar-changeset.component.scss',
})
export class SidebarChangesetComponent {
  NO_CONFLICT_VALUE = NO_CONFLICT_VALUE;
  CONFLICT_INDEX_NAME = CONFLICT_INDEX_NAME;
  readonly changesetService = inject(ChangesetService);
  readonly i18n = inject(I18NService);
  conflictsOnly = true;
  allHighlighted = false;
  allPreviewIndex = 3;
  private readonly _state = inject(ZsMapStateService);
  private _renderer = inject(MapRendererService);
  private _snackBar = inject(MatSnackBar);
  private _activeLayer = this._state.getActiveLayer()?.getId();

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
    const details = this.changesetService.conflictDetails();
    if (!details) return;
    this._renderer.zoomToAll(details.conflicts.map((c) => c.drawElementId));
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
      await this.changesetService.replaceErrorChangesetByMerge(conflictDetails, false);
    } catch (error: any) {
      this._snackBar.open(error.message ? error.message : error.toString(), 'OK', {
        duration: 5000,
      });
    }
  }
}
