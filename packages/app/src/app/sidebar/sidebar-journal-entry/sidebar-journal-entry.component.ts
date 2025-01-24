import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { ZsMapDrawElementState } from '@zskarte/types';
import { Feature } from 'ol';
import { getCenter } from 'ol/extent';
import { Geometry, LineString, Point } from 'ol/geom';
import { transform } from 'ol/proj';
import { coordinatesProjection, lv03Projection, mercatorProjection, projections, swissProjection } from 'src/app/helper/projections';
import { JournalEntry } from 'src/app/journal/journal.types';
import { DrawStyle } from 'src/app/map-renderer/draw-style';
import { ZsMapBaseDrawElement } from 'src/app/map-renderer/elements/base/base-draw-element';
import { Signs } from 'src/app/map-renderer/signs';
import { ZsMapStateService } from 'src/app/state/state.service';

@Component({
  selector: 'app-sidebar-journal-entry',
  imports: [DatePipe, MatListModule],
  templateUrl: './sidebar-journal-entry.component.html',
  styleUrls: ['./sidebar-journal-entry.component.scss']
})
export class SidebarJournalEntryComponent {
  private _state = inject(ZsMapStateService)

  entry = input.required<JournalEntry>();
  elements = toSignal(this._state.observeDrawElements());
  entryElements = computed(() =>
    this.elements()
      ?.filter(this.containsNumber(this.entry().messageNumber))
      .map(el => {
        const coordinates = this.mapCoordinates(el.getOlFeature().getGeometry());
        return { 
          ...el, 
          imageUrl: DrawStyle.getImageUrl(Signs.getSignById(el.elementState?.symbolId)?.src ?? ''),
          coordinates,
          coordinatesStr: coordinates ? this.transformCoordinates(coordinates) : ''
        }
      })

  );

  transformCoordinates(coordinates: number[]) {
    const transformed = transform(coordinates, mercatorProjection!, coordinatesProjection!);

    return transformed.map(coord => coord.toPrecision(5)).reverse().join(', ');
  }

  mapCoordinates(geometry: Geometry | undefined) {
    if (!geometry) {
      return undefined;
    }

    switch (geometry.getType()) {
      case 'Point':
        return (geometry as Point).getCoordinates();  
      case 'LineString': 
        return (geometry as LineString).getCoordinateAt(0.5);
      default:
        const extent = geometry.getExtent();
        return extent ? getCenter(extent) : undefined;
    }
  }

  containsNumber(reportNumber: number) {
    return (element: ZsMapBaseDrawElement<ZsMapDrawElementState>) => 
        Array.isArray(element.elementState?.reportNumber) 
          ? element.elementState.reportNumber.includes(reportNumber)
          : element.elementState?.reportNumber === reportNumber;
  }
}
