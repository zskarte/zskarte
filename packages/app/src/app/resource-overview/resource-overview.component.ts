import { Component, DestroyRef, inject } from '@angular/core';
import { ZsMapStateService } from '../state/state.service';
import { I18NService } from '../state/i18n.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HierarchyLevel, ZsMapDrawElementState } from '@zskarte/types';
import { map } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe } from '@angular/common';

interface ResourceRow {
  id: string;
  organization: string;
  formationLocation: string;
  hierarchyLevel: string;
  formationNumber: string;
  formationDetail: string;
  additionalInfo: string;
}

@Component({
  selector: 'app-resource-overview',
  imports: [MatTableModule, AsyncPipe],
  templateUrl: './resource-overview.component.html',
  styleUrl: './resource-overview.component.scss',
})
export class ResourceOverviewComponent {
  private state = inject(ZsMapStateService);
  private destroyRef = inject(DestroyRef);
  i18n = inject(I18NService);

  readonly FORMATION_SIGN_ID = 210;

  displayedColumns: string[] = ['organization', 'formationLocation', 'hierarchyLevel', 'formationNumber', 'formationDetail', 'additionalInfo'];

  resources$ = this.state.observeDrawElements().pipe(
    takeUntilDestroyed(this.destroyRef),
    map(elements => elements
      .filter(e => e.elementState?.symbolId === this.FORMATION_SIGN_ID)
      .map(e => this.mapToResourceRow(e.elementState as ZsMapDrawElementState))
    )
  );

  private mapToResourceRow(state: ZsMapDrawElementState): ResourceRow {
    return {
      id: state.id ?? '',
      organization: state.organization ?? '',
      formationLocation: state.formationLocation ?? '',
      hierarchyLevel: this.getHierarchyLabel(state.hierarchyLevel),
      formationNumber: state.formationNumber ?? '',
      formationDetail: state.formationDetail ?? '',
      additionalInfo: state.additionalInfo ?? '',
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
}
