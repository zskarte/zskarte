import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
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
import { SidebarService } from '../sidebar.service';
import { I18NService } from 'src/app/state/i18n.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar-journal-entry',
  imports: [DatePipe, MatListModule, MatIcon],
  templateUrl: './sidebar-journal-entry.component.html',
  styleUrls: ['./sidebar-journal-entry.component.scss']
})
export class SidebarJournalEntryComponent {
  private _state = inject(ZsMapStateService);
  private _sidebar = inject(SidebarService);

  i18n = inject(I18NService);

  entry = input.required<JournalEntry>();

  elements = toSignal(this._state.observeDrawElements());
  entryElements = computed(() =>
    this.elements()
      ?.filter(this.containsNumber(this.entry().messageNumber))
      .map(el => {
        const coordinates = this.mapCoordinates(el.elementState?.coordinates);
        const imageSrc = Signs.getSignById(el.elementState?.symbolId)?.src;
        return { 
          ...el, 
          imageUrl: imageSrc ? DrawStyle.getImageUrl(imageSrc) : undefined,
          coordinates,
          coordinatesStr: coordinates ? this.transformCoordinates(coordinates) : ''
        }
      }) ?? []
  );

  navigateTo(coordinates: number[] | undefined) {
    if (coordinates) {
      this._state.setMapCenter(coordinates);
      this._state.setMapZoom(15);
      this._sidebar.close();
    }
  } 

  private transformCoordinates(coordinates: number[]) {
    const transformed = transform(coordinates, mercatorProjection!, coordinatesProjection!);

    return transformed.map(coord => coord.toPrecision(5)).reverse().join(', ');
  }

  private mapCoordinates(coordinates: number[] | number[][] | undefined) {
    while (Array.isArray(coordinates?.[0])) {
      coordinates = coordinates[0];
    }

    return coordinates as number[] | undefined;
  }

  private containsNumber(reportNumber: number) {
    return (element: ZsMapBaseDrawElement<ZsMapDrawElementState>) => 
        Array.isArray(element.elementState?.reportNumber) 
          ? element.elementState.reportNumber.includes(reportNumber)
          : element.elementState?.reportNumber === reportNumber;
  }
}
