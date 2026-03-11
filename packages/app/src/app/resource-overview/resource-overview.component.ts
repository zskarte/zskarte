import { Component, DestroyRef, inject } from '@angular/core';
import { ZsMapStateService } from '../state/state.service';
import { I18NService } from '../state/i18n.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HierarchyLevel, Sign, ZsMapDrawElementState } from '@zskarte/types';
import { map } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe } from '@angular/common';
import { DialogHeaderComponent, DialogBodyComponent } from '../ui/dialog-layout';
import { MatCard } from '@angular/material/card';
import { convertTo, projection_LV95 } from '../helper/projections';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { SimpleGeometry } from 'ol/geom';
import { getCenter } from 'ol/extent';

interface ResourceRow {
  id: string;
  organization: string;
  formationLocation: string;
  hierarchyLevel: string;
  formationNumber: string;
  formationDetail: string;
  additionalInfo: string;
  location: string;
}

@Component({
  selector: 'app-resource-overview',
  imports: [MatTableModule, AsyncPipe, DialogHeaderComponent, DialogBodyComponent, MatCard],
  templateUrl: './resource-overview.component.html',
  styleUrl: './resource-overview.component.scss',
})
export class ResourceOverviewComponent {
  private state = inject(ZsMapStateService);
  private destroyRef = inject(DestroyRef);
  i18n = inject(I18NService);

  readonly RESOURCE_SIGN_ID = [210];

  displayedColumns: string[] = [
    'organization',
    'formationLocation',
    'hierarchyLevel',
    'formationNumber',
    'formationDetail',
    'additionalInfo',
    'location',
  ];

  resources$ = this.state.observeDrawElements().pipe(
    takeUntilDestroyed(this.destroyRef),
    map((elements) =>
      elements
        .filter((e) => this.RESOURCE_SIGN_ID.includes(e.elementState?.symbolId as number))
        .map((e) => this.mapToResourceRow(e)),
    ),
  );

  private mapToResourceRow(element: ZsMapBaseDrawElement): ResourceRow {
    const state = element.elementState as ZsMapDrawElementState;
    const geometry = element.getOlFeature().getGeometry() as SimpleGeometry;
    return {
      id: state.id ?? '',
      organization: state.organization ?? '',
      formationLocation: state.formationLocation ?? String(state.coordinates) ?? '',
      hierarchyLevel: this.getHierarchyLabel(state.hierarchyLevel),
      formationNumber: state.formationNumber ?? '',
      formationDetail: state.formationDetail ?? '',
      additionalInfo: state.additionalInfo ?? '',
      location: convertTo(geometry.getCoordinates() || [], projection_LV95!, false) as string
    };
  }

  private getHierarchyLabel(level?: HierarchyLevel): string {
    if (!level) return '';
    switch (level) {
      case HierarchyLevel.TRUPP:
        return this.i18n.get('hierarchyTrupp');
      case HierarchyLevel.GRUPPE:
        return this.i18n.get('hierarchyGruppe');
      case HierarchyLevel.ZUG:
        return this.i18n.get('hierarchyZug');
      case HierarchyLevel.KOMPANIE:
        return this.i18n.get('hierarchyKompanie');
      case HierarchyLevel.BATAILLON:
        return this.i18n.get('hierarchyBataillon');
      default:
        return '';
    }
  }

  navigateTo(element: ZsMapDrawElementState) {
    if (element.id) {
      this.state.setSelectedFeature(element.id);
      const extent = this.state.getDrawElement(element.id)?.getOlFeature()?.getGeometry()?.getExtent();
      if (extent) {
        this.state.setMapCenter(getCenter(extent));
      }
    }
  }
}
