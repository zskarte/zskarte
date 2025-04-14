import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input } from '@angular/core';
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
import { filter, skip, take } from 'rxjs';
import { createEmpty as createEmptyExtent, extend as extendExtent } from 'ol/extent';
import { MapRendererService } from 'src/app/map-renderer/map-renderer.service';
import { SearchService } from 'src/app/search/search.service';
import { ReplaceAllAddressTokensPipe } from "../../search/replace-all-address-tokens.pipe";

@Component({
  selector: 'app-sidebar-journal-entry',
  imports: [DatePipe, MatListModule, MatIcon, MatButtonModule, ReplaceAllAddressTokensPipe],
  templateUrl: './sidebar-journal-entry.component.html',
  styleUrls: ['./sidebar-journal-entry.component.scss'],
})
export class SidebarJournalEntryComponent implements OnDestroy {
  private _state = inject(ZsMapStateService);
  private _renderer = inject(MapRendererService);
  i18n = inject(I18NService);
  search = inject(SearchService);
  entry = input.required<JournalEntry>();
  allHighlighted = false;

  elements = toSignal(this._state.observeDrawElements());
  entryElements = computed(
    () =>
      this.elements()
        ?.filter(this.containsNumber(this.entry().messageNumber))
        .map((el) => {
          const coordinates = this.mapCoordinates(el.elementState?.coordinates);
          const imageSrc = Signs.getSignById(el.elementState?.symbolId)?.src;
          return {
            ...el,
            id: el.getId(),
            imageUrl: imageSrc ? DrawStyle.getImageUrl(imageSrc) : undefined,
            coordinates,
            coordinatesStr: coordinates ? this.transformCoordinates(coordinates) : '',
          };
        }) ?? [],
  );

  navigateTo(element: { id: string; coordinates: Coordinate | undefined }) {
    if (element.coordinates) {
      this._state.setMapCenter(element.coordinates);
      this._state.setSelectedFeature(element.id);
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
    this._renderer.zoomToFit(extent, [100, 600, 100, 100]);
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
          filter((v) => !elementIds.every((element) => v.includes(element))),
          take(1),
        )
        .subscribe((v) => (this.allHighlighted = false));
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
      Array.isArray(element.elementState?.reportNumber)
        ? element.elementState.reportNumber.includes(reportNumber)
        : element.elementState?.reportNumber === reportNumber;
  }
}
