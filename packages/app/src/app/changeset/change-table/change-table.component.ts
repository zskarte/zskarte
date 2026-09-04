import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ZsMapStateService } from '../../state/state.service';
import { SessionService } from '../../session/session.service';
import { I18NService } from '../../state/i18n.service';
import { getCenter } from 'ol/extent';
import { ChangeType, ProjectionSelectionComponent } from '../../projection-selection/projection-selection.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DialogBodyComponent, DialogHeaderComponent } from '../../ui/dialog-layout';
import { MatCard } from '@angular/material/card';
import { projectionByIndex } from '../../helper/projections';
import { ChangeEntry, IZsChangeset, IZsMapOperation, ZsMapState } from '@zskarte/types';
import { ChangesetService } from '../changeset.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { mapChangeEntry } from '../../helper/changeEntry';
import { SigningService } from '../signing.service';

@Component({
  selector: 'app-change-table',
  templateUrl: './change-table.component.html',
  styleUrl: './change-table.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    ProjectionSelectionComponent,
    FormsModule,
    DialogHeaderComponent,
    DialogBodyComponent,
    MatCard,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ChangeTableComponent implements AfterViewInit {
  zsMapStateService = inject(ZsMapStateService);
  i18n = inject(I18NService);
  projectionFormatIndex = 0;
  numerical = false;
  readonly sort = viewChild(MatSort);
  public data: ChangeEntry[] = [];
  public changeTableTableDataSource = new MatTableDataSource([] as ChangeEntry[]);
  public technicalFields = false;
  displayedColumnsTechnical: string[] = [
    'changesetId',
    'date',
    'signValid',
    'author',
    'elemId',
    'action',
    'group',
    'sign',
    'changedProperties',
    'coordChange',
    //'location',
    'centroid',
    'reportNumber',
    'label',
    'description',
    'detailButton',
  ];
  displayedColumnsReduzed: string[] = [
    'date',
    'author',
    'action',
    'group',
    'sign',
    'changedProperties',
    'coordChange',
    //'location',
    'centroid',
    'reportNumber',
    'label',
    'description',
  ];
  displayedColumns = this.displayedColumnsReduzed;
  private datePipe = inject(DatePipe);
  private signing = inject(SigningService);
  private session = inject(SessionService);
  private state = inject(ZsMapStateService);
  private changesetService = inject(ChangesetService);
  private mapState: ZsMapState | undefined;
  private operation: IZsMapOperation | undefined;

  constructor() {
    this.operation = this.session.getOperation();
    if (this.operation?.changesets) {
      firstValueFrom(this.state.observeMapState()).then((mapState) => {
        this.mapState = this.changesetService.stashCurrentChangesetTemporary(mapState);
        this.updateTable();
      });
    }
  }

  ngAfterViewInit() {
    const sort = this.sort();
    if (this.changeTableTableDataSource && sort) {
      this.changeTableTableDataSource.sort = sort;
    }
    this.changeTableTableDataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'date': {
          return item.dateNumeric;
        }
        case 'reportNumber': {
          const value = item.reportNumber;
          if (value) {
            return parseInt(value.split(', ')[0]);
          } else {
            return value;
          }
        }
        default:
          return item[property]?.toString().toLowerCase();
      }
    };
  }

  async updateTable() {
    if (this.mapState && this.operation) {
      this.data = await mapChangeEntry(
        this.mapState,
        this.datePipe,
        this.i18n,
        this.signing,
        this.operation,
        projectionByIndex(this.projectionFormatIndex),
        this.numerical,
      );
      this.changeTableTableDataSource.data = this.data;
    }
  }

  public showTechnicalFields(newVal: boolean) {
    this.technicalFields = newVal;
    if (this.technicalFields) {
      this.displayedColumns = this.displayedColumnsTechnical;
    } else {
      this.displayedColumns = this.displayedColumnsReduzed;
    }
  }

  async updateProjection(value: ChangeType) {
    this.projectionFormatIndex = value.projectionFormatIndex ?? this.projectionFormatIndex;
    this.numerical = value.numerical ?? this.numerical;
    this.updateTable();
  }

  navigateTo(element: ChangeEntry) {
    if (element.elemId) {
      this.zsMapStateService.setSelectedFeature(element.elemId);
      const extent = this.zsMapStateService.getDrawElement(element.elemId)?.getOlFeature()?.getGeometry()?.getExtent();
      if (extent) {
        this.zsMapStateService.setMapCenter(getCenter(extent));
      }
    }
  }

  showOriginalChangeset(changeset: IZsChangeset) {
    if (changeset) {
      this.changesetService.showChangesetJSON(changeset);
    }
  }
}
