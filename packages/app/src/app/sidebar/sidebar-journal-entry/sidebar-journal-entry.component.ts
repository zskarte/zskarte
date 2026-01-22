import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { ZsMapDrawElementState } from '@zskarte/types';
import { transform } from 'ol/proj';
import { coordinatesProjection, mercatorProjection } from 'src/app/helper/projections';
import { JournalEntry } from 'src/app/journal/journal.types';
import { DrawStyle } from 'src/app/map-renderer/draw-style';
import { ZsMapBaseDrawElement } from 'src/app/map-renderer/elements/base/base-draw-element';
import { Signs } from 'src/app/map-renderer/signs';
import { ZsMapStateService } from 'src/app/state/state.service';
import { I18NService } from 'src/app/state/i18n.service';
import { MatIcon } from '@angular/material/icon';
import { Coordinate } from 'ol/coordinate';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { filter, skip, take } from 'rxjs';
import { createEmpty as createEmptyExtent, extend as extendExtent } from 'ol/extent';
import { MapRendererService } from 'src/app/map-renderer/map-renderer.service';
import { SearchService } from 'src/app/search/search.service';
import { ReplaceAllAddressTokensPipe } from '../../search/replace-all-address-tokens.pipe';
import { JournalService } from 'src/app/journal/journal.service';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { SidebarService } from '../sidebar.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';

const ZOOM_TO_FIT_WITH_SIDEBAR_PADDING: [number, number, number, number] = [100, 600, 100, 100];
@Component({
  selector: 'app-sidebar-journal-entry',
  imports: [MatListModule, MatIcon, MatButtonModule, MatInputModule, FormsModule, ReplaceAllAddressTokensPipe],
  templateUrl: './sidebar-journal-entry.component.html',
  styleUrls: ['./sidebar-journal-entry.component.scss'],
})
export class SidebarJournalEntryComponent implements OnDestroy {
  private _state = inject(ZsMapStateService);
  private _renderer = inject(MapRendererService);
  i18n = inject(I18NService);
  search = inject(SearchService);
  journal = inject(JournalService);
  private _router = inject(Router);
  private _sidebar = inject(SidebarService);
  private _dialog = inject(MatDialog);
  entry = input.required<JournalEntry>();
  allHighlighted = false;
  editingElementId = signal<string | null>(null);
  editingValue = signal<string>('');
  refreshTrigger = signal<number>(0);

  elements = toSignal(this._state.observeDrawElements());

  entryElements = computed(() => {
    this.refreshTrigger();
    const elements = this.elements();
    if (!elements) return [];

    return elements.filter(this.containsNumber(this.entry().messageNumber)).map((el) => {
      const elementId = el.getId();
      const elementState = this._state.getDrawElementState(elementId) || el.elementState;
      const coordinates = this.mapCoordinates(elementState?.coordinates);
      const imageSrc = Signs.getSignById(elementState?.symbolId)?.src;
      return {
        ...el,
        id: elementId,
        elementState: elementState,
        imageUrl: imageSrc ? DrawStyle.getImageUrl(imageSrc) : undefined,
        coordinates,
        coordinatesStr: coordinates ? this.transformCoordinates(coordinates) : '',
      };
    });
  });

  navigateTo(element: { id: string; coordinates: Coordinate | undefined }) {
    if (element.coordinates) {
      this._state.setMapCenter(element.coordinates);
      this._state.selectFeature(element.id);
    }
  }

  zoomToAll() {
    const extent = createEmptyExtent();
    this.entryElements().forEach((feature) => {
      const featureExtent = this._state.getDrawElement(feature.id)?.getOlFeature()?.getGeometry()?.getExtent();
      if (featureExtent) {
        extendExtent(extent, featureExtent);
      }
    });
    this._renderer.zoomToFit(extent, ZOOM_TO_FIT_WITH_SIDEBAR_PADDING);
  }

  toggleHighlightAll() {
    this.allHighlighted = !this.allHighlighted;
    if (this.allHighlighted) {
      const elementIds = this.entryElements().map((e) => e.id);
      this._state.replaceHighlightedFeatures(elementIds);
      this._state
        .observeHighlightedFeature()
        .pipe(
          skip(1),
          filter((v: string[]) => !elementIds.every((element) => v.includes(element))),
          take(1),
        )
        .subscribe(() => (this.allHighlighted = false));
    } else {
      this._state.replaceHighlightedFeatures([]);
    }
  }

