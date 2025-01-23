import { AsyncPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, Observable, filter, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';
import { SessionService } from 'src/app/session/session.service';
import { I18NService } from 'src/app/state/i18n.service';
import { ZsMapStateService } from 'src/app/state/state.service';
import { IZsMapSnapshot, IZsMapSnapshots } from '@zskarte/types';

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
  private destroyRef = inject(DestroyRef);

  readonly paginator = viewChild.required(MatPaginator);

  snapshots$? = new BehaviorSubject<IZsMapSnapshots | undefined>(undefined);
  resultSize?: number;
  apiPath = '/api/map-snapshots';

  async ngAfterViewInit() {
    const destroy$ = new Observable<void>((observer) => {
      this.destroyRef.onDestroy(() => observer.next());
    });

    this.paginator()
      .page.pipe(
        startWith({ pageIndex: 0 }),
        switchMap(async (p) => {
          const page = p.pageIndex + 1;
          const operationId = this.sessionService.getOperationId();
          const response = await this.apiService.get<IZsMapSnapshots>(
            `${this.apiPath}?fields[0]=createdAt&operationId=${operationId}&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=20`,
            { keepMeta: true },
          );
          return response.result;
        }),
        tap((r) => {
          this.resultSize = r?.meta.pagination.total;
        }),
        filter((r) => !!r),
        takeUntil(destroy$),
      )
      .subscribe((result) => this.snapshots$!.next(result));
  }

  async setHistory(snapshot: IZsMapSnapshot) {
    const { result } = await this.apiService.get(`${this.apiPath}/${snapshot.documentId}`);

    this.stateService.setMapState(result.mapState);

    this.snackBarService.open(
      `${this.i18n.get('toastSnapshotApplied')}: ${snapshot.createdAt.toLocaleString()}`,
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
