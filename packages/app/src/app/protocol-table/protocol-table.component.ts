import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AfterViewInit, OnDestroy, Component, DestroyRef, OnInit, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ZsMapStateService } from 'src/app/state/state.service';
import { mapProtocolEntry, ProtocolEntry } from '../helper/protocolEntry';
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
import { Subject } from 'rxjs';

@Component({
  selector: 'app-protocol-table',
  standalone: true,
  templateUrl: './protocol-table.component.html',
  styleUrls: ['./protocol-table.component.scss'],
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, ProjectionSelectionComponent, FormsModule, DialogHeaderComponent, DialogBodyComponent, MatCard, MatPaginatorModule, MatSortModule],
})
export class ProtocolTableComponent implements OnInit, OnDestroy, AfterViewInit {
  zsMapStateService = inject(ZsMapStateService);
  i18n = inject(I18NService);
  private datePipe = inject(DatePipe);
  private session = inject(SessionService);
  private _destroyRef = inject(DestroyRef);

  private _ngUnsubscribe = new Subject<void>();
  projectionFormatIndex = 0;
  numerical = false;

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild.required(MatPaginator);

  ngOnInit(): void {
    this.zsMapStateService.observeDrawElements().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(this.updateTable.bind(this));
  }

  ngAfterViewInit() {
    this.protocolTableDataSource.sort = this.sort() ?? null;
    this.protocolTableDataSource.paginator = this.paginator() ?? null;

    // yes it is a little bit hacky, and the official solution is different but it works for now.
    this.paginator()._intl.itemsPerPageLabel = this.i18n.get('paginationItemsPerPage');
    this.paginator()._intl.previousPageLabel = this.i18n.get('paginationPrevPage');
    this.paginator()._intl.nextPageLabel = this.i18n.get('paginationNextPage');
    this.paginator()._intl.firstPageLabel = this.i18n.get('paginationFirstPage');
    this.paginator()._intl.lastPageLabel = this.i18n.get('paginationLastPage');
  }

  updateTable(elements: ZsMapBaseDrawElement[]) {
    this.data = mapProtocolEntry(elements, this.datePipe, this.i18n, this.session.getLocale(), this.projectionFormatIndex, this.numerical);
    this.protocolTableDataSource.data = this.data;
  }

  updateProjection(value: ChangeType) {
    this.projectionFormatIndex = value.projectionFormatIndex ?? this.projectionFormatIndex;
    this.numerical = value.numerical ?? this.numerical;
    this.zsMapStateService.observeDrawElements().pipe(first()).subscribe(this.updateTable.bind(this));
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  public data: ProtocolEntry[] = [];

  public protocolTableDataSource = new MatTableDataSource([] as ProtocolEntry[]);

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

  navigateTo(element: ProtocolEntry) {
    this.zsMapStateService.setSelectedFeature(element.id);
    const extent = this.zsMapStateService.getDrawElement(element.id)?.getOlFeature()?.getGeometry()?.getExtent();
    if (extent) {
      this.zsMapStateService.setMapCenter(getCenter(extent));
    }
  }
}