  ngOnDestroy(): void {
    this._state.replaceHighlightedFeatures([]);
  }

  highlightElement(element: { id: string }, value) {
    if (!this.allHighlighted) {
      this._state.updateFeatureHighlighted(element.id, value);
    }
  }

  private transformCoordinates(coordinates: Coordinate) {
    const transformed = transform(coordinates, mercatorProjection!, coordinatesProjection!);

    return transformed
      .map((coord) => coord.toPrecision(5))
      .reverse()
      .join(', ');
  }

  private mapCoordinates(coordinates: Coordinate | Coordinate[] | undefined) {
    while (Array.isArray(coordinates?.[0])) {
      coordinates = coordinates[0];
    }

    return coordinates as Coordinate | undefined;
  }

  private containsNumber(reportNumber: number) {
    return (element: ZsMapBaseDrawElement<ZsMapDrawElementState>) =>
      Array.isArray(element.elementState?.reportNumber) ?
        element.elementState.reportNumber.includes(reportNumber)
      : element.elementState?.reportNumber === reportNumber;
  }

  openJournalClick(event: Event) {
    event.stopPropagation();
    void this._router.navigate([{ outlets: { [PRIMARY_OUTLET]: ['main', 'journal'], sidebar: null } }], {
      queryParams: { messageNumber: this.entry().messageNumber },
    });
  }

  getElementName(element: { id?: string; elementState?: ZsMapDrawElementState }): string {
    const stateFromService = element.id ? this._state.getDrawElementState(element.id) : undefined;
    const name = stateFromService?.name?.trim() || element.elementState?.name?.trim();
    return name || '';
  }

  getSymbolName(element: { elementState?: ZsMapDrawElementState }): string {
    const symbolId = element.elementState?.symbolId;
    if (symbolId) {
      const sign = Signs.getSignById(symbolId);
      if (sign) {
        return this.i18n.getLabelForSign(sign);
      }
    }
    return '';
  }

  startEditing(element: { id: string; elementState?: ZsMapDrawElementState }) {
    this.editingValue.set(element.elementState?.name || '');
    this.editingElementId.set(element.id);

    setTimeout(() => {
      const input = document.querySelector('.signature-name-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  saveElementName(element: { id: string; elementState?: ZsMapDrawElementState }, newName?: string) {
    if (!element.id || this.editingElementId() !== element.id) {
      return;
    }

    const valueToSave = newName !== undefined ? newName : this.editingValue();
    const trimmedValue = valueToSave.trim();

    this.editingElementId.set(null);
    this.editingValue.set('');

    this._state.updateDrawElementState(element.id, 'name', trimmedValue);

    const el = this._state.getDrawElement(element.id);
    if (el) {
      const feature = el.getOlFeature();
      if (feature) {
        const sig = feature.get('sig');
        if (sig) {
          sig.label = trimmedValue;
          feature.changed();
        }
      }
      el.updateElementState((draft) => {
        draft.name = trimmedValue;
      });
    }

    this.refreshTrigger.set(this.refreshTrigger() + 1);
  }

  cancelEditing() {
    this.editingElementId.set(null);
    this.editingValue.set('');
  }

  updateEditingValue(value: string) {
    this.editingValue.set(value);
  }

  handleInputKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.code === 'Space') {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  handleButtonKeydown(event: KeyboardEvent, elementId: string) {
    if ((event.key === ' ' || event.code === 'Space') && this.editingElementId() === elementId) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  handleButtonClick(event: MouseEvent, element: { id: string; coordinates: Coordinate | undefined }) {
    if (this.editingElementId() === element.id) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.navigateTo(element);
  }

  addSignature() {
    this._sidebar.close();
    this.journal.startDrawing(this.entry(), true);
  }

  noSignatureNeeded() {
    this.journal.markAsDrawn(this.entry(), true);
  }

  focusSignatures() {
    this.zoomToAll();
    if (!this.allHighlighted) {
      this.toggleHighlightAll();
    }
  }

  hasIncompleteSignatures(): boolean {
    return this.entry().isDrawnOnMap;
  }

  markAsNotDrawn() {
    this.journal.markAsDrawn(this.entry(), false);
  }

  deleteSignature(element: { id: string; elementState?: ZsMapDrawElementState }) {
    if (!element.id) {
      return;
    }

    const confirm = this._dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('removeFeatureFromMapConfirm'),
    });
    confirm.afterClosed().subscribe((r) => {
      if (r && element.id) {
        this._state.removeDrawElement(element.id);
      }
    });
  }
}
