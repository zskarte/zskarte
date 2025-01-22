import { AsyncPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, filter, startWith, switchMap, tap } from 'rxjs';
import {  ApiService } from 'src/app/api/api.service';
import { StrapiApiResponseList } from 'src/app/helper/strapi-utils';
import { SessionService } from 'src/app/session/session.service';
import { I18NService } from 'src/app/state/i18n.service';
import { ZsMapStateService } from 'src/app/state/state.service';

type Snapshot = {
  id: number;
  attributes: {
    createdAt: Date;
  };
};
type Snapshots = StrapiApiResponseList<Snapshot[]>;

@Component({
  selector: 'app-sidebar-history',
  templateUrl: './sidebar-history.component.html',
  styleUrls: ['./sidebar-history.component.scss'],
  imports: [MatTableModule, AsyncPipe, MatPaginatorModule, DatePipe, MatButtonModule],
})
export class SidebarHistoryComponent implements AfterViewInit {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private stateService = inject(ZsMapStateService);
  private snackBarService = inject(MatSnackBar);

  readonly paginator = viewChild.required(MatPaginator);

  snapshots$?: BehaviorSubject<Snapshots>;
  resultSize?: number;
  apiPath = '/api/map-snapshots';

  async ngAfterViewInit() {
    this.paginator()
      .page.pipe(
        startWith({ pageIndex: 0 }),
        switchMap(async (p) => {
          const page = p.pageIndex + 1;
          const operationId = this.sessionService.getOperationId();
          const response = await this.apiService.get<Snapshots>(
            `${this.apiPath}?fields[0]=createdAt&operationId=${operationId}&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=20`,
            { keepMeta: true },
          );
          return response.result;
        }),
        tap((r) => {
          this.resultSize = r?.meta.pagination.total;
        }),
        filter((r) => !!r),
        takeUntilDestroyed(),
      )
      .subscribe(this.snapshots$);
  }

  async setHistory(snapshot: Snapshot) {
    const { result } = await this.apiService.get(`${this.apiPath}/${snapshot.id}`);

    this.stateService.setMapState(result.mapState);

    this.snackBarService.open(
      `${this.i18n.get('toastSnapshotApplied')}: ${snapshot.attributes.createdAt.toLocaleString()}`,
      'OK',
      {
        duration: 2000,
      },
    );
  }

  setCurrent() {
    this.stateService.refreshMapState();
  }
}
