import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AfterViewInit, Component, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ZsMapStateService } from 'src/app/state/state.service';
import { mapListViewEntry, ListViewEntry } from '../helper/listViewEntry';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { SessionService } from '../session/session.service';
import { I18NService } from '../state/i18n.service';
import { getCenter } from 'ol/extent';
import { ChangeType, ProjectionSelectionComponent } from '../projection-selection/projection-selection.component';
import { first } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DialogHeaderComponent, DialogBodyComponent } from "../ui/dialog-layout";
import { MatCard } from "@angular/material/card";
import { projectionByIndex } from '../helper/projections';

@Component({
  selector: 'app-list-view-table',
  templateUrl: './list-view-table.component.html',
  styleUrls: ['./list-view-table.component.scss'],
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, ProjectionSelectionComponent, FormsModule, DialogHeaderComponent, DialogBodyComponent, MatCard, MatSortModule],
})
export class ListViewTableComponent implements OnInit, OnDestroy, AfterViewInit {
  zsMapStateService = inject(ZsMapStateService);
  i18n = inject(I18NService);
  private datePipe = inject(DatePipe);
  private session = inject(SessionService);

  private _ngUnsubscribe = new Subject<void>();
  projectionFormatIndex = 0;
  numerical = false;

  readonly sort = viewChild(MatSort);

  ngOnInit(): void {
    this.zsMapStateService.observeDrawElements().pipe(takeUntil(this._ngUnsubscribe)).subscribe(this.updateTable.bind(this));
  }

  ngAfterViewInit() {
    const sort = this.sort();
    if (this.listViewTableDataSource && sort) {
      this.listViewTableDataSource.sort = sort;
    }
    this.listViewTableDataSource.sortingDataAccessor = (item: any, property: string) => {
      switch(property) {
        case 'date': {
          return item.dateNumeric;
        }
        case 'reportNumber': {
          const value = item.reportNumber;
          if (value){
            return parseInt(value.split(', ')[0])
          } else {
            return value;
          }
        }
        default:
          return (item[property] as string)?.toLowerCase();
      }
    };
  }

  updateTable(elements: ZsMapBaseDrawElement[]) {
    this.data = mapListViewEntry(elements, this.datePipe, this.i18n, this.session.getLocale(), projectionByIndex(this.projectionFormatIndex), this.numerical);
    this.listViewTableDataSource.data = this.data;
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  updateProjection(value: ChangeType) {
    this.projectionFormatIndex = value.projectionFormatIndex ?? this.projectionFormatIndex;
    this.numerical = value.numerical ?? this.numerical;
    this.zsMapStateService.observeDrawElements().pipe(first()).subscribe(this.updateTable.bind(this));
  }

  public data: ListViewEntry[] = [];

  public listViewTableDataSource = new MatTableDataSource([] as ListViewEntry[]);

  displayedColumns: string[] = [
    //'id',
    'date',
    'group',
    'sign',
    //'location',
    'centroid',
    //'size',
    'reportNumber',
    'label',
    'description',
  ];

  navigateTo(element: ListViewEntry) {
    this.zsMapStateService.setSelectedFeature(element.id);
    const extent = this.zsMapStateService.getDrawElement(element.id)?.getOlFeature()?.getGeometry()?.getExtent();
    if (extent) {
      this.zsMapStateService.setMapCenter(getCenter(extent));
    }
  }
}
